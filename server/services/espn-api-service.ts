import axios from 'axios';
// @ts-ignore - No type definitions available for 'espn-fantasy-football-api' package
import { Client } from 'espn-fantasy-football-api/node';

/**
 * ESPN API Service
 * 
 * Provides access to ESPN sports data:
 * 1. ESPN Fantasy Football API (via espn-fantasy-football-api package)
 * 2. ESPN Public API for scoreboards, schedules, standings
 * 3. ESPN News API
 * 
 * Supports: NFL, NBA, MLB, NHL, Soccer, Tennis, Golf, MMA, Racing, etc.
 */

export interface ESPNScoreboard {
  sport: string;
  league: string;
  events: ESPNEvent[];
  totalEvents: number;
}

export interface ESPNEvent {
  id: string;
  name: string;
  shortName: string;
  date: string;
  status: string;
  homeTeam: {
    id: string;
    name: string;
    abbreviation: string;
    score?: number;
  };
  awayTeam: {
    id: string;
    name: string;
    abbreviation: string;
    score?: number;
  };
}

export class ESPNApiService {
  private readonly BASE_URL = 'https://site.api.espn.com/apis/site/v2/sports';
  private readonly USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
  private fantasyClient: Client | null = null;

  /**
   * Get ESPN scoreboard for any sport/league
   */
  async getScoreboard(sport: string, league: string, date?: string): Promise<ESPNScoreboard | null> {
    try {
      console.log(`🏆 Fetching ESPN scoreboard for ${sport}/${league}...`);
      
      // Build URL
      let url = `${this.BASE_URL}/${sport}/${league}/scoreboard`;
      if (date) {
        url += `?dates=${date}`;
      }
      
      const response = await axios.get(url, {
        headers: { 'User-Agent': this.USER_AGENT },
        timeout: 10000,
      });

      if (response.data?.events) {
        const events: ESPNEvent[] = response.data.events.map((event: any) => ({
          id: event.id,
          name: event.name,
          shortName: event.shortName,
          date: event.date,
          status: event.status?.type?.description || 'Unknown',
          homeTeam: {
            id: event.competitions?.[0]?.competitors?.[0]?.id || '',
            name: event.competitions?.[0]?.competitors?.[0]?.team?.displayName || '',
            abbreviation: event.competitions?.[0]?.competitors?.[0]?.team?.abbreviation || '',
            score: parseInt(event.competitions?.[0]?.competitors?.[0]?.score) || 0,
          },
          awayTeam: {
            id: event.competitions?.[0]?.competitors?.[1]?.id || '',
            name: event.competitions?.[0]?.competitors?.[1]?.team?.displayName || '',
            abbreviation: event.competitions?.[0]?.competitors?.[1]?.team?.abbreviation || '',
            score: parseInt(event.competitions?.[0]?.competitors?.[1]?.score) || 0,
          },
        }));

        console.log(`✅ Retrieved ${events.length} events from ESPN`);

        return {
          sport,
          league,
          events,
          totalEvents: events.length,
        };
      }

      return null;
    } catch (error: any) {
      console.error(`❌ ESPN scoreboard error: ${error.message}`);
      return null;
    }
  }

  /**
   * Get today's scores for multiple sports
   */
  async getTodaysScores(): Promise<Record<string, ESPNScoreboard | null>> {
    console.log(`📺 Fetching today's scores from ESPN...`);
    
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    
    const [nfl, nba, mlb, nhl, soccer] = await Promise.all([
      this.getScoreboard('football', 'nfl', today),
      this.getScoreboard('basketball', 'nba', today),
      this.getScoreboard('baseball', 'mlb', today),
      this.getScoreboard('hockey', 'nhl', today),
      this.getScoreboard('soccer', 'eng.1', today), // Premier League
    ]);

    return {
      nfl,
      nba,
      mlb,
      nhl,
      soccer,
    };
  }

  /**
   * Get league standings
   */
  async getStandings(sport: string, league: string): Promise<any> {
    try {
      console.log(`📊 Fetching ESPN standings for ${sport}/${league}...`);
      
      const url = `${this.BASE_URL}/${sport}/${league}/standings`;
      const response = await axios.get(url, {
        headers: { 'User-Agent': this.USER_AGENT },
        timeout: 10000,
      });

      console.log(`✅ Retrieved standings from ESPN`);
      return response.data;
    } catch (error: any) {
      console.error(`❌ ESPN standings error: ${error.message}`);
      return null;
    }
  }

  /**
   * Get team information
   */
  async getTeam(sport: string, league: string, teamId: string): Promise<any> {
    try {
      console.log(`🏀 Fetching ESPN team data for ${teamId}...`);
      
      const url = `${this.BASE_URL}/${sport}/${league}/teams/${teamId}`;
      const response = await axios.get(url, {
        headers: { 'User-Agent': this.USER_AGENT },
        timeout: 10000,
      });

      console.log(`✅ Retrieved team data from ESPN`);
      return response.data;
    } catch (error: any) {
      console.error(`❌ ESPN team error: ${error.message}`);
      return null;
    }
  }

  /**
   * Get news for a sport/league
   */
  async getNews(sport: string, league: string, limit: number = 10): Promise<any> {
    try {
      console.log(`📰 Fetching ESPN news for ${sport}/${league}...`);
      
      const url = `${this.BASE_URL}/${sport}/${league}/news?limit=${limit}`;
      const response = await axios.get(url, {
        headers: { 'User-Agent': this.USER_AGENT },
        timeout: 10000,
      });

      if (response.data?.articles) {
        console.log(`✅ Retrieved ${response.data.articles.length} news articles from ESPN`);
        return response.data.articles;
      }

      return [];
    } catch (error: any) {
      console.error(`❌ ESPN news error: ${error.message}`);
      return [];
    }
  }

  /**
   * Initialize Fantasy Football Client
   */
  initializeFantasyClient(leagueId: number, espnS2?: string, swid?: string): void {
    try {
      console.log(`🏈 Initializing ESPN Fantasy Football client for league ${leagueId}...`);
      
      this.fantasyClient = new Client({
        leagueId,
        espnS2,
        SWID: swid,
      });

      console.log(`✅ Fantasy Football client initialized`);
    } catch (error: any) {
      console.error(`❌ Fantasy client initialization error: ${error.message}`);
    }
  }

  /**
   * Get Fantasy Football league info
   */
  async getFantasyLeagueInfo(): Promise<any> {
    if (!this.fantasyClient) {
      console.warn('⚠️  Fantasy client not initialized');
      return null;
    }

    try {
      console.log(`🏈 Fetching fantasy league info...`);
      
      const info = await this.fantasyClient.getLeagueInfo();
      
      console.log(`✅ Retrieved fantasy league info`);
      return info;
    } catch (error: any) {
      console.error(`❌ Fantasy league info error: ${error.message}`);
      return null;
    }
  }

  /**
   * Get multi-sport schedule
   */
  async getSchedule(sport: string, league: string): Promise<any> {
    try {
      console.log(`📅 Fetching ESPN schedule for ${sport}/${league}...`);
      
      const url = `${this.BASE_URL}/${sport}/${league}/schedule`;
      const response = await axios.get(url, {
        headers: { 'User-Agent': this.USER_AGENT },
        timeout: 10000,
      });

      console.log(`✅ Retrieved schedule from ESPN`);
      return response.data;
    } catch (error: any) {
      console.error(`❌ ESPN schedule error: ${error.message}`);
      return null;
    }
  }

  /**
   * Get supported sports and leagues
   */
  getSupportedLeagues(): Record<string, string[]> {
    return {
      football: ['nfl', 'college-football'],
      basketball: ['nba', 'wnba', 'mens-college-basketball', 'womens-college-basketball'],
      baseball: ['mlb', 'college-baseball'],
      hockey: ['nhl'],
      soccer: ['eng.1', 'esp.1', 'ger.1', 'ita.1', 'fra.1', 'uefa.champions', 'usa.1'],
      tennis: ['atp', 'wta'],
      golf: ['pga'],
      mma: ['ufc'],
      racing: ['f1', 'indycar', 'nascar'],
    };
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ accessible: boolean; message: string }> {
    try {
      console.log(`🏥 Checking ESPN API health...`);
      
      const scoreboard = await this.getScoreboard('basketball', 'nba');
      
      if (scoreboard) {
        console.log(`✅ ESPN API is accessible`);
        return {
          accessible: true,
          message: 'ESPN API accessible',
        };
      }
      
      return {
        accessible: false,
        message: 'ESPN API returned no data',
      };
    } catch (error: any) {
      console.error(`❌ ESPN API health check failed: ${error.message}`);
      return {
        accessible: false,
        message: `ESPN API error: ${error.message}`,
      };
    }
  }
}

export const espnApiService = new ESPNApiService();
