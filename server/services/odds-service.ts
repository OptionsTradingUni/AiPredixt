import axios from 'axios';
import { API_CONFIG } from './api-config';

export interface OddsData {
  gameId: string;
  sport: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  gameTime: string;
  odds: {
    moneyline?: { home: number; away: number; draw?: number };
    spread?: { line: number; odds: number };
    totals?: { over: number; under: number; line: number };
  };
  bookmaker: string;
}

export class OddsService {
  private apiKey: string;
  private baseUrl: string;
  private enabled: boolean;
  private requestCount = 0;
  private readonly monthlyLimit = 500;

  constructor() {
    this.apiKey = API_CONFIG.oddsApi.key;
    this.baseUrl = API_CONFIG.oddsApi.baseUrl;
    this.enabled = API_CONFIG.oddsApi.enabled;
  }

  async getOdds(sport: 'soccer' | 'basketball' | 'icehockey' | 'tennis'): Promise<OddsData[]> {
    if (!this.enabled) {
      console.log('⚠️  Odds API not configured - no data available');
      return [];
    }

    if (this.requestCount >= this.monthlyLimit) {
      console.log('⚠️  Monthly API limit reached - no data available');
      return [];
    }

    try {
      const sportKey = this.getSportKey(sport);
      const url = `${this.baseUrl}/sports/${sportKey}/odds/`;

      const response = await axios.get(url, {
        params: {
          apiKey: this.apiKey,
          regions: 'us,uk,eu',
          markets: 'h2h,spreads,totals',
          oddsFormat: 'decimal',
        },
        timeout: 10000,
      });

      this.requestCount++;
      console.log(`✅ Odds API called (${this.requestCount}/${this.monthlyLimit} used)`);

      return this.parseOddsResponse(response.data, sport);
    } catch (error: any) {
      console.error('Error fetching odds:', error.message);
      return [];
    }
  }

  private getSportKey(sport: string): string {
    const mapping: Record<string, string> = {
      soccer: 'soccer_epl', // Premier League
      basketball: 'basketball_nba',
      icehockey: 'icehockey_nhl',
      tennis: 'tennis_atp',
    };
    return mapping[sport] || 'soccer_epl';
  }

  private parseOddsResponse(data: any[], sport: string): OddsData[] {
    return data.slice(0, 10).map((event: any) => {
      const bookmaker = event.bookmakers?.[0];
      const h2hMarket = bookmaker?.markets?.find((m: any) => m.key === 'h2h');
      const spreadMarket = bookmaker?.markets?.find((m: any) => m.key === 'spreads');
      const totalsMarket = bookmaker?.markets?.find((m: any) => m.key === 'totals');

      return {
        gameId: event.id,
        sport,
        league: event.sport_title || 'Unknown League',
        homeTeam: event.home_team,
        awayTeam: event.away_team,
        gameTime: event.commence_time,
        odds: {
          moneyline: h2hMarket
            ? {
                home: h2hMarket.outcomes.find((o: any) => o.name === event.home_team)?.price || 2.0,
                away: h2hMarket.outcomes.find((o: any) => o.name === event.away_team)?.price || 2.0,
                draw: h2hMarket.outcomes.find((o: any) => o.name === 'Draw')?.price,
              }
            : undefined,
          spread: spreadMarket
            ? {
                line: spreadMarket.outcomes[0]?.point || 0,
                odds: spreadMarket.outcomes[0]?.price || 1.9,
              }
            : undefined,
          totals: totalsMarket
            ? {
                line: totalsMarket.outcomes[0]?.point || 2.5,
                over: totalsMarket.outcomes.find((o: any) => o.name === 'Over')?.price || 1.9,
                under: totalsMarket.outcomes.find((o: any) => o.name === 'Under')?.price || 1.9,
              }
            : undefined,
        },
        bookmaker: bookmaker?.title || 'SportyBet',
      };
    });
  }


  getRemainingRequests(): { used: number; limit: number; remaining: number } {
    return {
      used: this.requestCount,
      limit: this.monthlyLimit,
      remaining: this.monthlyLimit - this.requestCount,
    };
  }
}

export const oddsService = new OddsService();
