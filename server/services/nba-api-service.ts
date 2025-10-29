// @ts-ignore - No type definitions available for 'nba' package
import NBA from 'nba';

/**
 * NBA API Service
 * 
 * Uses the 'nba' npm package to access stats.nba.com endpoints
 * Provides NBA stats, player data, team information
 * 
 * NOTE: NBA blacklists cloud provider IPs (AWS, Heroku, etc.)
 * This may cause issues in production deployments
 */

export interface NBAPlayerStats {
  playerId: number;
  playerName: string;
  teamId: number;
  teamName: string;
  games: number;
  points: number;
  rebounds: number;
  assists: number;
  [key: string]: any;
}

export interface NBATeamStats {
  teamId: number;
  teamName: string;
  wins: number;
  losses: number;
  winPct: number;
  conference: string;
  division: string;
  [key: string]: any;
}

export interface NBAGameData {
  gameId: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  gameDate: string;
  status: string;
}

export class NBAApiService {
  private enabled: boolean = true;

  /**
   * Find a player by name
   */
  findPlayer(firstName: string, lastName: string): any {
    try {
      const playerName = `${firstName} ${lastName}`;
      console.log(`🔍 Searching for NBA player: ${playerName}...`);
      
      const player = NBA.findPlayer(playerName);
      
      if (player) {
        console.log(`✅ Found player: ${player.firstName} ${player.lastName} (ID: ${player.playerId})`);
        return player;
      }
      
      console.log(`⚠️  Player not found: ${playerName}`);
      return null;
    } catch (error: any) {
      console.error(`❌ NBA player search error: ${error.message}`);
      return null;
    }
  }

  /**
   * Get player stats for current season
   */
  async getPlayerStats(playerId: number): Promise<any> {
    try {
      console.log(`📊 Fetching stats for player ID: ${playerId}...`);
      
      const stats = await NBA.stats.playerProfile({
        PlayerID: playerId,
      });
      
      console.log(`✅ Retrieved player stats`);
      return stats;
    } catch (error: any) {
      console.error(`❌ NBA player stats error: ${error.message}`);
      if (error.message.includes('timeout') || error.message.includes('ECONNREFUSED')) {
        console.warn('⚠️  NBA API may be blocking cloud provider IPs');
      }
      return null;
    }
  }

  /**
   * Get team roster
   */
  async getTeamRoster(teamId: number, season: string = '2024'): Promise<any> {
    try {
      console.log(`👥 Fetching roster for team ID: ${teamId}, season: ${season}...`);
      
      const roster = await NBA.stats.teamPlayers({
        TeamID: teamId,
        Season: season,
      });
      
      console.log(`✅ Retrieved team roster`);
      return roster;
    } catch (error: any) {
      console.error(`❌ NBA team roster error: ${error.message}`);
      return null;
    }
  }

  /**
   * Get league standings
   */
  async getStandings(season: string = '2024'): Promise<any> {
    try {
      console.log(`📊 Fetching NBA standings for ${season}...`);
      
      const standings = await NBA.stats.leagueStandings({
        Season: season,
        SeasonType: 'Regular Season',
      });
      
      console.log(`✅ Retrieved league standings`);
      return standings;
    } catch (error: any) {
      console.error(`❌ NBA standings error: ${error.message}`);
      return null;
    }
  }

  /**
   * Get today's games
   */
  async getTodaysGames(): Promise<any> {
    try {
      console.log(`🏀 Fetching today's NBA games...`);
      
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const dateString = `${year}${month}${day}`;
      
      const scoreboard = await NBA.stats.scoreboard({
        GameDate: dateString,
      });
      
      console.log(`✅ Retrieved today's games`);
      return scoreboard;
    } catch (error: any) {
      console.error(`❌ NBA scoreboard error: ${error.message}`);
      return null;
    }
  }

  /**
   * Get team stats
   */
  async getTeamStats(teamId: number, season: string = '2024'): Promise<any> {
    try {
      console.log(`📈 Fetching team stats for team ID: ${teamId}...`);
      
      const stats = await NBA.stats.teamInfoCommon({
        TeamID: teamId,
        Season: season,
      });
      
      console.log(`✅ Retrieved team stats`);
      return stats;
    } catch (error: any) {
      console.error(`❌ NBA team stats error: ${error.message}`);
      return null;
    }
  }

  /**
   * Get all NBA teams (from bundled data)
   */
  getAllTeams(): any[] {
    try {
      console.log(`📋 Getting all NBA teams...`);
      
      const teams = NBA.teams;
      console.log(`✅ Retrieved ${teams.length} NBA teams`);
      
      return teams;
    } catch (error: any) {
      console.error(`❌ NBA teams error: ${error.message}`);
      return [];
    }
  }

  /**
   * Get all current NBA players (from bundled data)
   */
  getAllPlayers(): any[] {
    try {
      console.log(`📋 Getting all NBA players...`);
      
      const players = NBA.players;
      console.log(`✅ Retrieved ${players.length} NBA players`);
      
      return players;
    } catch (error: any) {
      console.error(`❌ NBA players error: ${error.message}`);
      return [];
    }
  }

  /**
   * Search for teams by city or name
   */
  findTeam(query: string): any {
    try {
      console.log(`🔍 Searching for NBA team: ${query}...`);
      
      const teams = NBA.teams;
      const team = teams.find((t: any) => 
        t.teamName.toLowerCase().includes(query.toLowerCase()) ||
        t.simpleName.toLowerCase().includes(query.toLowerCase()) ||
        t.location.toLowerCase().includes(query.toLowerCase())
      );
      
      if (team) {
        console.log(`✅ Found team: ${team.teamName}`);
        return team;
      }
      
      console.log(`⚠️  Team not found: ${query}`);
      return null;
    } catch (error: any) {
      console.error(`❌ NBA team search error: ${error.message}`);
      return null;
    }
  }

  /**
   * Get comprehensive game data with stats
   */
  async getGameDetails(gameId: string): Promise<any> {
    try {
      console.log(`🎮 Fetching game details for: ${gameId}...`);
      
      const boxscore = await NBA.stats.boxScore({
        GameID: gameId,
      });
      
      console.log(`✅ Retrieved game details`);
      return boxscore;
    } catch (error: any) {
      console.error(`❌ NBA game details error: ${error.message}`);
      return null;
    }
  }

  /**
   * Health check - verify NBA API is accessible
   */
  async healthCheck(): Promise<{ accessible: boolean; message: string }> {
    try {
      console.log(`🏥 Checking NBA API health...`);
      
      const teams = this.getAllTeams();
      
      if (teams && teams.length > 0) {
        console.log(`✅ NBA API is accessible (${teams.length} teams loaded)`);
        return {
          accessible: true,
          message: `NBA API accessible with ${teams.length} teams loaded`,
        };
      }
      
      return {
        accessible: false,
        message: 'NBA API returned no teams',
      };
    } catch (error: any) {
      console.error(`❌ NBA API health check failed: ${error.message}`);
      return {
        accessible: false,
        message: `NBA API error: ${error.message}`,
      };
    }
  }
}

export const nbaApiService = new NBAApiService();
