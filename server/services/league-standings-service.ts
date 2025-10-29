/**
 * League Standings Service
 * Provides league tables and team form data
 */

interface TeamStanding {
  position: number;
  team: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: string; // Last 5 matches: "WWLDW"
  formPoints: number; // Points from last 5 matches
}

interface LeagueStandings {
  league: string;
  season: string;
  lastUpdated: string;
  standings: TeamStanding[];
}

interface TeamFormDetails {
  team: string;
  recentMatches: {
    date: string;
    opponent: string;
    venue: 'Home' | 'Away';
    score: string;
    result: 'W' | 'D' | 'L';
    competition: string;
  }[];
  formString: string; // "WWLDW"
  points: number; // Last 5 matches
  goalsScored: number;
  goalsConceded: number;
  cleanSheets: number;
}

export class LeagueStandingsService {
  /**
   * Get league standings for a specific league
   */
  async getLeagueStandings(league: string, season: string = '2024/25'): Promise<LeagueStandings> {
    console.log(`📊 Fetching standings for ${league} (${season})...`);
    
    // For now, generate sample standings
    // In production, this would scrape from Sports-Reference.com, ESPN, FBref, etc.
    const standings = this.generateSampleStandings(league, season);
    
    return {
      league,
      season,
      lastUpdated: new Date().toISOString(),
      standings,
    };
  }

  /**
   * Get detailed form for a specific team
   */
  async getTeamForm(team: string, matches: number = 5): Promise<TeamFormDetails> {
    console.log(`📈 Fetching form for ${team} (last ${matches} matches)...`);
    
    // Generate sample form data
    const recentMatches = this.generateRecentMatches(team, matches);
    const formString = recentMatches.map(m => m.result).join('');
    
    let points = 0;
    let goalsScored = 0;
    let goalsConceded = 0;
    let cleanSheets = 0;
    
    recentMatches.forEach(match => {
      const [teamScore, oppScore] = match.score.split('-').map(Number);
      const scored = match.venue === 'Home' ? teamScore : oppScore;
      const conceded = match.venue === 'Home' ? oppScore : teamScore;
      
      goalsScored += scored;
      goalsConceded += conceded;
      
      if (conceded === 0) cleanSheets++;
      
      if (match.result === 'W') points += 3;
      else if (match.result === 'D') points += 1;
    });
    
    return {
      team,
      recentMatches,
      formString,
      points,
      goalsScored,
      goalsConceded,
      cleanSheets,
    };
  }

  /**
   * Get standings position for a specific team
   */
  async getTeamPosition(team: string, league: string): Promise<TeamStanding | null> {
    const standings = await this.getLeagueStandings(league);
    return standings.standings.find(s => s.team === team) || null;
  }

  /**
   * Generate sample standings
   * In production, this would scrape from real sources
   */
  private generateSampleStandings(league: string, season: string): TeamStanding[] {
    const teams = this.getTeamsForLeague(league);
    
    // Generate realistic standings
    const standings: TeamStanding[] = teams.map((team, index) => {
      const played = 28 + Math.floor(Math.random() * 10);
      const won = Math.floor(played * (0.7 - index * 0.05));
      const drawn = Math.floor(played * 0.2);
      const lost = played - won - drawn;
      const goalsFor = won * 2 + drawn + Math.floor(Math.random() * 20);
      const goalsAgainst = lost * 2 + Math.floor(Math.random() * 15);
      const points = won * 3 + drawn;
      
      // Generate form (last 5 matches)
      const formResults = ['W', 'W', 'D', 'L', 'W'];
      const form = formResults.slice(0, 5).join('');
      const formPoints = formResults.reduce((sum, r) => sum + (r === 'W' ? 3 : r === 'D' ? 1 : 0), 0);
      
      return {
        position: index + 1,
        team,
        played,
        won,
        drawn,
        lost,
        goalsFor,
        goalsAgainst,
        goalDifference: goalsFor - goalsAgainst,
        points,
        form,
        formPoints,
      };
    });
    
    // Sort by points, then goal difference
    return standings.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return b.goalDifference - a.goalDifference;
    }).map((s, index) => ({ ...s, position: index + 1 }));
  }

  /**
   * Generate recent matches for a team
   */
  private generateRecentMatches(team: string, count: number): TeamFormDetails['recentMatches'] {
    const opponents = ['Liverpool', 'Chelsea', 'Arsenal', 'Tottenham', 'Newcastle', 'Brighton'];
    const results: Array<'W' | 'D' | 'L'> = ['W', 'W', 'D', 'L', 'W'];
    
    return Array.from({ length: count }, (_, i) => {
      const daysAgo = (i + 1) * 7; // Weekly matches
      const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const venue: 'Home' | 'Away' = i % 2 === 0 ? 'Home' : 'Away';
      const opponent = opponents[i % opponents.length];
      const result = results[i % results.length];
      
      // Generate realistic scores
      let score: string;
      if (result === 'W') {
        score = venue === 'Home' ? '2-1' : '1-2';
      } else if (result === 'D') {
        score = '1-1';
      } else {
        score = venue === 'Home' ? '1-2' : '2-1';
      }
      
      return {
        date,
        opponent,
        venue,
        score,
        result,
        competition: 'Premier League',
      };
    });
  }

  /**
   * Get teams for a specific league
   */
  private getTeamsForLeague(league: string): string[] {
    const leagues: Record<string, string[]> = {
      'Premier League': [
        'Manchester City', 'Liverpool', 'Arsenal', 'Chelsea', 'Tottenham',
        'Manchester United', 'Newcastle', 'Brighton', 'Aston Villa', 'West Ham',
        'Wolves', 'Fulham', 'Brentford', 'Crystal Palace', 'Everton',
        'Nottingham Forest', 'Bournemouth', 'Luton', 'Sheffield United', 'Burnley'
      ],
      'La Liga': [
        'Real Madrid', 'Barcelona', 'Atletico Madrid', 'Real Sociedad', 'Athletic Bilbao',
        'Villarreal', 'Real Betis', 'Sevilla', 'Valencia', 'Osasuna',
        'Girona', 'Getafe', 'Mallorca', 'Alaves', 'Celta Vigo',
        'Rayo Vallecano', 'Las Palmas', 'Cadiz', 'Almeria', 'Granada'
      ],
      'Serie A': [
        'Inter Milan', 'AC Milan', 'Juventus', 'Napoli', 'Roma',
        'Lazio', 'Atalanta', 'Fiorentina', 'Bologna', 'Torino',
        'Monza', 'Udinese', 'Sassuolo', 'Lecce', 'Verona',
        'Empoli', 'Cagliari', 'Frosinone', 'Salernitana', 'Genoa'
      ],
      'Bundesliga': [
        'Bayern Munich', 'Borussia Dortmund', 'RB Leipzig', 'Bayer Leverkusen', 'Eintracht Frankfurt',
        'Freiburg', 'Union Berlin', 'Wolfsburg', 'Mainz', 'Gladbach',
        'Stuttgart', 'Hoffenheim', 'Augsburg', 'Werder Bremen', 'Bochum',
        'Heidenheim', 'Darmstadt', 'Cologne'
      ],
      'Champions League': [
        'Manchester City', 'Real Madrid', 'Bayern Munich', 'Barcelona', 'PSG',
        'Inter Milan', 'Atletico Madrid', 'Dortmund', 'Arsenal', 'Liverpool'
      ],
    };
    
    return leagues[league] || [
      'Team A', 'Team B', 'Team C', 'Team D', 'Team E',
      'Team F', 'Team G', 'Team H', 'Team I', 'Team J'
    ];
  }

  /**
   * Scrape real standings from Sports-Reference.com, ESPN, FBref
   * This is a placeholder for future implementation
   */
  private async scrapeRealStandings(league: string, season: string): Promise<TeamStanding[]> {
    // TODO: Implement real scraping from:
    // - Sports-Reference.com (Basketball-Reference, Pro-Football-Reference, etc.)
    // - ESPN (league tables)
    // - FBref (detailed football statistics)
    // - Official league websites
    
    console.log('🔄 Real standings scraping will be implemented in next update');
    return [];
  }
}

export const leagueStandingsService = new LeagueStandingsService();
