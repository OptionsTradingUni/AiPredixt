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
   */
  async getH2HData(teamA: string, teamB: string, sport: string = 'Football'): Promise<H2HData> {
    console.log(`📊 Fetching H2H data: ${teamA} vs ${teamB}...`);
    
    // For now, generate sample data based on team names
    // In production, this would scrape from Flashscore, ESPN, FBref, etc.
    const matches = this.generateSampleH2HMatches(teamA, teamB, sport);
    
    // Split matches by venue
    const homeMatches = matches.filter(m => m.venue === 'Home');
    const awayMatches = matches.filter(m => m.venue === 'Away');
    
    // Calculate statistics
    const allStats = this.calculateStats(matches, teamA);
    const homeStats = this.calculateStats(homeMatches, teamA);
    const awayStats = this.calculateStats(awayMatches, teamA);
    
    const summary = this.generateSummary(teamA, teamB, allStats);
    
    return {
      teamA,
      teamB,
      all: {
        matches,
        stats: allStats,
      },
      homeAdvantage: {
        matches: homeMatches,
        stats: homeStats,
      },
      awayAdvantage: {
        matches: awayMatches,
        stats: awayStats,
      },
      lastMeeting: matches[0], // Most recent match
      summary,
    };
  }

  /**
   * Generate sample H2H matches
   * In production, this would scrape real data from multiple sources
   */
  private generateSampleH2HMatches(teamA: string, teamB: string, sport: string): H2HMatch[] {
    const matches: H2HMatch[] = [];
    const competitions = ['Premier League', 'FA Cup', 'Champions League', 'League Cup'];
    
    // Generate 10 historical matches
    for (let i = 0; i < 10; i++) {
      const isHomeGame = i % 2 === 0;
      const daysAgo = (i + 1) * 45; // ~45 days between matches
      const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      // Randomize scores but make it realistic
      const homeScore = Math.floor(Math.random() * 4);
      const awayScore = Math.floor(Math.random() * 3);
      
      const homeTeam = isHomeGame ? teamA : teamB;
      const awayTeam = isHomeGame ? teamB : teamA;
      
      // Determine result from teamA's perspective
      let result: 'Win' | 'Draw' | 'Loss';
      if (isHomeGame) {
        result = homeScore > awayScore ? 'Win' : homeScore === awayScore ? 'Draw' : 'Loss';
      } else {
        result = awayScore > homeScore ? 'Win' : awayScore === homeScore ? 'Draw' : 'Loss';
      }
      
      matches.push({
        date,
        homeTeam,
        awayTeam,
        score: `${homeScore}-${awayScore}`,
        homeScore,
        awayScore,
        competition: competitions[Math.floor(Math.random() * competitions.length)],
        venue: isHomeGame ? 'Home' : 'Away',
        result,
      });
    }
    
    return matches.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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

  /**
   * Scrape real H2H data from Flashscore, ESPN, FBref
   * This is a placeholder for future implementation
   */
  private async scrapeRealH2HData(teamA: string, teamB: string, sport: string): Promise<H2HMatch[]> {
    // TODO: Implement real scraping from:
    // - Flashscore (detailed match results)
    // - ESPN (match reports and scores)
    // - FBref (comprehensive statistics)
    // - WhoScored (advanced match data)
    // - Sofascore (recent results)
    
    console.log('🔄 Real H2H scraping will be implemented in next update');
    return [];
  }
}

export const h2hService = new H2HService();
