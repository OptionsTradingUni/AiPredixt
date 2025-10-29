/**
 * Head-to-Head (H2H) Service
 * Provides historical match results between two teams
 * Shows ALL matches, Home matches, and Away matches separately
 */

interface H2HMatch {
  date: string;
  homeTeam: string;
  awayTeam: string;
  score: string;
  homeScore: number;
  awayScore: number;
  competition: string;
  venue: 'Home' | 'Away' | 'Neutral';
  result: 'Win' | 'Draw' | 'Loss';
}

interface H2HStats {
  totalMatches: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  averageGoalsFor: number;
  averageGoalsAgainst: number;
  winPercentage: number;
  form: string; // Last 5 results: "WWLDW"
}

interface H2HData {
  teamA: string;
  teamB: string;
  all: {
    matches: H2HMatch[];
    stats: H2HStats;
  };
  homeAdvantage: {
    // teamA playing at home
    matches: H2HMatch[];
    stats: H2HStats;
  };
  awayAdvantage: {
    // teamA playing away
    matches: H2HMatch[];
    stats: H2HStats;
  };
  lastMeeting?: H2HMatch;
  summary: string;
}

export class H2HService {
  /**
   * Get comprehensive H2H data between two teams
   * Returns empty data - real data scraping not yet implemented
   */
  async getH2HData(teamA: string, teamB: string, sport: string = 'Football'): Promise<H2HData> {
    console.log(`📊 H2H data not available - real data scraping needed for ${teamA} vs ${teamB}`);
    
    // Return empty H2H data - no fake data
    // Real implementation would scrape from Flashscore, ESPN, FBref, etc.
    const matches: H2HMatch[] = [];
    
    // Calculate statistics (empty)
    const emptyStats: H2HStats = {
      totalMatches: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      averageGoalsFor: 0,
      averageGoalsAgainst: 0,
      winPercentage: 0,
      form: '',
    };
    
    const summary = `No historical data available for ${teamA} vs ${teamB}. Real data scraping needed.`;
    
    return {
      teamA,
      teamB,
      all: {
        matches,
        stats: emptyStats,
      },
      homeAdvantage: {
        matches: [],
        stats: emptyStats,
      },
      awayAdvantage: {
        matches: [],
        stats: emptyStats,
      },
      lastMeeting: undefined,
      summary,
    };
  }

  /**
   * Calculate comprehensive stats from matches
   */
  private calculateStats(matches: H2HMatch[], teamName: string): H2HStats {
    if (matches.length === 0) {
      return {
        totalMatches: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        averageGoalsFor: 0,
        averageGoalsAgainst: 0,
        winPercentage: 0,
        form: '',
      };
    }
    
    let wins = 0;
    let draws = 0;
    let losses = 0;
    let goalsFor = 0;
    let goalsAgainst = 0;
    const formResults: string[] = [];
    
    matches.forEach((match, index) => {
      // Track goals from teamName's perspective
      const isHome = match.homeTeam === teamName;
      const teamGoals = isHome ? match.homeScore : match.awayScore;
      const opponentGoals = isHome ? match.awayScore : match.homeScore;
      
      goalsFor += teamGoals;
      goalsAgainst += opponentGoals;
      
      if (match.result === 'Win') wins++;
      else if (match.result === 'Draw') draws++;
      else losses++;
      
      // Build form string (last 5 matches)
      if (index < 5) {
        formResults.push(match.result === 'Win' ? 'W' : match.result === 'Draw' ? 'D' : 'L');
      }
    });
    
    const totalMatches = matches.length;
    const winPercentage = (wins / totalMatches) * 100;
    
    return {
      totalMatches,
      wins,
      draws,
      losses,
      goalsFor,
      goalsAgainst,
      averageGoalsFor: parseFloat((goalsFor / totalMatches).toFixed(2)),
      averageGoalsAgainst: parseFloat((goalsAgainst / totalMatches).toFixed(2)),
      winPercentage: parseFloat(winPercentage.toFixed(1)),
      form: formResults.join(''),
    };
  }

  /**
   * Generate a summary of the H2H record
   */
  private generateSummary(teamA: string, teamB: string, stats: H2HStats): string {
    if (stats.totalMatches === 0) {
      return `${teamA} and ${teamB} have not met in recent history.`;
    }
    
    const dominantTeam = stats.winPercentage > 60 ? teamA : stats.winPercentage < 40 ? teamB : null;
    
    if (dominantTeam) {
      return `${dominantTeam} has been dominant in this fixture, winning ${stats.winPercentage.toFixed(0)}% of the last ${stats.totalMatches} meetings (${stats.wins}W ${stats.draws}D ${stats.losses}L). Recent form: ${stats.form}`;
    }
    
    return `This fixture has been evenly matched, with ${teamA} winning ${stats.winPercentage.toFixed(0)}% of the last ${stats.totalMatches} meetings (${stats.wins}W ${stats.draws}D ${stats.losses}L). Recent form: ${stats.form}`;
  }

  /**
   * Get simple form string for a team
   */
  getTeamForm(stats: H2HStats): string {
    return stats.form || 'UNKNOWN';
  }
}

export const h2hService = new H2HService();
