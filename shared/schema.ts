import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Sports Prediction Types

export type SportType = 'Football' | 'Tennis' | 'Basketball' | 'Hockey';

export interface Probability {
  ensembleAverage: number;
  calibratedRange: {
    lower: number;
    upper: number;
  };
}

export interface RiskAssessment {
  var: number; // Value at Risk
  cvar: number; // Conditional Value at Risk
  sensitivityAnalysis: string;
  adversarialSimulation: string;
  blackSwanResilience: string;
  keyRisks: string[];
  potentialFailures: string[];
}

export interface ExplainabilityFeature {
  feature: string;
  weight: number;
  impact: string;
  causalLink: string;
}

export interface NewsItem {
  headline: string;
  source: string;
  timestamp: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  summary: string;
  relevance: 'high' | 'medium' | 'low';
  category: 'injury' | 'form' | 'transfer' | 'tactical' | 'general';
}

export interface Justification {
  summary: string;
  deepDive: string[];
  competitiveEdge: string[];
  narrativeDebunking?: string;
  refutation?: string;
  explainabilityScore: number;
  keyFeatures: ExplainabilityFeature[];
  detailedNews?: {
    homeTeam: NewsItem[];
    awayTeam: NewsItem[];
    general: NewsItem[];
  };
}

export interface ContingencyPick {
  sport: SportType;
  match: string;
  betType: string;
  odds: number;
  confidenceScore: number;
  stakeSize: string;
  triggerConditions: string[];
}

export interface BettingMarket {
  category: 'moneyline' | 'spread' | 'totals' | 'btts' | 'correct_score' | 'half_full' | 'handicap' | 'other';
  selection: string; // e.g., "Home Win", "Over 2.5", "Draw", "Away -1.5"
  line?: number; // For spread/totals (e.g., 2.5, -1.5)
  odds: number;
  bookmaker: string;
  marketLiquidity: 'High' | 'Medium' | 'Low';
  calculatedProbability: Probability;
  impliedProbability: number;
  edge: number; // EV percentage
  confidenceScore: number; // 1-100
  recommendedStake: {
    kellyFraction: string;
    unitDescription: string;
    percentageOfBankroll: number;
  };
  dataSources: string[]; // e.g., ["TheSportsDB", "FBref", "Sofascore"]
}

export interface LeagueInfo {
  name: string;
  displayName: string;
  country: string;
  region: string;
  tier: string;
  type: 'League' | 'Cup' | 'Tournament' | 'International';
  popularity: 'High' | 'Medium' | 'Low';
}

export interface ApexPrediction {
  id: string;
  sport: SportType;
  match: string;
  teams: {
    home: string;
    away: string;
  };
  league: string;
  leagueInfo?: LeagueInfo;
  
  // Legacy fields for backward compatibility
  betType: string;
  bestOdds: number;
  bookmaker: string;
  marketLiquidity: 'High' | 'Medium' | 'Low';
  calculatedProbability: Probability;
  impliedProbability: number;
  edge: number; // EV percentage
  confidenceScore: number; // 1-100
  recommendedStake: {
    kellyFraction: string;
    unitDescription: string;
    percentageOfBankroll: number;
  };
  
  timestamp: string;
  predictionStability: 'High' | 'Medium' | 'Low';
  riskAssessment: RiskAssessment;
  justification: Justification;
  contingencyPick: ContingencyPick;
  
  // New fields for multiple markets support
  primaryMarket?: BettingMarket;
  markets?: BettingMarket[];
  totalDataSources?: number;
  mainDataSources?: string[];
}

export interface HistoricalPerformance {
  date: string;
  sport: SportType;
  accuracy: number;
  roi: number;
  confidenceScore: number;
}

export type SelectApexPrediction = ApexPrediction;

// Game Listing Types
export interface Game {
  id: string;
  sport: SportType;
  league: string;
  date: string; // ISO date
  time: string; // HH:mm
  teams: {
    home: string;
    away: string;
  };
  status: 'upcoming' | 'live' | 'finished';
  currentScore?: {
    home: number;
    away: number;
  };
  odds: {
    home: number;
    draw?: number;
    away: number;
  };
  predictionAvailable: boolean;
  confidence?: number; // 0-100
  bestBet?: {
    type: string;
    odds: number;
    ev: number; // Expected value %
  };
}

export interface GamesListResponse {
  games: Game[];
  total: number;
  filteredCount: number;
  dateRange: {
    from: string;
    to: string;
  };
}
