import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { SportType } from "@shared/schema";

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
      // Handle 'All' as undefined to get default prediction
      let sport: SportType | undefined = undefined;
      if (sportQuery && sportQuery !== 'All') {
        sport = sportQuery as SportType;
      }
      const prediction = await storage.getApexPrediction(sport);
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
      let sport: SportType | undefined = undefined;
      if (sportQuery && sportQuery !== 'All') {
        sport = sportQuery as SportType;
      }
      const predictions = await storage.getAllPredictions(sport);
      res.json(predictions);
    } catch (error) {
      console.error('Error fetching all predictions:', error);
      res.status(500).json({ error: 'Failed to fetch all predictions' });
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

  const httpServer = createServer(app);

  return httpServer;
}
