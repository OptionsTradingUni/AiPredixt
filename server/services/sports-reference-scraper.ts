import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Sports-Reference Family Scraper
 * 
 * Scrapes data from Sports-Reference.com family of sites:
 * - Baseball-Reference.com
 * - Basketball-Reference.com
 * - Pro-Football-Reference.com
 * - Hockey-Reference.com
 * - FBref.com (football/soccer)
 * 
 * RATE LIMITS (CRITICAL):
 * - FBref & Stathead: 10 requests per minute max
 * - Baseball/Basketball/Football/Hockey-Reference: 20 requests per minute max
 * - Violations result in 24-hour IP ban
 */

export interface SportsReferenceData {
  source: string;
  sport: string;
  data: any;
  scrapedAt: string;
  rateLimit: {
    limit: number;
    delay: number;
  };
}

export class SportsReferenceScraper {
  private lastRequestTime: Map<string, number> = new Map();
  private readonly USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  
  // Rate limits per site
  private readonly RATE_LIMITS = {
    'fbref.com': { limit: 10, delay: 6500 },  // 10 req/min = 6 sec delay
    'baseball-reference.com': { limit: 20, delay: 3500 }, // 20 req/min = 3 sec delay
    'basketball-reference.com': { limit: 20, delay: 3500 },
    'pro-football-reference.com': { limit: 20, delay: 3500 },
    'hockey-reference.com': { limit: 20, delay: 3500 },
  };

  /**
   * Enforce rate limiting for specific site
   */
  private async enforceRateLimit(site: string): Promise<void> {
    const rateLimit = this.RATE_LIMITS[site as keyof typeof this.RATE_LIMITS];
    if (!rateLimit) return;

    const lastRequest = this.lastRequestTime.get(site) || 0;
    const elapsed = Date.now() - lastRequest;
    const delay = rateLimit.delay;

    if (elapsed < delay) {
      const waitTime = delay - elapsed;
      console.log(`⏳ Rate limiting: waiting ${waitTime}ms for ${site}`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    this.lastRequestTime.set(site, Date.now());
  }

  /**
   * Basketball-Reference: Get team standings and stats
   */
  async getBasketballReferenceData(season: number = 2024): Promise<SportsReferenceData | null> {
    const site = 'basketball-reference.com';
    await this.enforceRateLimit(site);

    try {
      console.log(`🏀 Fetching Basketball-Reference data for ${season} season...`);
      
      const url = `https://www.basketball-reference.com/leagues/NBA_${season}_standings.html`;
      const response = await axios.get(url, {
        headers: { 'User-Agent': this.USER_AGENT },
        timeout: 15000,
      });

      const $ = cheerio.load(response.data);
      const teams: any[] = [];

      // Parse Eastern Conference
      $('#divs_standings_E tbody tr').each((i, row) => {
        const cols = $(row).find('th, td');
        if (cols.length > 0) {
          teams.push({
            team: $(cols[0]).text().trim().replace(/\s*\(\d+\)/, ''),
            wins: $(cols[1]).text().trim(),
            losses: $(cols[2]).text().trim(),
            winPct: $(cols[3]).text().trim(),
            conference: 'Eastern',
          });
        }
      });

      // Parse Western Conference
      $('#divs_standings_W tbody tr').each((i, row) => {
        const cols = $(row).find('th, td');
        if (cols.length > 0) {
          teams.push({
            team: $(cols[0]).text().trim().replace(/\s*\(\d+\)/, ''),
            wins: $(cols[1]).text().trim(),
            losses: $(cols[2]).text().trim(),
            winPct: $(cols[3]).text().trim(),
            conference: 'Western',
          });
        }
      });

      console.log(`✅ Retrieved ${teams.length} NBA teams from Basketball-Reference`);

      return {
        source: 'Basketball-Reference.com',
        sport: 'basketball',
        data: {
          season,
          teams: teams.filter(t => t.team && t.wins),
          totalTeams: teams.filter(t => t.team && t.wins).length,
        },
        scrapedAt: new Date().toISOString(),
        rateLimit: this.RATE_LIMITS[site],
      };
    } catch (error: any) {
      console.error(`❌ Basketball-Reference error: ${error.message}`);
      return null;
    }
  }

  /**
   * Baseball-Reference: Get team standings
   */
  async getBaseballReferenceData(season: number = 2024): Promise<SportsReferenceData | null> {
    const site = 'baseball-reference.com';
    await this.enforceRateLimit(site);

    try {
      console.log(`⚾ Fetching Baseball-Reference data for ${season} season...`);
      
      const url = `https://www.baseball-reference.com/leagues/majors/${season}-standings.shtml`;
      const response = await axios.get(url, {
        headers: { 'User-Agent': this.USER_AGENT },
        timeout: 15000,
      });

      const $ = cheerio.load(response.data);
      const teams: any[] = [];

      // Parse divisions
      $('table[id*="standings"]').each((i, table) => {
        const divisionName = $(table).prev('h2, h3').text().trim();
        
        $(table).find('tbody tr').each((j, row) => {
          const cols = $(row).find('th, td');
          if (cols.length >= 4) {
            teams.push({
              team: $(cols[0]).text().trim(),
              wins: $(cols[1]).text().trim(),
              losses: $(cols[2]).text().trim(),
              winPct: $(cols[3]).text().trim(),
              division: divisionName || 'Unknown',
            });
          }
        });
      });

      console.log(`✅ Retrieved ${teams.length} MLB teams from Baseball-Reference`);

      return {
        source: 'Baseball-Reference.com',
        sport: 'baseball',
        data: {
          season,
          teams: teams.filter(t => t.team && t.wins),
          totalTeams: teams.filter(t => t.team && t.wins).length,
        },
        scrapedAt: new Date().toISOString(),
        rateLimit: this.RATE_LIMITS[site],
      };
    } catch (error: any) {
      console.error(`❌ Baseball-Reference error: ${error.message}`);
      return null;
    }
  }

  /**
   * Pro-Football-Reference: Get team standings
   */
  async getProFootballReferenceData(season: number = 2024): Promise<SportsReferenceData | null> {
    const site = 'pro-football-reference.com';
    await this.enforceRateLimit(site);

    try {
      console.log(`🏈 Fetching Pro-Football-Reference data for ${season} season...`);
      
      const url = `https://www.pro-football-reference.com/years/${season}/`;
      const response = await axios.get(url, {
        headers: { 'User-Agent': this.USER_AGENT },
        timeout: 15000,
      });

      const $ = cheerio.load(response.data);
      const teams: any[] = [];

      // Parse AFC and NFC standings
      $('table[id*="standings"]').each((i, table) => {
        const conference = i === 0 ? 'AFC' : 'NFC';
        
        $(table).find('tbody tr').each((j, row) => {
          const cols = $(row).find('th, td');
          if (cols.length >= 4) {
            teams.push({
              team: $(cols[0]).text().trim(),
              wins: $(cols[1]).text().trim(),
              losses: $(cols[2]).text().trim(),
              ties: $(cols[3]).text().trim(),
              conference,
            });
          }
        });
      });

      console.log(`✅ Retrieved ${teams.length} NFL teams from Pro-Football-Reference`);

      return {
        source: 'Pro-Football-Reference.com',
        sport: 'football',
        data: {
          season,
          teams: teams.filter(t => t.team && t.wins),
          totalTeams: teams.filter(t => t.team && t.wins).length,
        },
        scrapedAt: new Date().toISOString(),
        rateLimit: this.RATE_LIMITS[site],
      };
    } catch (error: any) {
      console.error(`❌ Pro-Football-Reference error: ${error.message}`);
      return null;
    }
  }

  /**
   * Hockey-Reference: Get team standings
   */
  async getHockeyReferenceData(season: string = '2024'): Promise<SportsReferenceData | null> {
    const site = 'hockey-reference.com';
    await this.enforceRateLimit(site);

    try {
      console.log(`🏒 Fetching Hockey-Reference data for ${season} season...`);
      
      const url = `https://www.hockey-reference.com/leagues/NHL_${season}_standings.html`;
      const response = await axios.get(url, {
        headers: { 'User-Agent': this.USER_AGENT },
        timeout: 15000,
      });

      const $ = cheerio.load(response.data);
      const teams: any[] = [];

      // Parse divisions
      $('table.stats_table').each((i, table) => {
        const divisionName = $(table).find('caption').text().trim();
        
        $(table).find('tbody tr').not('.thead').each((j, row) => {
          const cols = $(row).find('th, td');
          if (cols.length >= 4) {
            teams.push({
              team: $(cols[0]).text().trim(),
              wins: $(cols[1]).text().trim(),
              losses: $(cols[2]).text().trim(),
              points: $(cols[5])?.text().trim() || 'N/A',
              division: divisionName || 'Unknown',
            });
          }
        });
      });

      console.log(`✅ Retrieved ${teams.length} NHL teams from Hockey-Reference`);

      return {
        source: 'Hockey-Reference.com',
        sport: 'hockey',
        data: {
          season,
          teams: teams.filter(t => t.team && t.wins),
          totalTeams: teams.filter(t => t.team && t.wins).length,
        },
        scrapedAt: new Date().toISOString(),
        rateLimit: this.RATE_LIMITS[site],
      };
    } catch (error: any) {
      console.error(`❌ Hockey-Reference error: ${error.message}`);
      return null;
    }
  }

  /**
   * FBref: Get football/soccer league table
   */
  async getFBrefData(league: string = 'Premier-League', season: string = '2024-2025'): Promise<SportsReferenceData | null> {
    const site = 'fbref.com';
    await this.enforceRateLimit(site);

    try {
      console.log(`⚽ Fetching FBref data for ${league} ${season}...`);
      
      // League ID mapping
      const leagueIds: Record<string, string> = {
        'Premier-League': '9',
        'La-Liga': '12',
        'Bundesliga': '20',
        'Serie-A': '11',
        'Ligue-1': '13',
      };

      const leagueId = leagueIds[league] || '9';
      const url = `https://fbref.com/en/comps/${leagueId}/${season}/${season}-${league}-Stats`;
      
      const response = await axios.get(url, {
        headers: { 'User-Agent': this.USER_AGENT },
        timeout: 15000,
      });

      const $ = cheerio.load(response.data);
      const teams: any[] = [];

      // Parse league table
      $('table.stats_table tbody tr').not('.thead').each((i, row) => {
        const cols = $(row).find('th, td');
        if (cols.length >= 10) {
          teams.push({
            rank: $(cols[0]).text().trim(),
            team: $(cols[1]).text().trim(),
            matches: $(cols[2]).text().trim(),
            wins: $(cols[3]).text().trim(),
            draws: $(cols[4]).text().trim(),
            losses: $(cols[5]).text().trim(),
            goalsFor: $(cols[6]).text().trim(),
            goalsAgainst: $(cols[7]).text().trim(),
            goalDiff: $(cols[8]).text().trim(),
            points: $(cols[9]).text().trim(),
          });
        }
      });

      console.log(`✅ Retrieved ${teams.length} teams from FBref for ${league}`);

      return {
        source: 'FBref.com',
        sport: 'soccer',
        data: {
          league,
          season,
          teams: teams.filter(t => t.team && t.points),
          totalTeams: teams.filter(t => t.team && t.points).length,
        },
        scrapedAt: new Date().toISOString(),
        rateLimit: this.RATE_LIMITS[site],
      };
    } catch (error: any) {
      console.error(`❌ FBref error: ${error.message}`);
      return null;
    }
  }

  /**
   * Get all available Sports-Reference data for a given sport
   */
  async getAllDataForSport(sport: 'basketball' | 'baseball' | 'football' | 'hockey' | 'soccer'): Promise<SportsReferenceData[]> {
    console.log(`📊 Gathering all Sports-Reference data for ${sport}...`);
    
    const results: (SportsReferenceData | null)[] = [];

    switch (sport) {
      case 'basketball':
        results.push(await this.getBasketballReferenceData());
        break;
      case 'baseball':
        results.push(await this.getBaseballReferenceData());
        break;
      case 'football':
        results.push(await this.getProFootballReferenceData());
        break;
      case 'hockey':
        results.push(await this.getHockeyReferenceData());
        break;
      case 'soccer':
        results.push(await this.getFBrefData());
        break;
    }

    return results.filter((r): r is SportsReferenceData => r !== null);
  }

  /**
   * Get comprehensive multi-sport data from all Sports-Reference sites
   */
  async getAllSportsData(): Promise<{
    basketball: SportsReferenceData[];
    baseball: SportsReferenceData[];
    football: SportsReferenceData[];
    hockey: SportsReferenceData[];
    soccer: SportsReferenceData[];
  }> {
    console.log(`🌐 Gathering data from ALL Sports-Reference sites...`);
    
    // Sequential to respect rate limits (don't overwhelm the sites)
    const basketball = await this.getAllDataForSport('basketball');
    const baseball = await this.getAllDataForSport('baseball');
    const football = await this.getAllDataForSport('football');
    const hockey = await this.getAllDataForSport('hockey');
    const soccer = await this.getAllDataForSport('soccer');

    return {
      basketball,
      baseball,
      football,
      hockey,
      soccer,
    };
  }
}

export const sportsReferenceScraper = new SportsReferenceScraper();
