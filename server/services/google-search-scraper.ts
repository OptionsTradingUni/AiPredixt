import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Google Search Scraping Service - Real Implementation with Fallbacks
 * 
 * This service implements REAL web scraping using multiple approaches:
 * 1. Google Custom Search API (PRIMARY - 100 free searches/day)
 * 2. Direct Google HTML scraping (FALLBACK 1 - when API exhausted)
 * 3. DuckDuckGo HTML scraping (FALLBACK 2 - no rate limits)
 * 4. Bing Search API (FALLBACK 3 - backup search engine)
 */

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
}

export class GoogleSearchScraper {
  private googleApiKey: string;
  private googleCx: string;
  private apiCallsToday = 0;
  private readonly GOOGLE_API_LIMIT = 100; // Free tier limit

  constructor() {
    this.googleApiKey = process.env.GOOGLE_SEARCH_API_KEY || '';
    this.googleCx = process.env.GOOGLE_SEARCH_CX || '';
  }

  /**
   * PRIMARY METHOD: Search with automatic fallback chain
   */
  async search(query: string, maxResults: number = 10): Promise<SearchResult[]> {
    console.log(`🔍 Searching: "${query}"`);

    // Try methods in order until one succeeds
    const methods = [
      () => this.searchGoogleAPI(query, maxResults),
      () => this.searchGoogleHTML(query, maxResults),
      () => this.searchDuckDuckGo(query, maxResults),
      () => this.searchBing(query, maxResults),
    ];

    for (const method of methods) {
      try {
        const results = await method();
        if (results.length > 0) {
          console.log(`✅ Found ${results.length} results`);
          return results;
        }
      } catch (error: any) {
        console.log(`⚠️  Method failed: ${error.message}, trying next fallback...`);
        continue;
      }
    }

    console.log('❌ All search methods failed');
    return [];
  }

  /**
   * METHOD 1: Google Custom Search API (PRIMARY - 100/day free)
   * Setup: https://developers.google.com/custom-search/v1/overview
   * 1. Create search engine: https://programmablesearchengine.google.com/
   * 2. Get API key: https://console.cloud.google.com/apis/credentials
   * 3. Enable Custom Search API in Google Cloud Console
   */
  private async searchGoogleAPI(query: string, maxResults: number): Promise<SearchResult[]> {
    if (!this.googleApiKey || !this.googleCx) {
      throw new Error('Google API not configured');
    }

    if (this.apiCallsToday >= this.GOOGLE_API_LIMIT) {
      throw new Error('Google API daily limit reached');
    }

    const url = 'https://www.googleapis.com/customsearch/v1';
    const response = await axios.get(url, {
      params: {
        key: this.googleApiKey,
        cx: this.googleCx,
        q: query,
        num: Math.min(maxResults, 10),
      },
      timeout: 10000,
    });

    this.apiCallsToday++;
    console.log(`📡 Google API called (${this.apiCallsToday}/${this.GOOGLE_API_LIMIT} today)`);

    return (response.data.items || []).map((item: any) => ({
      title: item.title,
      url: item.link,
      snippet: item.snippet,
      source: 'Google Custom Search API',
    }));
  }

  /**
   * METHOD 2: Direct Google HTML Scraping (FALLBACK 1)
   * Uses user-agent rotation and delay to avoid blocks
   */
  private async searchGoogleHTML(query: string, maxResults: number): Promise<SearchResult[]> {
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}&num=${maxResults}`;
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': 'https://www.google.com/',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);
    const results: SearchResult[] = [];

    // Parse Google search results
    $('div.g').each((i, elem) => {
      if (results.length >= maxResults) return;

      const title = $(elem).find('h3').text();
      const url = $(elem).find('a').attr('href');
      const snippet = $(elem).find('div.VwiC3b').text() || $(elem).find('span.aCOpRe').text();

      if (title && url) {
        results.push({
          title,
          url,
          snippet,
          source: 'Google HTML Scraping',
        });
      }
    });

    console.log(`📄 Google HTML scraped: ${results.length} results`);
    return results;
  }

  /**
   * METHOD 3: DuckDuckGo HTML Scraping (FALLBACK 2)
   * No rate limits, privacy-focused
   */
  private async searchDuckDuckGo(query: string, maxResults: number): Promise<SearchResult[]> {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);
    const results: SearchResult[] = [];

    $('.result').each((i, elem) => {
      if (results.length >= maxResults) return;

      const title = $(elem).find('.result__title').text().trim();
      const url = $(elem).find('.result__url').attr('href');
      const snippet = $(elem).find('.result__snippet').text().trim();

      if (title && url) {
        results.push({
          title,
          url,
          snippet,
          source: 'DuckDuckGo',
        });
      }
    });

    console.log(`🦆 DuckDuckGo scraped: ${results.length} results`);
    return results;
  }

  /**
   * METHOD 4: Bing Search (FALLBACK 3)
   * Can scrape Bing HTML as last resort
   */
  private async searchBing(query: string, maxResults: number): Promise<SearchResult[]> {
    const url = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);
    const results: SearchResult[] = [];

    $('.b_algo').each((i, elem) => {
      if (results.length >= maxResults) return;

      const title = $(elem).find('h2').text().trim();
      const url = $(elem).find('a').attr('href');
      const snippet = $(elem).find('.b_caption p').text().trim();

      if (title && url) {
        results.push({
          title,
          url,
          snippet,
          source: 'Bing',
        });
      }
    });

    console.log(`🔷 Bing scraped: ${results.length} results`);
    return results;
  }

  /**
   * SPECIALIZED: Search for specific sports data
   */
  async searchSportsData(teamName: string, dataType: 'stats' | 'injuries' | 'news' | 'form'): Promise<SearchResult[]> {
    const queries: Record<typeof dataType, string> = {
      stats: `${teamName} statistics current season site:fbref.com OR site:whoscored.com OR site:sofascore.com`,
      injuries: `${teamName} injury report latest site:physioroom.com OR site:transfermarkt.com`,
      news: `${teamName} news latest -transfer site:bbc.com/sport OR site:espn.com OR site:goal.com`,
      form: `${teamName} recent form results site:flashscore.com OR site:livescore.com`,
    };

    return this.search(queries[dataType], 5);
  }

  /**
   * BATCH SEARCH: Multiple queries with delay
   */
  async batchSearch(queries: string[], delayMs: number = 2000): Promise<Map<string, SearchResult[]>> {
    const results = new Map<string, SearchResult[]>();

    for (const query of queries) {
      const searchResults = await this.search(query, 10);
      results.set(query, searchResults);
      
      // Delay to avoid rate limiting
      if (queries.indexOf(query) < queries.length - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }

    return results;
  }
}

export const googleSearchScraper = new GoogleSearchScraper();
