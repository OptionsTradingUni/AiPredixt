import axios from 'axios';
import { API_CONFIG } from './api-config';

export interface TeamStats {
  teamName: string;
  form: string;
  goalsFor: number;
  goalsAgainst: number;
  wins: number;
  losses: number;
  draws: number;
  streak: string;
}

export interface GameData {
  gameId: string;
  sport: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  gameTime: string;
  venue?: string;
  homeStats?: TeamStats;
  awayStats?: TeamStats;
  headToHead?: any[];
  injuries?: string[];
  weather?: {
    temp: number;
    condition: string;
    wind: number;
  };
}

export class SportsDataService {
  private apiKey: string;
  private baseUrl: string;
  private enabled: boolean;

  constructor() {
    this.apiKey = API_CONFIG.sportsApi.key;
    this.baseUrl = API_CONFIG.sportsApi.baseUrl;
    this.enabled = API_CONFIG.sportsApi.enabled;
  }

  async getGameData(gameId: string, sport: string): Promise<GameData | null> {
    if (!this.enabled) {
      console.log('⚠️  API-Football not configured - set API_FOOTBALL_KEY in .env');
      return null; // Return null when API not configured
    }

    try {
      console.log(`📡 Fetching live data from API-Football for game ${gameId}...`);
      
      // Real API-Football request
      const response = await axios.get(`${this.baseUrl}/fixtures`, {
        headers: {
          'x-rapidapi-key': this.apiKey,
          'x-rapidapi-host': 'v3.football.api-sports.io',
        },
        params: {
          id: gameId,
        },
        timeout: 10000,
      });

      if (response.data?.response?.[0]) {
        const fixture = response.data.response[0];
        console.log(`✅ Live game data fetched from API-Football`);
        
        return this.parseApiFootballData(fixture, sport);
      }

      console.log('⚠️  No data returned from API-Football');
      return null;
      
    } catch (error: any) {
      console.error(`❌ API-Football error: ${error.message}`);
      // Don't fall back to mock - return null to indicate data unavailable
      return null;
    }
  }

  private parseApiFootballData(fixture: any, sport: string): GameData {
    return {
      gameId: fixture.fixture.id.toString(),
      sport,
      league: fixture.league.name,
      homeTeam: fixture.teams.home.name,
      awayTeam: fixture.teams.away.name,
      gameTime: fixture.fixture.date,
      venue: fixture.fixture.venue?.name,
      homeStats: {
        teamName: fixture.teams.home.name,
        form: 'WWDWW', // Would come from separate API call
        goalsFor: 0,
        goalsAgainst: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        streak: 'Unknown',
      },
      awayStats: {
        teamName: fixture.teams.away.name,
        form: 'LWWWL',
        goalsFor: 0,
        goalsAgainst: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        streak: 'Unknown',
      },
    };
  }

  private getMockGameData(gameId: string, sport: string): GameData {
    const mockGames: Record<string, GameData> = {
      'mock-soccer-1': {
        gameId: 'mock-soccer-1',
        sport: 'soccer',
        league: 'Premier League',
        homeTeam: 'Manchester City',
        awayTeam: 'Liverpool',
        gameTime: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
        venue: 'Etihad Stadium',
        homeStats: {
          teamName: 'Manchester City',
          form: 'WWDWW',
          goalsFor: 45,
          goalsAgainst: 15,
          wins: 14,
          losses: 2,
          draws: 3,
          streak: '5 games unbeaten',
        },
        awayStats: {
          teamName: 'Liverpool',
          form: 'WLWDW',
          goalsFor: 38,
          goalsAgainst: 22,
          wins: 11,
          losses: 4,
          draws: 4,
          streak: '2 wins in last 3',
        },
        injuries: ['Haaland (minor knock)', 'Salah (questionable)'],
        weather: {
          temp: 12,
          condition: 'Clear',
          wind: 15,
        },
      },
      'mock-basketball-1': {
        gameId: 'mock-basketball-1',
        sport: 'basketball',
        league: 'NBA',
        homeTeam: 'Lakers',
        awayTeam: 'Warriors',
        gameTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
        venue: 'Crypto.com Arena',
        homeStats: {
          teamName: 'Lakers',
          form: 'LWWLW',
          goalsFor: 2145,
          goalsAgainst: 2087,
          wins: 28,
          losses: 14,
          draws: 0,
          streak: 'Won 2 of last 3',
        },
        awayStats: {
          teamName: 'Warriors',
          form: 'WWLWW',
          goalsFor: 2234,
          goalsAgainst: 2123,
          wins: 31,
          losses: 11,
          draws: 0,
          streak: 'Won 4 straight',
        },
        injuries: ['Davis (probable)', 'Curry (playing)'],
      },
      'mock-hockey-1': {
        gameId: 'mock-hockey-1',
        sport: 'icehockey',
        league: 'NHL',
        homeTeam: 'Maple Leafs',
        awayTeam: 'Bruins',
        gameTime: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
        venue: 'Scotiabank Arena',
        homeStats: {
          teamName: 'Maple Leafs',
          form: 'LWWLW',
          goalsFor: 156,
          goalsAgainst: 145,
          wins: 25,
          losses: 15,
          draws: 5,
          streak: '3-2 in last 5',
        },
        awayStats: {
          teamName: 'Bruins',
          form: 'WWWLW',
          goalsFor: 168,
          goalsAgainst: 132,
          wins: 30,
          losses: 10,
          draws: 5,
          streak: '7-3 in last 10',
        },
        injuries: ['Matthews (out)', 'Pastrnak (playing)'],
      },
      'mock-tennis-1': {
        gameId: 'mock-tennis-1',
        sport: 'tennis',
        league: 'ATP',
        homeTeam: 'Djokovic',
        awayTeam: 'Alcaraz',
        gameTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
        homeStats: {
          teamName: 'Djokovic',
          form: 'WWWLW',
          wins: 42,
          losses: 8,
          draws: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          streak: '5-1 in last 6',
        },
        awayStats: {
          teamName: 'Alcaraz',
          form: 'LWWWL',
          wins: 38,
          losses: 12,
          draws: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          streak: '4-2 in last 6',
        },
      },
    };

    return mockGames[gameId] || mockGames['mock-soccer-1'];
  }

  async getTeamForm(teamName: string): Promise<string> {
    // Mock implementation - in real version would fetch from API
    const forms = ['WWWWW', 'WWWLW', 'WLWLW', 'LWWWL', 'WWDWW'];
    return forms[Math.floor(Math.random() * forms.length)];
  }
}

export const sportsDataService = new SportsDataService();
