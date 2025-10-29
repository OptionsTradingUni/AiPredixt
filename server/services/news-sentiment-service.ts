import axios from 'axios';
import * as cheerio from 'cheerio';
// @ts-ignore - No type definitions available
import Sentiment from 'sentiment';
// @ts-ignore - No type definitions available
import natural from 'natural';
// @ts-ignore - No type definitions available
import nlp from 'compromise';

/**
 * News Aggregation & Sentiment Analysis Service
 * 
 * Aggregates sports news from multiple sources and performs sentiment analysis:
 * - ESPN, BBC Sport, Sky Sports, The Athletic, etc.
 * - Analyzes sentiment (positive/negative/neutral)
 * - Extracts key entities (players, teams, injuries)
 * - Provides confidence scores
 * 
 * Uses:
 * - Sentiment.js for sentiment analysis
 * - Natural for NLP (tokenization, stemming)
 * - Compromise for entity extraction
 */

export interface NewsArticle {
  title: string;
  summary: string;
  url: string;
  source: string;
  publishedAt: string;
  sentiment: SentimentScore;
  entities: ExtractedEntities;
  keywords: string[];
}

export interface SentimentScore {
  score: number; // -5 to +5 (negative to positive)
  comparative: number; // normalized score
  classification: 'positive' | 'negative' | 'neutral';
  confidence: number; // 0 to 1
  positive: string[];
  negative: string[];
}

export interface ExtractedEntities {
  people: string[];
  places: string[];
  organizations: string[];
  keywords: string[];
}

export interface NewsAggregationResult {
  articles: NewsArticle[];
  overallSentiment: {
    average: number;
    classification: 'positive' | 'negative' | 'neutral' | 'mixed';
    distribution: {
      positive: number;
      negative: number;
      neutral: number;
    };
  };
  totalArticles: number;
  sources: string[];
}

export class NewsSentimentService {
  private sentiment: any;
  private tokenizer: any;
  private readonly USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

  constructor() {
    this.sentiment = new Sentiment();
    this.tokenizer = new natural.WordTokenizer();
  }

  /**
   * Analyze sentiment of text
   */
  analyzeSentiment(text: string): SentimentScore {
    const result = this.sentiment.analyze(text);
    
    const classification = 
      result.score > 1 ? 'positive' :
      result.score < -1 ? 'negative' :
      'neutral';

    const confidence = Math.min(Math.abs(result.comparative) * 2, 1);

    return {
      score: result.score,
      comparative: result.comparative,
      classification,
      confidence,
      positive: result.positive || [],
      negative: result.negative || [],
    };
  }

  /**
   * Extract entities from text using Compromise
   */
  extractEntities(text: string): ExtractedEntities {
    const doc = nlp(text);

    return {
      people: doc.people().out('array'),
      places: doc.places().out('array'),
      organizations: doc.organizations().out('array'),
      keywords: doc.topics().out('array'),
    };
  }

  /**
   * Extract keywords from text
   */
  extractKeywords(text: string, limit: number = 10): string[] {
    const tokens = this.tokenizer.tokenize(text.toLowerCase());
    
    // Remove common stop words
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those']);
    
    const filtered = tokens.filter((word: string) => 
      !stopWords.has(word) && word.length > 3
    );

    // Count frequency
    const frequency: Record<string, number> = {};
    filtered.forEach((word: string) => {
      frequency[word] = (frequency[word] || 0) + 1;
    });

    // Sort by frequency
    const sorted = Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([word]) => word);

    return sorted;
  }

  /**
   * Scrape ESPN news
   */
  async scrapeESPNNews(teamOrLeague: string, sport: string = 'soccer', limit: number = 5): Promise<NewsArticle[]> {
    try {
      console.log(`📰 Fetching ESPN news for ${teamOrLeague}...`);

      const sportMap: Record<string, string> = {
        soccer: 'soccer',
        basketball: 'nba',
        football: 'nfl',
        hockey: 'nhl',
        baseball: 'mlb',
        tennis: 'tennis',
      };

      const espnSport = sportMap[sport] || 'soccer';
      const url = `https://www.espn.com/${espnSport}/news`;

      const response = await axios.get(url, {
        headers: { 'User-Agent': this.USER_AGENT },
        timeout: 10000,
      });

      const $ = cheerio.load(response.data);
      const articles: NewsArticle[] = [];

      $('.contentItem, .news-feed__item').slice(0, limit).each((i, elem) => {
        const title = $(elem).find('h1, h2, h3, .contentItem__title').first().text().trim();
        const summary = $(elem).find('p, .contentItem__subhead').first().text().trim();
        const link = $(elem).find('a').first().attr('href');
        
        if (title) {
          const fullText = `${title} ${summary}`;
          const sentiment = this.analyzeSentiment(fullText);
          const entities = this.extractEntities(fullText);
          const keywords = this.extractKeywords(fullText, 5);

          articles.push({
            title,
            summary: summary || 'No summary available',
            url: link?.startsWith('http') ? link : `https://www.espn.com${link}`,
            source: 'ESPN',
            publishedAt: new Date().toISOString(),
            sentiment,
            entities,
            keywords,
          });
        }
      });

      console.log(`✅ Retrieved ${articles.length} articles from ESPN`);
      return articles;
    } catch (error: any) {
      console.error(`❌ ESPN news scraping error: ${error.message}`);
      return [];
    }
  }

  /**
   * Scrape BBC Sport news
   */
  async scrapeBBCNews(query: string, limit: number = 5): Promise<NewsArticle[]> {
    try {
      console.log(`📰 Fetching BBC Sport news for ${query}...`);

      const url = `https://www.bbc.co.uk/search?q=${encodeURIComponent(query + ' sport')}&filter=sport`;

      const response = await axios.get(url, {
        headers: { 'User-Agent': this.USER_AGENT },
        timeout: 15000,
      });

      const $ = cheerio.load(response.data);
      const articles: NewsArticle[] = [];

      $('article, .ssrcss-1f3bvyz-Stack').slice(0, limit).each((i, elem) => {
        const title = $(elem).find('h3, .ssrcss-15xko80-StyledHeading').first().text().trim();
        const summary = $(elem).find('p').first().text().trim();
        const link = $(elem).find('a').first().attr('href');

        if (title) {
          const fullText = `${title} ${summary}`;
          const sentiment = this.analyzeSentiment(fullText);
          const entities = this.extractEntities(fullText);
          const keywords = this.extractKeywords(fullText, 5);

          articles.push({
            title,
            summary: summary || 'No summary available',
            url: link?.startsWith('http') ? link : `https://www.bbc.co.uk${link}`,
            source: 'BBC Sport',
            publishedAt: new Date().toISOString(),
            sentiment,
            entities,
            keywords,
          });
        }
      });

      console.log(`✅ Retrieved ${articles.length} articles from BBC Sport`);
      return articles;
    } catch (error: any) {
      console.error(`❌ BBC Sport news scraping error: ${error.message}`);
      return [];
    }
  }

  /**
   * Scrape Sky Sports news
   */
  async scrapeSkySportsNews(sport: string = 'football', limit: number = 5): Promise<NewsArticle[]> {
    try {
      console.log(`📰 Fetching Sky Sports news for ${sport}...`);

      const url = `https://www.skysports.com/${sport}/news`;

      const response = await axios.get(url, {
        headers: { 'User-Agent': this.USER_AGENT },
        timeout: 10000,
      });

      const $ = cheerio.load(response.data);
      const articles: NewsArticle[] = [];

      $('.news-list__item, .sdc-site-tile').slice(0, limit).each((i, elem) => {
        const title = $(elem).find('.news-list__headline, .sdc-site-tile__headline').first().text().trim();
        const summary = $(elem).find('.news-list__snippet, .sdc-site-tile__description').first().text().trim();
        const link = $(elem).find('a').first().attr('href');

        if (title) {
          const fullText = `${title} ${summary}`;
          const sentiment = this.analyzeSentiment(fullText);
          const entities = this.extractEntities(fullText);
          const keywords = this.extractKeywords(fullText, 5);

          articles.push({
            title,
            summary: summary || 'No summary available',
            url: link?.startsWith('http') ? link : `https://www.skysports.com${link}`,
            source: 'Sky Sports',
            publishedAt: new Date().toISOString(),
            sentiment,
            entities,
            keywords,
          });
        }
      });

      console.log(`✅ Retrieved ${articles.length} articles from Sky Sports`);
      return articles;
    } catch (error: any) {
      console.error(`❌ Sky Sports news scraping error: ${error.message}`);
      return [];
    }
  }

  /**
   * Aggregate news from all sources and analyze sentiment
   */
  async aggregateNewsWithSentiment(
    query: string,
    sport: string = 'football',
    articlesPerSource: number = 5
  ): Promise<NewsAggregationResult> {
    console.log(`🌐 Aggregating news from multiple sources for ${query}...`);

    // Gather from all sources in parallel
    const [espnArticles, bbcArticles, skyArticles] = await Promise.all([
      this.scrapeESPNNews(query, sport, articlesPerSource),
      this.scrapeBBCNews(query, articlesPerSource),
      this.scrapeSkySportsNews(sport, articlesPerSource),
    ]);

    const allArticles = [...espnArticles, ...bbcArticles, ...skyArticles];

    // Calculate overall sentiment
    const sentiments = allArticles.map(a => a.sentiment.score);
    const averageSentiment = sentiments.length > 0 
      ? sentiments.reduce((a, b) => a + b, 0) / sentiments.length 
      : 0;

    const distribution = {
      positive: allArticles.filter(a => a.sentiment.classification === 'positive').length,
      negative: allArticles.filter(a => a.sentiment.classification === 'negative').length,
      neutral: allArticles.filter(a => a.sentiment.classification === 'neutral').length,
    };

    const overallClassification = 
      distribution.positive > distribution.negative + distribution.neutral ? 'positive' :
      distribution.negative > distribution.positive + distribution.neutral ? 'negative' :
      distribution.positive === distribution.negative ? 'mixed' :
      'neutral';

    const sources = [...new Set(allArticles.map(a => a.source))];

    console.log(`✅ Aggregated ${allArticles.length} articles from ${sources.length} sources`);
    console.log(`📊 Overall sentiment: ${overallClassification} (score: ${averageSentiment.toFixed(2)})`);

    return {
      articles: allArticles,
      overallSentiment: {
        average: averageSentiment,
        classification: overallClassification,
        distribution,
      },
      totalArticles: allArticles.length,
      sources,
    };
  }

  /**
   * Analyze team sentiment from recent news
   */
  async getTeamSentiment(teamName: string, sport: string = 'football'): Promise<{
    teamName: string;
    sentiment: string;
    score: number;
    confidence: number;
    recentHeadlines: string[];
    positiveSignals: string[];
    negativeSignals: string[];
  }> {
    console.log(`🎯 Analyzing sentiment for ${teamName}...`);

    const newsResult = await this.aggregateNewsWithSentiment(teamName, sport, 3);
    
    const positiveWords = new Set<string>();
    const negativeWords = new Set<string>();

    newsResult.articles.forEach(article => {
      article.sentiment.positive.forEach(word => positiveWords.add(word));
      article.sentiment.negative.forEach(word => negativeWords.add(word));
    });

    return {
      teamName,
      sentiment: newsResult.overallSentiment.classification,
      score: newsResult.overallSentiment.average,
      confidence: newsResult.articles.length > 0 
        ? newsResult.articles.reduce((sum, a) => sum + a.sentiment.confidence, 0) / newsResult.articles.length
        : 0,
      recentHeadlines: newsResult.articles.slice(0, 5).map(a => a.title),
      positiveSignals: Array.from(positiveWords).slice(0, 10),
      negativeSignals: Array.from(negativeWords).slice(0, 10),
    };
  }
}

export const newsSentimentService = new NewsSentimentService();
