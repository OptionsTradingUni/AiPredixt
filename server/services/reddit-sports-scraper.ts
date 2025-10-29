import axios from 'axios';
import vaderSentiment from 'vader-sentiment';

/**
 * Reddit Sports Discussion Scraper (FREE - No API Key Required)
 * 
 * Uses Reddit's public .json endpoint which doesn't require authentication.
 * This is a legitimate way to access public Reddit data.
 * 
 * Subreddits scraped:
 * - r/sportsbook (500K+ members)
 * - r/sportsbetting (200K+ members)
 * - r/soccer, r/nba, r/nfl, r/hockey (sport-specific)
 */

export interface RedditPost {
  title: string;
  author: string;
  score: number;
  numComments: number;
  created: Date;
  url: string;
  selftext: string;
  subreddit: string;
  sentiment: {
    score: number;
    classification: 'positive' | 'negative' | 'neutral';
  };
  upvoteRatio: number;
}

export interface RedditSentimentSummary {
  overall: 'positive' | 'negative' | 'neutral' | 'mixed';
  avgScore: number;
  totalPosts: number;
  distribution: {
    positive: number;
    negative: number;
    neutral: number;
  };
  topKeywords: string[];
}

export class RedditSportsScraper {
  private readonly BASE_URL = 'https://www.reddit.com';
  private readonly USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
  private lastRequestTime = 0;
  private readonly REQUEST_DELAY = 2000; // 2 seconds to be respectful

  /**
   * Map sports to relevant subreddits
   */
  private getSubredditsForSport(sport: string): string[] {
    const sportMap: Record<string, string[]> = {
      'Football': ['soccer', 'PremierLeague', 'sportsbook', 'SoccerBetting'],
      'soccer': ['soccer', 'PremierLeague', 'sportsbook', 'SoccerBetting'],
      'Basketball': ['nba', 'sportsbook', 'NBABetting'],
      'basketball': ['nba', 'sportsbook', 'NBABetting'],
      'Hockey': ['hockey', 'nhl', 'sportsbook'],
      'hockey': ['hockey', 'nhl', 'sportsbook'],
      'Tennis': ['tennis', 'sportsbook'],
      'tennis': ['tennis', 'sportsbook'],
    };

    return sportMap[sport] || ['sportsbook', 'sportsbetting'];
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
   * Analyze sentiment using VADER
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
      score: result.compound * 100,
      classification,
    };
  }

  /**
   * Scrape Reddit posts from a subreddit using .json endpoint (no API key needed)
   */
  async scrapeSubreddit(
    subreddit: string,
    sort: 'hot' | 'new' | 'top' | 'rising' = 'hot',
    limit: number = 50
  ): Promise<RedditPost[]> {
    await this.enforceRateLimit();

    try {
      const url = `${this.BASE_URL}/r/${subreddit}/${sort}.json`;
      const params = {
        limit: Math.min(limit, 100), // Reddit max is 100
        t: 'day', // For 'top', get last 24 hours
      };

      console.log(`🔍 Scraping r/${subreddit} (${sort})...`);

      const response = await axios.get(url, {
        headers: { 'User-Agent': this.USER_AGENT },
        params,
        timeout: 10000,
      });

      if (!response.data || !response.data.data || !response.data.data.children) {
        console.log('⚠️  No posts found');
        return [];
      }

      const posts = response.data.data.children
        .filter((child: any) => child.kind === 't3') // t3 = post
        .map((child: any) => {
          const post = child.data;
          const fullText = `${post.title} ${post.selftext || ''}`;
          
          return {
            title: post.title,
            author: post.author,
            score: post.score,
            numComments: post.num_comments,
            created: new Date(post.created_utc * 1000),
            url: `https://reddit.com${post.permalink}`,
            selftext: post.selftext || '',
            subreddit: post.subreddit,
            sentiment: this.analyzeSentiment(fullText),
            upvoteRatio: post.upvote_ratio,
          };
        });

      console.log(`✅ Scraped ${posts.length} REAL posts from r/${subreddit}`);
      return posts;
      
    } catch (error: any) {
      console.error(`❌ Failed to scrape r/${subreddit}: ${error.message}`);
      return [];
    }
  }

  /**
   * Search Reddit for sports discussions about a specific team/match
   */
  async searchSportsTalk(query: string, subreddit: string = 'sportsbook'): Promise<RedditPost[]> {
    await this.enforceRateLimit();

    try {
      const url = `${this.BASE_URL}/r/${subreddit}/search.json`;
      const params = {
        q: query,
        restrict_sr: 'on', // Search only this subreddit
        sort: 'relevance',
        t: 'week', // Last week
        limit: 50,
      };

      console.log(`🔍 Searching r/${subreddit} for: "${query}"`);

      const response = await axios.get(url, {
        headers: { 'User-Agent': this.USER_AGENT },
        params,
        timeout: 10000,
      });

      if (!response.data || !response.data.data || !response.data.data.children) {
        return [];
      }

      const posts = response.data.data.children
        .filter((child: any) => child.kind === 't3')
        .map((child: any) => {
          const post = child.data;
          const fullText = `${post.title} ${post.selftext || ''}`;
          
          return {
            title: post.title,
            author: post.author,
            score: post.score,
            numComments: post.num_comments,
            created: new Date(post.created_utc * 1000),
            url: `https://reddit.com${post.permalink}`,
            selftext: post.selftext || '',
            subreddit: post.subreddit,
            sentiment: this.analyzeSentiment(fullText),
            upvoteRatio: post.upvote_ratio,
          };
        });

      console.log(`✅ Found ${posts.length} posts matching "${query}"`);
      return posts;
      
    } catch (error: any) {
      console.error(`❌ Failed to search r/${subreddit}: ${error.message}`);
      return [];
    }
  }

  /**
   * Get social sentiment for a team from multiple subreddits
   */
  async getTeamSocialSentiment(teamName: string, sport: string): Promise<RedditSentimentSummary> {
    const subreddits = this.getSubredditsForSport(sport);
    const allPosts: RedditPost[] = [];

    // Search across multiple subreddits
    for (const subreddit of subreddits.slice(0, 2)) { // Limit to 2 to avoid rate limits
      const posts = await this.searchSportsTalk(teamName, subreddit);
      allPosts.push(...posts);
    }

    if (allPosts.length === 0) {
      return {
        overall: 'neutral',
        avgScore: 0,
        totalPosts: 0,
        distribution: { positive: 0, negative: 0, neutral: 0 },
        topKeywords: [],
      };
    }

    // Calculate sentiment distribution
    const distribution = {
      positive: allPosts.filter(p => p.sentiment.classification === 'positive').length,
      negative: allPosts.filter(p => p.sentiment.classification === 'negative').length,
      neutral: allPosts.filter(p => p.sentiment.classification === 'neutral').length,
    };

    const avgScore = allPosts.reduce((sum, p) => sum + p.sentiment.score, 0) / allPosts.length;

    // Determine overall sentiment
    let overall: 'positive' | 'negative' | 'neutral' | 'mixed' = 'neutral';
    if (distribution.positive > distribution.negative && distribution.positive > distribution.neutral) {
      overall = 'positive';
    } else if (distribution.negative > distribution.positive && distribution.negative > distribution.neutral) {
      overall = 'negative';
    } else if (distribution.positive > 0 && distribution.negative > 0) {
      overall = 'mixed';
    }

    // Extract top keywords from titles
    const allTitles = allPosts.map(p => p.title.toLowerCase()).join(' ');
    const words = allTitles.split(/\s+/);
    const wordFreq: Record<string, number> = {};
    
    words.forEach(word => {
      if (word.length > 3 && !['the', 'and', 'for', 'with'].includes(word)) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });

    const topKeywords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);

    return {
      overall,
      avgScore,
      totalPosts: allPosts.length,
      distribution,
      topKeywords,
    };
  }

  /**
   * Get trending sports topics from Reddit
   */
  async getTrendingTopics(sport: string): Promise<string[]> {
    const subreddits = this.getSubredditsForSport(sport);
    const trendingTopics: Set<string> = new Set();

    for (const subreddit of subreddits.slice(0, 2)) {
      const posts = await this.scrapeSubreddit(subreddit, 'hot', 10);
      
      posts.forEach(post => {
        const words = post.title.split(' ');
        words.forEach(word => {
          if (word.length > 4 && word[0] === word[0].toUpperCase()) {
            trendingTopics.add(word);
          }
        });
      });
    }

    return Array.from(trendingTopics).slice(0, 15);
  }
}

export const redditSportsScraper = new RedditSportsScraper();
