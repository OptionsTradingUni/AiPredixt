import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { SportType } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get apex prediction
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

  const httpServer = createServer(app);

  return httpServer;
}
