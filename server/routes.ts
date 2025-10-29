import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { SportType } from "@shared/schema";
import { h2hService } from "./services/h2h-service";
import { leagueStandingsService } from "./services/league-standings-service";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint for Railway
  app.get("/health", (req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development"
    });
  });

  // Get apex prediction (single best pick)
  app.get("/api/apex-prediction", async (req, res) => {
    try {
      const sportQuery = req.query.sport as string | undefined;
      const dateFilter = req.query.date as string | undefined;
      // Handle 'All' as undefined to get default prediction
      let sport: SportType | undefined = undefined;
      if (sportQuery && sportQuery !== 'All') {
        sport = sportQuery as SportType;
      }
      const prediction = await storage.getApexPrediction(sport, dateFilter);
      res.json(prediction);
    } catch (error) {
      console.error('Error fetching apex prediction:', error);
      res.status(500).json({ error: 'Failed to fetch prediction' });
    }
  });

  // Get all predictions (all analyzed games)
  app.get("/api/all-predictions", async (req, res) => {
    try {
      const sportQuery = req.query.sport as string | undefined;
      const dateFilter = req.query.date as string | undefined;
      let sport: SportType | undefined = undefined;
      if (sportQuery && sportQuery !== 'All') {
        sport = sportQuery as SportType;
      }
      const predictions = await storage.getAllPredictions(sport, dateFilter);
      res.json(predictions);
    } catch (error) {
      console.error('Error fetching all predictions:', error);
      res.status(500).json({ error: 'Failed to fetch all predictions' });
    }
  });

  // Get data source status
  app.get("/api/data-source-status", async (req, res) => {
    try {
      const status = await storage.getDataSourceStatus();
      res.json(status);
    } catch (error) {
      console.error('Error fetching data source status:', error);
      res.status(500).json({ error: 'Failed to fetch data source status' });
    }
  });

  // Get historical performance data
  app.get("/api/historical-performance", async (req, res) => {
    try {
      const sportQuery = req.query.sport as string | undefined;
      // Handle 'All' as undefined
      let sport: SportType | undefined = undefined;
      if (sportQuery && sportQuery !== 'All') {
        sport = sportQuery as SportType;
      }
      const performance = await storage.getHistoricalPerformance(sport);
      res.json(performance);
    } catch (error) {
      console.error('Error fetching historical performance:', error);
      res.status(500).json({ error: 'Failed to fetch historical performance' });
    }
  });

  // Get games list with filtering
  app.get("/api/games", async (req, res) => {
    try {
      const sportQuery = req.query.sport as string | undefined;
      const dateFilter = req.query.date as string | undefined;
      const statusFilter = req.query.status as 'upcoming' | 'live' | 'finished' | undefined;
      const leagueFilter = req.query.league as string | undefined;
      const limitParam = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const offsetParam = req.query.offset ? parseInt(req.query.offset as string) : 0;
      
      let sport: SportType | undefined = undefined;
      if (sportQuery && sportQuery !== 'All') {
        sport = sportQuery as SportType;
      }

      const games = await storage.getGames({
        sport,
        date: dateFilter,
        status: statusFilter,
        league: leagueFilter,
        limit: limitParam,
        offset: offsetParam,
      });
      
      res.json(games);
    } catch (error) {
      console.error('Error fetching games:', error);
      res.status(500).json({ error: 'Failed to fetch games' });
    }
  });

  // Get H2H (Head-to-Head) data for two teams
  app.get("/api/h2h", async (req, res) => {
    try {
      const teamA = req.query.teamA as string;
      const teamB = req.query.teamB as string;
      const sport = req.query.sport as string || 'Football';
      
      if (!teamA || !teamB) {
        return res.status(400).json({ error: 'teamA and teamB are required' });
      }
      
      const h2hData = await h2hService.getH2HData(teamA, teamB, sport);
      res.json(h2hData);
    } catch (error) {
      console.error('Error fetching H2H data:', error);
      res.status(500).json({ error: 'Failed to fetch H2H data' });
    }
  });

  // Get league standings
  app.get("/api/standings", async (req, res) => {
    try {
      const league = req.query.league as string;
      const season = req.query.season as string || '2024/25';
      
      if (!league) {
        return res.status(400).json({ error: 'league is required' });
      }
      
      const standings = await leagueStandingsService.getLeagueStandings(league, season);
      res.json(standings);
    } catch (error) {
      console.error('Error fetching standings:', error);
      res.status(500).json({ error: 'Failed to fetch standings' });
    }
  });

  // Get team form
  app.get("/api/team-form", async (req, res) => {
    try {
      const team = req.query.team as string;
      const matches = parseInt(req.query.matches as string) || 5;
      
      if (!team) {
        return res.status(400).json({ error: 'team is required' });
      }
      
      const form = await leagueStandingsService.getTeamForm(team, matches);
      res.json(form);
    } catch (error) {
      console.error('Error fetching team form:', error);
      res.status(500).json({ error: 'Failed to fetch team form' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
