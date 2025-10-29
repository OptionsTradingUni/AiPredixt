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
      const limitParam = req.query.limit ? parseInt(req.query.limit as string) : 1000;
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

  // Get ALL games grouped by league (new endpoint for better organization)
  app.get("/api/games/grouped", async (req, res) => {
    try {
      const sportQuery = req.query.sport as string | undefined;
      const dateFilter = req.query.date as string | undefined;
      
      let sport: SportType | undefined = undefined;
      if (sportQuery && sportQuery !== 'All') {
        sport = sportQuery as SportType;
      }

      const gamesResponse = await storage.getGames({
        sport,
        date: dateFilter,
        limit: 1000,
        offset: 0,
      });

      // Group games by league
      const groupedByLeague = gamesResponse.games.reduce((acc, game) => {
        if (!acc[game.league]) {
          acc[game.league] = [];
        }
        acc[game.league].push(game);
        return acc;
      }, {} as Record<string, typeof gamesResponse.games>);

      // Convert to array and sort by number of games
      const leaguesArray = Object.entries(groupedByLeague).map(([league, games]) => ({
        league,
        sport: games[0]?.sport || 'Football',
        games: games.sort((a, b) => {
          const dateA = new Date(`${a.date}T${a.time}`);
          const dateB = new Date(`${b.date}T${b.time}`);
          return dateA.getTime() - dateB.getTime();
        }),
        gameCount: games.length,
      }));

      // Sort leagues by game count (most games first)
      leaguesArray.sort((a, b) => b.gameCount - a.gameCount);

      res.json({
        leagues: leaguesArray,
        totalGames: gamesResponse.total,
        filteredGames: gamesResponse.filteredCount,
        dateRange: gamesResponse.dateRange,
      });
    } catch (error) {
      console.error('Error fetching grouped games:', error);
      res.status(500).json({ error: 'Failed to fetch grouped games' });
    }
  });

  // Get detailed match information
  app.get("/api/games/:id", async (req, res) => {
    try {
      const gameId = req.params.id;
      console.log(`🎯 API request for match detail: ${gameId}`);
      
      const matchDetail = await storage.getMatchDetail(gameId);
      
      if (!matchDetail) {
        console.log(`❌ Match not found: ${gameId}`);
        return res.status(404).json({ 
          error: 'Match not found',
          message: 'The requested match could not be found. It may have been removed or the ID is incorrect.',
          gameId 
        });
      }
      
      console.log(`✅ Match detail returned: ${matchDetail.teams.home} vs ${matchDetail.teams.away}`);
      res.json(matchDetail);
    } catch (error) {
      console.error('❌ Error fetching match detail:', error);
      res.status(500).json({ 
        error: 'Failed to fetch match detail',
        message: 'An error occurred while fetching match data. Some data sources may be temporarily unavailable. Please try again in a few moments.'
      });
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
