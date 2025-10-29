import axios from 'axios';
import vaderSentiment from 'vader-sentiment';

/**
 * ESPN Hidden API News Scraper (FREE - No Auth Required)
 * 
 * ESPN has an unofficial but public API that doesn't require authentication.
 * This is a legitimate, free source for sports news and data.
 * 
 * Rate limit: Be respectful, add delays between requests
 */

export interface ESPNNewsArticle {
  headline: string;
  description: string;
  published: string;
  link: string;
  source: string;
  sport: string;
  images?: string[];
  sentiment: {
    score: number;
    classification: 'positive' | 'negative' | 'neutral';
    compound: number;
  };
}

export class ESPNNewsScraper {
  private readonly BASE_URL = 'https://site.api.espn.com/apis/site/v2/sports';
  private readonly USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
  private lastRequestTime = 0;
  private readonly REQUEST_DELAY = 1000; // 1 second between requests

  /**
   * Map our sport types to ESPN API paths
   */
  private getSportPath(sport: string): string {
    const sportMap: Record<string, string> = {
      'Football': 'soccer/eng.1', // Premier League
      'soccer': 'soccer/eng.1',
      'Basketball': 'basketball/nba',
      'basketball': 'basketball/nba',
      'nba': 'basketball/nba',
      'Hockey': 'hockey/nhl',
      'hockey': 'hockey/nhl',
      'nhl': 'hockey/nhl',
      'Tennis': 'tennis/atp',
      'tennis': 'tennis/atp',
      'nfl': 'football/nfl',
    };

    return sportMap[sport] || sportMap[sport.toLowerCase()] || 'football/nfl';
  }

  /**
   * Enforce rate limiting
   */
  private async enforceRateLimit(): Promise<void> {
    const elapsed = Date.now() - this.lastRequestTime;
    if (elapsed < this.REQUEST_DELAY) {
      await new Promise(resolve => setTimeout(resolve, this.REQUEST_DELAY - elapsed));
    }
    this.lastRequestTime = Date.now();
  }

  /**
   * Analyze sentiment using VADER (industry-standard for news)
   */
  private analyzeSentiment(text: string) {
    const result = vaderSentiment.SentimentIntensityAnalyzer.polarity_scores(text);
    
    let classification: 'positive' | 'negative' | 'neutral' = 'neutral';
    if (result.compound >= 0.05) {
      classification = 'positive';
    } else if (result.compound <= -0.05) {
      classification = 'negative';
    }

    return {
      score: result.compound * 100, // Scale to -100 to +100
      classification,
      compound: result.compound,
    };
  }

  /**
   * Fetch real news from ESPN Hidden API
   */
  async fetchNews(sport: string, limit: number = 20): Promise<ESPNNewsArticle[]> {
    await this.enforceRateLimit();

    try {
      const sportPath = this.getSportPath(sport);
      const url = `${this.BASE_URL}/${sportPath}/news`;

      console.log(`🔍 Fetching real ESPN news for ${sport} from: ${url}`);

      const response = await axios.get(url, {
        headers: { 'User-Agent': this.USER_AGENT },
        timeout: 10000,
      });

      if (!response.data || !response.data.articles) {
        console.log('⚠️  No news articles found in ESPN response');
        return [];
      }

      const articles = response.data.articles.slice(0, limit);
      
      const newsArticles: ESPNNewsArticle[] = articles.map((article: any) => {
        const headline = article.headline || article.title || '';
        const description = article.description || '';
        const fullText = `${headline} ${description}`;
        
        return {
          headline,
          description,
          published: article.published || new Date().toISOString(),
          link: article.links?.web?.href || article.link || '',
          source: 'ESPN',
          sport,
          images: article.images?.map((img: any) => img.url).filter(Boolean) || [],
          sentiment: this.analyzeSentiment(fullText),
        };
      });

      console.log(`✅ Successfully fetched ${newsArticles.length} REAL news articles from ESPN`);
      return newsArticles;
      
    } catch (error: any) {
      console.error(`❌ Failed to fetch ESPN news: ${error.message}`);
      return [];
    }
  }

  /**
   * Fetch news for a specific team
   */
  async fetchTeamNews(teamName: string, sport: string, limit: number = 10): Promise<ESPNNewsArticle[]> {
    const allNews = await this.fetchNews(sport, 50);
    
    // Filter for team-specific news
    const teamNews = allNews.filter(article => {
      const searchText = `${article.headline} ${article.description}`.toLowerCase();
      return searchText.includes(teamName.toLowerCase());
    }).slice(0, limit);

    console.log(`🔍 Found ${teamNews.length} articles mentioning ${teamName}`);
    return teamNews;
  }

  /**
   * Fetch breaking news (most recent)
   */
  async fetchBreakingNews(sport: string, hoursBack: number = 24): Promise<ESPNNewsArticle[]> {
    const allNews = await this.fetchNews(sport, 30);
    
    const cutoffTime = new Date(Date.now() - (hoursBack * 60 * 60 * 1000));
    
    const recentNews = allNews.filter(article => {
      const publishedDate = new Date(article.published);
      return publishedDate >= cutoffTime;
    });

    console.log(`📰 Found ${recentNews.length} breaking news articles in last ${hoursBack} hours`);
    return recentNews;
  }

  /**
   * Get overall sentiment for a team based on recent news
   */
  async getTeamSentiment(teamName: string, sport: string): Promise<{
    overall: 'positive' | 'negative' | 'neutral';
    score: number;
    articleCount: number;
  }> {
    const teamNews = await this.fetchTeamNews(teamName, sport, 20);
    
    if (teamNews.length === 0) {
      return {
        overall: 'neutral',
        score: 0,
        articleCount: 0,
      };
    }

    const avgScore = teamNews.reduce((sum, article) => sum + article.sentiment.score, 0) / teamNews.length;
    
    let overall: 'positive' | 'negative' | 'neutral' = 'neutral';
    if (avgScore >= 5) {
      overall = 'positive';
    } else if (avgScore <= -5) {
      overall = 'negative';
    }

    return {
      overall,
      score: avgScore,
      articleCount: teamNews.length,
    };
  }
}

export const espnNewsScraper = new ESPNNewsScraper();
