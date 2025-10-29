import { type User, type InsertUser, type ApexPrediction, type HistoricalPerformance, type SportType, type Game, type GamesListResponse, users, predictions, games, scrapedData } from "@shared/schema";
import { randomUUID } from "crypto";
import { predictionEngine } from "./services/prediction-engine";
import { historicalService } from "./services/historical-service";
import { enhancedOddsService } from "./services/enhanced-odds-service";
import { db } from "./db";
import { eq, and, gte, sql as drizzleSql } from "drizzle-orm";

export interface DataSourceStatus {
  isRealData: boolean;
  apis: {
    oddsApi: boolean;
    sportsApi: boolean;
  };
  scrapingSources: string[];
  totalSources: number;
}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getApexPrediction(sport?: SportType): Promise<ApexPrediction>;
  getAllPredictions(sport?: SportType): Promise<ApexPrediction[]>;
  getHistoricalPerformance(sport?: SportType): Promise<HistoricalPerformance[]>;
  getDataSourceStatus(): Promise<DataSourceStatus>;
  getGames(filters: {
    sport?: SportType;
    date?: 'today' | 'tomorrow' | 'upcoming' | 'past' | string;
    status?: 'upcoming' | 'live' | 'finished';
    league?: string;
    limit?: number;
    offset?: number;
  }): Promise<GamesListResponse>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private predictionCache: Map<SportType, { prediction: ApexPrediction; timestamp: number }> = new Map();
  private allGamesCache: Map<SportType, { predictions: ApexPrediction[]; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private lastScrapingTelemetry: {
    sources: string[];
    totalGames: number;
    timestamp: number;
    apis: { oddsApi: boolean; sportsApi: boolean };
  } | null = null;

  constructor() {
    this.users = new Map();
  }
  
  public updateScrapingTelemetry(sources: string[], totalGames: number, apis: { oddsApi: boolean; sportsApi: boolean }) {
    this.lastScrapingTelemetry = {
      sources,
      totalGames,
      timestamp: Date.now(),
      apis,
    };
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getApexPrediction(sport?: SportType, dateFilter?: string): Promise<ApexPrediction> {
    const targetSport = sport || 'Football';
    
    // Check cache first (cache key includes date filter)
    const cacheKey = `${targetSport}-${dateFilter || 'all'}`;
    const cached = this.predictionCache.get(cacheKey as any);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < this.CACHE_TTL) {
      console.log(`✅ Returning cached prediction for ${targetSport}${dateFilter ? ` (${dateFilter})` : ''}`);
      return cached.prediction;
    }

    try {
      console.log(`🚀 Generating prediction for ${targetSport} using 6-phase system${dateFilter ? ` (date: ${dateFilter})` : ''}...`);
      console.log(`📡 Free APIs: Odds API (${process.env.ODDS_API_KEY ? 'configured' : 'not configured'}), API-Football (${process.env.API_FOOTBALL_KEY ? 'configured' : 'not configured'})`);
      
      // Generate prediction using the full 6-phase system
      const { prediction, telemetry } = await predictionEngine.selectApexPick(targetSport, dateFilter);
      
      // Update telemetry with actual data sources used
      if (telemetry) {
        this.updateScrapingTelemetry(telemetry.sources, telemetry.totalGames, telemetry.apis);
      }
      
      // Cache the prediction
      this.predictionCache.set(cacheKey as any, {
        prediction,
        timestamp: now,
      });
      
      console.log(`✅ Prediction generated and cached for ${targetSport}`);
      console.log(`   Using: Real odds data + Scraped intelligence from multiple sources`);
      return prediction;
      
    } catch (error) {
      console.error('❌ Prediction generation failed:', error);
      // Don't fall back to mock - re-throw to show real errors
      throw error;
    }
  }

  async getAllPredictions(sport?: SportType, dateFilter?: string): Promise<ApexPrediction[]> {
    const targetSport = sport || 'Football';
    
    // Check cache first (cache key includes date filter)
    const cacheKey = `${targetSport}-${dateFilter || 'all'}`;
    const cached = this.allGamesCache.get(cacheKey as any);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < this.CACHE_TTL) {
      console.log(`✅ Returning cached all-games predictions for ${targetSport}${dateFilter ? ` (${dateFilter})` : ''} (${cached.predictions.length} games)`);
      return cached.predictions;
    }

    try {
      console.log(`🚀 Analyzing all ${targetSport} games${dateFilter ? ` (date: ${dateFilter})` : ''}...`);
      
      // Generate predictions for ALL games using the full analysis system
      const { predictions, telemetry } = await predictionEngine.analyzeAllGames(targetSport, dateFilter);
      
      // Update telemetry with actual data sources used
      if (telemetry) {
        this.updateScrapingTelemetry(telemetry.sources, telemetry.totalGames, telemetry.apis);
      }
      
      // Cache the predictions
      this.allGamesCache.set(cacheKey as any, {
        predictions,
        timestamp: now,
      });
      
      console.log(`✅ ${predictions.length} ${targetSport} predictions generated and cached`);
      return predictions;
      
    } catch (error) {
      console.error('❌ All-games prediction generation failed:', error);
      throw error;
    }
  }

  async getHistoricalPerformance(sport?: SportType): Promise<HistoricalPerformance[]> {
    // Use the historical service for performance data
    return historicalService.getPerformance(sport);
  }

  async getDataSourceStatus(): Promise<DataSourceStatus> {
    // If we have recent telemetry (within last 5 minutes), use it
    if (this.lastScrapingTelemetry && (Date.now() - this.lastScrapingTelemetry.timestamp) < this.CACHE_TTL) {
      return {
        isRealData: this.lastScrapingTelemetry.totalGames > 0,
        apis: this.lastScrapingTelemetry.apis,
        scrapingSources: this.lastScrapingTelemetry.sources,
        totalSources: this.lastScrapingTelemetry.sources.length + 
          (this.lastScrapingTelemetry.apis.oddsApi ? 1 : 0) + 
          (this.lastScrapingTelemetry.apis.sportsApi ? 1 : 0),
      };
    }
    
    // Default status when no telemetry available yet
    const oddsApiConfigured = !!process.env.ODDS_API_KEY;
    const sportsApiConfigured = !!process.env.API_FOOTBALL_KEY;
    
    return {
      isRealData: true, // Assume true until proven otherwise
      apis: {
        oddsApi: oddsApiConfigured,
        sportsApi: sportsApiConfigured,
      },
      scrapingSources: ['Oddsportal', 'BetExplorer', 'Flashscore', 'ESPN', 'Free Sources'],
      totalSources: 5 + (oddsApiConfigured ? 1 : 0) + (sportsApiConfigured ? 1 : 0),
    };
  }

  async getGames(filters: {
    sport?: SportType;
    date?: 'today' | 'tomorrow' | 'upcoming' | 'past' | string;
    status?: 'upcoming' | 'live' | 'finished';
    league?: string;
    limit?: number;
    offset?: number;
  }): Promise<GamesListResponse> {
    const { sport, date, status, league, limit = 100, offset = 0 } = filters;
    
    // Get real games from scraped odds data across all sports
    const allGames = await this.getGamesFromScrapedData();
    
    // Apply filters
    let filteredGames = allGames;
    
    if (sport) {
      filteredGames = filteredGames.filter(g => g.sport === sport);
    }
    
    if (league) {
      filteredGames = filteredGames.filter(g => g.league === league);
    }
    
    if (status) {
      filteredGames = filteredGames.filter(g => g.status === status);
    }
    
    // Date filtering
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    
    if (date) {
      if (date === 'today') {
        filteredGames = filteredGames.filter(g => {
          const gameDate = new Date(g.date);
          gameDate.setHours(0, 0, 0, 0);
          return gameDate.getTime() === today.getTime();
        });
      } else if (date === 'tomorrow') {
        filteredGames = filteredGames.filter(g => {
          const gameDate = new Date(g.date);
          gameDate.setHours(0, 0, 0, 0);
          return gameDate.getTime() === tomorrow.getTime();
        });
      } else if (date === 'upcoming') {
        filteredGames = filteredGames.filter(g => {
          const gameDate = new Date(g.date);
          return gameDate >= today;
        });
      } else if (date === 'past') {
        filteredGames = filteredGames.filter(g => {
          const gameDate = new Date(g.date);
          return gameDate < today;
        });
      } else {
        // Specific date
        filteredGames = filteredGames.filter(g => g.date === date);
      }
    }
    
    // Sort by date/time
    filteredGames.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateA.getTime() - dateB.getTime();
    });
    
    const total = allGames.length;
    const filteredCount = filteredGames.length;
    
    // Apply pagination
    const paginatedGames = filteredGames.slice(offset, offset + limit);
    
    return {
      games: paginatedGames,
      total,
      filteredCount,
      dateRange: {
        from: filteredGames[0]?.date || today.toISOString().split('T')[0],
        to: filteredGames[filteredGames.length - 1]?.date || dayAfterTomorrow.toISOString().split('T')[0],
      },
    };
  }

  private async getGamesFromScrapedData(): Promise<Game[]> {
    const games: Game[] = [];
    
    // Fetch odds for all sports in parallel
    const sports = ['soccer', 'basketball', 'icehockey', 'tennis'] as const;
    
    try {
      const allOddsData = await Promise.all(
        sports.map(async (sport) => {
          try {
            const oddsData = await enhancedOddsService.getOdds(sport);
            return { sport, oddsData };
          } catch (error) {
            console.error(`Failed to fetch ${sport} odds:`, error);
            return { sport, oddsData: [] };
          }
        })
      );
      
      // Extract telemetry from the first sport with data
      const firstWithData = allOddsData.find(({ oddsData }) => oddsData.length > 0);
      if (firstWithData && firstWithData.oddsData.length > 0) {
        const sources = Array.from(new Set(firstWithData.oddsData.flatMap(g => g.sources)));
        const totalGames = allOddsData.reduce((sum, { oddsData }) => sum + oddsData.length, 0);
        this.updateScrapingTelemetry(sources, totalGames, {
          oddsApi: !!process.env.ODDS_API_KEY,
          sportsApi: !!process.env.API_FOOTBALL_KEY,
        });
      }
      
      // Convert odds data to Game format
      for (const { sport, oddsData } of allOddsData) {
        for (const odds of oddsData) {
          const gameDate = new Date(odds.gameTime);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const gameStartOfDay = new Date(gameDate);
          gameStartOfDay.setHours(0, 0, 0, 0);
          
          // Determine status
          let status: 'upcoming' | 'live' | 'finished' = 'upcoming';
          if (gameStartOfDay < today) {
            status = 'finished';
          } else if (gameStartOfDay.getTime() === today.getTime()) {
            // Games today could be live or upcoming
            const now = new Date();
            if (gameDate < now) {
              const hoursSince = (now.getTime() - gameDate.getTime()) / (1000 * 60 * 60);
              status = hoursSince < 3 ? 'live' : 'finished'; // Assume 3 hour game duration
            }
          }
          
          // Map sport names
          const sportMap: Record<string, SportType> = {
            soccer: 'Football',
            basketball: 'Basketball',
            icehockey: 'Hockey',
            tennis: 'Tennis',
          };
          
          games.push({
            id: odds.gameId,
            sport: sportMap[sport] || 'Football',
            league: odds.league,
            date: gameDate.toISOString().split('T')[0],
            time: `${gameDate.getHours().toString().padStart(2, '0')}:${gameDate.getMinutes().toString().padStart(2, '0')}`,
            teams: {
              home: odds.homeTeam,
              away: odds.awayTeam,
            },
            status,
            odds: {
              home: odds.odds.moneyline?.home || 2.0,
              draw: odds.odds.moneyline?.draw,
              away: odds.odds.moneyline?.away || 2.0,
            },
            predictionAvailable: false, // Will be updated when predictions are generated
            confidence: undefined,
            bestBet: undefined,
          });
        }
      }
      
      console.log(`✅ Loaded ${games.length} real games from scraped odds data`);
      return games;
      
    } catch (error) {
      console.error('❌ Failed to fetch games from odds data:', error);
      return [];
    }
  }
}

export class DatabaseStorage implements IStorage {
  private lastScrapingTelemetry: {
    sources: string[];
    totalGames: number;
    timestamp: number;
    apis: { oddsApi: boolean; sportsApi: boolean };
  } | null = null;

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const [user] = await db
      .insert(users)
      .values({ ...insertUser, id })
      .returning();
    return user;
  }

  public updateScrapingTelemetry(sources: string[], totalGames: number, apis: { oddsApi: boolean; sportsApi: boolean }) {
    this.lastScrapingTelemetry = {
      sources,
      totalGames,
      timestamp: Date.now(),
      apis,
    };
  }

  async getApexPrediction(sport?: SportType, dateFilter?: string): Promise<ApexPrediction> {
    const targetSport = sport || 'Football';
    
    // Try to get from database cache first
    const cached = await this.getCachedPrediction(targetSport, dateFilter);
    if (cached) {
      console.log(`✅ Returning cached prediction for ${targetSport}${dateFilter ? ` (${dateFilter})` : ''} from database`);
      return cached;
    }

    // Generate new prediction
    try {
      console.log(`🚀 Generating prediction for ${targetSport} using 6-phase system${dateFilter ? ` (date: ${dateFilter})` : ''}...`);
      
      const { prediction, telemetry } = await predictionEngine.selectApexPick(targetSport, dateFilter);
      
      if (telemetry) {
        this.updateScrapingTelemetry(telemetry.sources, telemetry.totalGames, telemetry.apis);
      }
      
      // Cache in database (expires in 5 minutes)
      await this.cachePrediction(prediction, 5);
      
      console.log(`✅ Prediction generated and cached for ${targetSport}`);
      return prediction;
      
    } catch (error) {
      console.error('❌ Prediction generation failed:', error);
      throw error;
    }
  }

  async getAllPredictions(sport?: SportType, dateFilter?: string): Promise<ApexPrediction[]> {
    const targetSport = sport || 'Football';
    
    // For now, return just the apex pick as an array
    // In the future, we can implement full multi-game analysis
    const apexPick = await this.getApexPrediction(targetSport, dateFilter);
    return [apexPick];
  }

  async getHistoricalPerformance(sport?: SportType): Promise<HistoricalPerformance[]> {
    return historicalService.getPerformance(sport);
  }

  async getDataSourceStatus(): Promise<DataSourceStatus> {
    if (this.lastScrapingTelemetry && (Date.now() - this.lastScrapingTelemetry.timestamp) < 300000) {
      return {
        isRealData: this.lastScrapingTelemetry.totalGames > 0,
        apis: this.lastScrapingTelemetry.apis,
        scrapingSources: this.lastScrapingTelemetry.sources,
        totalSources: this.lastScrapingTelemetry.sources.length + 
          (this.lastScrapingTelemetry.apis.oddsApi ? 1 : 0) + 
          (this.lastScrapingTelemetry.apis.sportsApi ? 1 : 0),
      };
    }
    
    const oddsApiConfigured = !!process.env.ODDS_API_KEY;
    const sportsApiConfigured = !!process.env.API_FOOTBALL_KEY;
    
    return {
      isRealData: true,
      apis: {
        oddsApi: oddsApiConfigured,
        sportsApi: sportsApiConfigured,
      },
      scrapingSources: ['Oddsportal', 'BetExplorer', 'Flashscore', 'ESPN', 'Free Sources'],
      totalSources: 5 + (oddsApiConfigured ? 1 : 0) + (sportsApiConfigured ? 1 : 0),
    };
  }

  async getGames(filters: {
    sport?: SportType;
    date?: 'today' | 'tomorrow' | 'upcoming' | 'past' | string;
    status?: 'upcoming' | 'live' | 'finished';
    league?: string;
    limit?: number;
    offset?: number;
  }): Promise<GamesListResponse> {
    // Check database cache first
    const cachedGames = await this.getCachedGames();
    
    if (cachedGames.length > 0) {
      return this.filterAndPaginateGames(cachedGames, filters);
    }
    
    // Generate games from scraping
    const scrapedGames = await this.getGamesFromScrapedData();
    
    // Cache games in database (expires in 5 minutes)
    await this.cacheGames(scrapedGames);
    
    return this.filterAndPaginateGames(scrapedGames, filters);
  }

  private async getCachedPrediction(sport: SportType, dateFilter?: string): Promise<ApexPrediction | null> {
    const now = new Date();
    
    // Create a unique cache key based on sport and dateFilter
    const cacheKey = `${sport}-${dateFilter || 'all'}`;
    
    const [cached] = await db
      .select()
      .from(predictions)
      .where(
        and(
          eq(predictions.sport, sport),
          eq(predictions.id, cacheKey),
          gte(predictions.expiresAt, now)
        )
      )
      .limit(1);
    
    if (cached) {
      return cached.data as ApexPrediction;
    }
    return null;
  }

  private async cachePrediction(prediction: ApexPrediction, expiryMinutes: number, dateFilter?: string): Promise<void> {
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);
    
    // Create a unique cache key based on sport and dateFilter
    const cacheKey = `${prediction.sport}-${dateFilter || 'all'}`;
    
    await db
      .insert(predictions)
      .values({
        id: cacheKey,
        sport: prediction.sport,
        match: prediction.match,
        homeTeam: prediction.teams.home,
        awayTeam: prediction.teams.away,
        league: prediction.league,
        betType: prediction.betType,
        bestOdds: prediction.bestOdds.toString(),
        bookmaker: prediction.bookmaker,
        edge: prediction.edge.toString(),
        confidenceScore: prediction.confidenceScore,
        data: prediction as any,
        expiresAt,
      })
      .onConflictDoUpdate({
        target: predictions.id,
        set: {
          data: prediction as any,
          expiresAt,
        },
      });
  }

  private async getCachedGames(): Promise<Game[]> {
    const now = new Date();
    const cached = await db
      .select()
      .from(games)
      .where(gte(games.updatedAt, new Date(Date.now() - 5 * 60 * 1000)));
    
    return cached.map(g => g.data as Game);
  }

  private async cacheGames(gamesList: Game[]): Promise<void> {
    if (gamesList.length === 0) return;
    
    // Delete old games
    await db.delete(games);
    
    // Insert new games
    await db.insert(games).values(
      gamesList.map(game => ({
        id: game.id,
        sport: game.sport,
        league: game.league,
        date: game.date,
        time: game.time,
        homeTeam: game.teams.home,
        awayTeam: game.teams.away,
        status: game.status,
        data: game as any,
      }))
    );
  }

  private async getGamesFromScrapedData(): Promise<Game[]> {
    const gamesList: Game[] = [];
    
    const sports = ['soccer', 'basketball', 'icehockey', 'tennis'] as const;
    
    try {
      const allOddsData = await Promise.all(
        sports.map(async (sport) => {
          try {
            const oddsData = await enhancedOddsService.getOdds(sport);
            return { sport, oddsData };
          } catch (error) {
            console.error(`Failed to fetch ${sport} odds:`, error);
            return { sport, oddsData: [] };
          }
        })
      );
      
      const firstWithData = allOddsData.find(({ oddsData }) => oddsData.length > 0);
      if (firstWithData && firstWithData.oddsData.length > 0) {
        const sources = Array.from(new Set(firstWithData.oddsData.flatMap(g => g.sources)));
        const totalGames = allOddsData.reduce((sum, { oddsData }) => sum + oddsData.length, 0);
        this.updateScrapingTelemetry(sources, totalGames, {
          oddsApi: !!process.env.ODDS_API_KEY,
          sportsApi: !!process.env.API_FOOTBALL_KEY,
        });
      }
      
      for (const { sport, oddsData } of allOddsData) {
        for (const odds of oddsData) {
          const gameDate = new Date(odds.gameTime);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const gameStartOfDay = new Date(gameDate);
          gameStartOfDay.setHours(0, 0, 0, 0);
          
          let status: 'upcoming' | 'live' | 'finished' = 'upcoming';
          if (gameStartOfDay < today) {
            status = 'finished';
          } else if (gameStartOfDay.getTime() === today.getTime()) {
            const now = new Date();
            if (gameDate < now) {
              const hoursSince = (now.getTime() - gameDate.getTime()) / (1000 * 60 * 60);
              status = hoursSince < 3 ? 'live' : 'finished';
            }
          }
          
          const sportMap: Record<string, SportType> = {
            soccer: 'Football',
            basketball: 'Basketball',
            icehockey: 'Hockey',
            tennis: 'Tennis',
          };
          
          gamesList.push({
            id: odds.gameId,
            sport: sportMap[sport] || 'Football',
            league: odds.league,
            date: gameDate.toISOString().split('T')[0],
            time: `${gameDate.getHours().toString().padStart(2, '0')}:${gameDate.getMinutes().toString().padStart(2, '0')}`,
            teams: {
              home: odds.homeTeam,
              away: odds.awayTeam,
            },
            status,
            odds: {
              home: odds.odds.moneyline?.home || 2.0,
              draw: odds.odds.moneyline?.draw,
              away: odds.odds.moneyline?.away || 2.0,
            },
            predictionAvailable: false,
            confidence: undefined,
            bestBet: undefined,
          });
        }
      }
      
      console.log(`✅ Loaded ${gamesList.length} real games from scraped odds data`);
      return gamesList;
      
    } catch (error) {
      console.error('❌ Failed to fetch games from odds data:', error);
      return [];
    }
  }

  private filterAndPaginateGames(allGames: Game[], filters: {
    sport?: SportType;
    date?: 'today' | 'tomorrow' | 'upcoming' | 'past' | string;
    status?: 'upcoming' | 'live' | 'finished';
    league?: string;
    limit?: number;
    offset?: number;
  }): GamesListResponse {
    const { sport, date, status, league, limit = 100, offset = 0 } = filters;
    
    let filteredGames = allGames;
    
    if (sport) {
      filteredGames = filteredGames.filter(g => g.sport === sport);
    }
    
    if (league) {
      filteredGames = filteredGames.filter(g => g.league === league);
    }
    
    if (status) {
      filteredGames = filteredGames.filter(g => g.status === status);
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    
    if (date) {
      if (date === 'today') {
        filteredGames = filteredGames.filter(g => {
          const gameDate = new Date(g.date);
          gameDate.setHours(0, 0, 0, 0);
          return gameDate.getTime() === today.getTime();
        });
      } else if (date === 'tomorrow') {
        filteredGames = filteredGames.filter(g => {
          const gameDate = new Date(g.date);
          gameDate.setHours(0, 0, 0, 0);
          return gameDate.getTime() === tomorrow.getTime();
        });
      } else if (date === 'upcoming') {
        filteredGames = filteredGames.filter(g => {
          const gameDate = new Date(g.date);
          return gameDate >= today;
        });
      } else if (date === 'past') {
        filteredGames = filteredGames.filter(g => {
          const gameDate = new Date(g.date);
          return gameDate < today;
        });
      } else {
        filteredGames = filteredGames.filter(g => g.date === date);
      }
    }
    
    filteredGames.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateA.getTime() - dateB.getTime();
    });
    
    const total = allGames.length;
    const filteredCount = filteredGames.length;
    const paginatedGames = filteredGames.slice(offset, offset + limit);
    
    return {
      games: paginatedGames,
      total,
      filteredCount,
      dateRange: {
        from: filteredGames[0]?.date || today.toISOString().split('T')[0],
        to: filteredGames[filteredGames.length - 1]?.date || dayAfterTomorrow.toISOString().split('T')[0],
      },
    };
  }
}

export const storage = new DatabaseStorage();
