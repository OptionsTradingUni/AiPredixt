import Parser from 'rss-parser';
import axios from 'axios';
import { NewsItem } from '@shared/schema';
import { newsSentimentService } from './news-sentiment-service';

/**
 * Real News Service using FREE RSS Feeds and News APIs
 * 
 * Data Sources (ALL FREE):
 * 1. Google News RSS (completely free, no API key)
 * 2. ESPN RSS feeds (free sports news)
 * 3. BBC Sport RSS (free, high quality)
 * 4. Yahoo Sports RSS (free)
 * 5. TheScore.com RSS (free)
 * 6. NewsAPI.org (100 requests/day free tier)
 */

export class RealNewsService {
  private rssParser: Parser;
  private newsApiKey: string;
  private readonly NEWS_API_LIMIT = 100; // Free tier
  private apiCallsToday = 0;

  constructor() {
    this.rssParser = new Parser({
      customFields: {
        item: ['media:content', 'media:thumbnail'],
      },
    });
    this.newsApiKey = process.env.NEWS_API_KEY || '';
  }

  /**
   * Get sports news for a team using multiple free sources
   */
  async getTeamNews(teamName: string, sport: string): Promise<NewsItem[]> {
    console.log(`📰 Fetching real news for ${teamName}...`);

    const newsItems: NewsItem[] = [];

    // Try all free sources in parallel
    const [googleNews, espnNews, bbcNews, yahooNews, newsApiArticles] = await Promise.allSettled([
      this.getGoogleNews(teamName),
      this.getESPNNews(sport),
      this.getBBCNews(sport),
      this.getYahooNews(sport),
      this.getNewsAPIArticles(teamName),
    ]);

    // Combine all successful results
    if (googleNews.status === 'fulfilled') {
      newsItems.push(...googleNews.value);
    }
    if (espnNews.status === 'fulfilled') {
      newsItems.push(...espnNews.value);
    }
    if (bbcNews.status === 'fulfilled') {
      newsItems.push(...bbcNews.value);
    }
    if (yahooNews.status === 'fulfilled') {
      newsItems.push(...yahooNews.value);
    }
    if (newsApiArticles.status === 'fulfilled') {
      newsItems.push(...newsApiArticles.value);
    }

    // Filter for team-relevant news
    const relevantNews = newsItems.filter(item =>
      item.headline.toLowerCase().includes(teamName.toLowerCase()) ||
      item.summary.toLowerCase().includes(teamName.toLowerCase())
    );

    console.log(`✅ Found ${relevantNews.length} relevant news articles from ${newsItems.length} total`);
    
    return relevantNews.slice(0, 10); // Return top 10
  }

  /**
   * Google News RSS (FREE, no API key needed)
   */
  private async getGoogleNews(query: string): Promise<NewsItem[]> {
    try {
      const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
      const feed = await this.rssParser.parseURL(url);

      return feed.items.slice(0, 5).map(item => {
        const sentimentResult = newsSentimentService.analyzeSentiment(item.title + ' ' + (item.contentSnippet || ''));
        return {
          headline: item.title || 'No title',
          source: 'Google News',
          timestamp: item.pubDate || new Date().toISOString(),
          sentiment: sentimentResult.score > 0.3 ? 'positive' as const : sentimentResult.score < -0.3 ? 'negative' as const : 'neutral' as const,
          summary: item.contentSnippet?.slice(0, 200) || 'No summary available',
          fullSummary: item.content || item.contentSnippet,
          relevance: 'high' as const,
          category: this.categorizeNews(item.title || ''),
          url: item.link,
          publishDate: item.pubDate,
        };
      });
    } catch (error: any) {
      console.log(`⚠️  Google News failed: ${error.message}`);
      return [];
    }
  }

  /**
   * ESPN RSS Feeds (FREE)
   */
  private async getESPNNews(sport: string): Promise<NewsItem[]> {
    try {
      const sportMap: Record<string, string> = {
        Football: 'soccer',
        Basketball: 'nba',
        Hockey: 'nhl',
        Tennis: 'tennis',
      };

      const espnSport = sportMap[sport] || 'soccer';
      const url = `https://www.espn.com/espn/rss/${espnSport}/news`;
      const feed = await this.rssParser.parseURL(url);

      return feed.items.slice(0, 5).map(item => {
        const sentimentResult = newsSentimentService.analyzeSentiment(item.title + ' ' + (item.contentSnippet || ''));
        return {
          headline: item.title || 'No title',
          source: 'ESPN',
          timestamp: item.pubDate || new Date().toISOString(),
          sentiment: sentimentResult.score > 0.3 ? 'positive' as const : sentimentResult.score < -0.3 ? 'negative' as const : 'neutral' as const,
          summary: item.contentSnippet?.slice(0, 200) || 'No summary available',
          fullSummary: item.content || item.contentSnippet,
          relevance: 'high' as const,
          category: this.categorizeNews(item.title || ''),
          url: item.link,
          publishDate: item.pubDate,
        };
      });
    } catch (error: any) {
      console.log(`⚠️  ESPN RSS failed: ${error.message}`);
      return [];
    }
  }

  /**
   * BBC Sport RSS (FREE, high quality)
   */
  private async getBBCNews(sport: string): Promise<NewsItem[]> {
    try {
      const sportMap: Record<string, string> = {
        Football: 'football',
        Basketball: 'basketball',
        Hockey: 'ice-hockey',
        Tennis: 'tennis',
      };

      const bbcSport = sportMap[sport] || 'football';
      const url = `http://feeds.bbci.co.uk/sport/${bbcSport}/rss.xml`;
      const feed = await this.rssParser.parseURL(url);

      return feed.items.slice(0, 5).map(item => {
        const sentimentResult = newsSentimentService.analyzeSentiment(item.title + ' ' + (item.contentSnippet || ''));
        return {
          headline: item.title || 'No title',
          source: 'BBC Sport',
          timestamp: item.pubDate || new Date().toISOString(),
          sentiment: sentimentResult.score > 0.3 ? 'positive' as const : sentimentResult.score < -0.3 ? 'negative' as const : 'neutral' as const,
          summary: item.contentSnippet?.slice(0, 200) || 'No summary available',
          fullSummary: item.content || item.contentSnippet,
          relevance: 'high' as const,
          category: this.categorizeNews(item.title || ''),
          url: item.link,
          publishDate: item.pubDate,
        };
      });
    } catch (error: any) {
      console.log(`⚠️  BBC RSS failed: ${error.message}`);
      return [];
    }
  }

  /**
   * Yahoo Sports RSS (FREE)
   */
  private async getYahooNews(sport: string): Promise<NewsItem[]> {
    try {
      const sportMap: Record<string, string> = {
        Football: 'soccer',
        Basketball: 'nba',
        Hockey: 'nhl',
        Tennis: 'ten',
      };

      const yahooSport = sportMap[sport] || 'soccer';
      const url = `https://sports.yahoo.com/${yahooSport}/rss.xml`;
      const feed = await this.rssParser.parseURL(url);

      return feed.items.slice(0, 5).map(item => {
        const sentimentResult = newsSentimentService.analyzeSentiment(item.title + ' ' + (item.contentSnippet || ''));
        return {
          headline: item.title || 'No title',
          source: 'Yahoo Sports',
          timestamp: item.pubDate || new Date().toISOString(),
          sentiment: sentimentResult.score > 0.3 ? 'positive' as const : sentimentResult.score < -0.3 ? 'negative' as const : 'neutral' as const,
          summary: item.contentSnippet?.slice(0, 200) || 'No summary available',
          fullSummary: item.content || item.contentSnippet,
          relevance: 'medium' as const,
          category: this.categorizeNews(item.title || ''),
          url: item.link,
          publishDate: item.pubDate,
        };
      });
    } catch (error: any) {
      console.log(`⚠️  Yahoo RSS failed: ${error.message}`);
      return [];
    }
  }

  /**
   * NewsAPI.org (100 requests/day FREE tier)
   * https://newsapi.org/
   */
  private async getNewsAPIArticles(query: string): Promise<NewsItem[]> {
    if (!this.newsApiKey || this.apiCallsToday >= this.NEWS_API_LIMIT) {
      return [];
    }

    try {
      const url = 'https://newsapi.org/v2/everything';
      const response = await axios.get(url, {
        params: {
          q: query,
          sortBy: 'publishedAt',
          language: 'en',
          pageSize: 5,
          apiKey: this.newsApiKey,
        },
        timeout: 10000,
      });

      this.apiCallsToday++;

      return (response.data.articles || []).map((article: any) => {
        const sentimentResult = newsSentimentService.analyzeSentiment(article.title + ' ' + (article.description || ''));
        return {
          headline: article.title,
          source: article.source.name,
          timestamp: article.publishedAt,
          sentiment: sentimentResult.score > 0.3 ? 'positive' as const : sentimentResult.score < -0.3 ? 'negative' as const : 'neutral' as const,
          summary: article.description?.slice(0, 200) || 'No summary available',
          fullSummary: article.content,
          relevance: 'high' as const,
          category: this.categorizeNews(article.title),
          author: article.author,
          url: article.url,
          publishDate: article.publishedAt,
        };
      });
    } catch (error: any) {
      console.log(`⚠️  NewsAPI failed: ${error.message}`);
      return [];
    }
  }

  /**
   * Categorize news article
   */
  private categorizeNews(headline: string): 'injury' | 'form' | 'transfer' | 'tactical' | 'general' {
    const lower = headline.toLowerCase();
    
    if (lower.includes('injur') || lower.includes('hurt') || lower.includes('out')) {
      return 'injury';
    }
    if (lower.includes('transfer') || lower.includes('sign') || lower.includes('buy')) {
      return 'transfer';
    }
    if (lower.includes('tactic') || lower.includes('formation') || lower.includes('strategy')) {
      return 'tactical';
    }
    if (lower.includes('form') || lower.includes('streak') || lower.includes('performance')) {
      return 'form';
    }
    
    return 'general';
  }
}

export const realNewsService = new RealNewsService();
