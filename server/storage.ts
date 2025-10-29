import { type User, type InsertUser, type ApexPrediction, type HistoricalPerformance, type SportType, type Game, type GamesListResponse } from "@shared/schema";
import { randomUUID } from "crypto";
import { predictionEngine } from "./services/prediction-engine";
import { historicalService } from "./services/historical-service";
import { enhancedOddsService } from "./services/enhanced-odds-service";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getApexPrediction(sport?: SportType): Promise<ApexPrediction>;
  getAllPredictions(sport?: SportType): Promise<ApexPrediction[]>;
  getHistoricalPerformance(sport?: SportType): Promise<HistoricalPerformance[]>;
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

  constructor() {
    this.users = new Map();
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

  async getApexPrediction(sport?: SportType): Promise<ApexPrediction> {
    const targetSport = sport || 'Football';
    
    // Check cache first
    const cached = this.predictionCache.get(targetSport);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < this.CACHE_TTL) {
      console.log(`✅ Returning cached prediction for ${targetSport}`);
      return cached.prediction;
    }

    try {
      console.log(`🚀 Generating prediction for ${targetSport} using 6-phase system...`);
      console.log(`📡 Free APIs: Odds API (${process.env.ODDS_API_KEY ? 'configured' : 'not configured'}), API-Football (${process.env.API_FOOTBALL_KEY ? 'configured' : 'not configured'})`);
      
      // Generate prediction using the full 6-phase system
      const prediction = await predictionEngine.selectApexPick(targetSport);
      
      // Cache the prediction
      this.predictionCache.set(targetSport, {
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

  async getAllPredictions(sport?: SportType): Promise<ApexPrediction[]> {
    const targetSport = sport || 'Football';
    
    // Check cache first
    const cached = this.allGamesCache.get(targetSport);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < this.CACHE_TTL) {
      console.log(`✅ Returning cached all-games predictions for ${targetSport} (${cached.predictions.length} games)`);
      return cached.predictions;
    }

    try {
      console.log(`🚀 Analyzing all ${targetSport} games...`);
      
      // Generate predictions for ALL games using the full analysis system
      const predictions = await predictionEngine.analyzeAllGames(targetSport);
      
      // Cache the predictions
      this.allGamesCache.set(targetSport, {
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

export const storage = new MemStorage();
