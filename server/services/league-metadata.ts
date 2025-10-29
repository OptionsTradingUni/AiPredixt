/**
 * League Metadata Service
 * 
 * Provides comprehensive league information including:
 * - Country/Region
 * - Competition tier (1st, 2nd, Cup, International)
 * - Competition type (League, Cup, Tournament)
 * - Sport type
 */

export interface LeagueMetadata {
  name: string;
  country: string;
  region: string; // e.g., "Europe", "North America", "South America", "Asia", "Africa", "Oceania"
  tier: string; // e.g., "1st Division", "2nd Division", "Cup", "International", "Champions League"
  type: 'League' | 'Cup' | 'Tournament' | 'International';
  sport: string;
  displayName: string;
  popularity: 'High' | 'Medium' | 'Low';
}

class LeagueMetadataService {
  private leagueMap: Map<string, LeagueMetadata> = new Map();

  constructor() {
    this.initializeLeagues();
  }

  private initializeLeagues() {
    // FOOTBALL / SOCCER LEAGUES
    const footballLeagues: LeagueMetadata[] = [
      // England
      { name: 'Premier League', displayName: 'English Premier League', country: 'England', region: 'Europe', tier: '1st Division', type: 'League', sport: 'Football', popularity: 'High' },
      { name: 'EFL Championship', displayName: 'English Championship', country: 'England', region: 'Europe', tier: '2nd Division', type: 'League', sport: 'Football', popularity: 'Medium' },
      { name: 'FA Cup', displayName: 'FA Cup', country: 'England', region: 'Europe', tier: 'Cup', type: 'Cup', sport: 'Football', popularity: 'High' },
      { name: 'EFL Cup', displayName: 'Carabao Cup', country: 'England', region: 'Europe', tier: 'Cup', type: 'Cup', sport: 'Football', popularity: 'Medium' },
      
      // Spain
      { name: 'La Liga', displayName: 'Spanish La Liga', country: 'Spain', region: 'Europe', tier: '1st Division', type: 'League', sport: 'Football', popularity: 'High' },
      { name: 'Segunda División', displayName: 'La Liga 2', country: 'Spain', region: 'Europe', tier: '2nd Division', type: 'League', sport: 'Football', popularity: 'Medium' },
      { name: 'Copa del Rey', displayName: 'Copa del Rey', country: 'Spain', region: 'Europe', tier: 'Cup', type: 'Cup', sport: 'Football', popularity: 'Medium' },
      
      // Germany
      { name: 'Bundesliga', displayName: 'German Bundesliga', country: 'Germany', region: 'Europe', tier: '1st Division', type: 'League', sport: 'Football', popularity: 'High' },
      { name: '2. Bundesliga', displayName: 'Bundesliga 2', country: 'Germany', region: 'Europe', tier: '2nd Division', type: 'League', sport: 'Football', popularity: 'Medium' },
      { name: 'DFB-Pokal', displayName: 'DFB Pokal', country: 'Germany', region: 'Europe', tier: 'Cup', type: 'Cup', sport: 'Football', popularity: 'Medium' },
      
      // Italy
      { name: 'Serie A', displayName: 'Italian Serie A', country: 'Italy', region: 'Europe', tier: '1st Division', type: 'League', sport: 'Football', popularity: 'High' },
      { name: 'Serie B', displayName: 'Serie B', country: 'Italy', region: 'Europe', tier: '2nd Division', type: 'League', sport: 'Football', popularity: 'Medium' },
      { name: 'Coppa Italia', displayName: 'Coppa Italia', country: 'Italy', region: 'Europe', tier: 'Cup', type: 'Cup', sport: 'Football', popularity: 'Medium' },
      
      // France
      { name: 'Ligue 1', displayName: 'French Ligue 1', country: 'France', region: 'Europe', tier: '1st Division', type: 'League', sport: 'Football', popularity: 'High' },
      { name: 'Ligue 2', displayName: 'Ligue 2', country: 'France', region: 'Europe', tier: '2nd Division', type: 'League', sport: 'Football', popularity: 'Medium' },
      { name: 'Coupe de France', displayName: 'Coupe de France', country: 'France', region: 'Europe', tier: 'Cup', type: 'Cup', sport: 'Football', popularity: 'Medium' },
      
      // Portugal
      { name: 'Primeira Liga', displayName: 'Portuguese Primeira Liga', country: 'Portugal', region: 'Europe', tier: '1st Division', type: 'League', sport: 'Football', popularity: 'Medium' },
      
      // Netherlands
      { name: 'Eredivisie', displayName: 'Dutch Eredivisie', country: 'Netherlands', region: 'Europe', tier: '1st Division', type: 'League', sport: 'Football', popularity: 'Medium' },
      
      // International & European
      { name: 'UEFA Champions League', displayName: 'Champions League', country: 'International', region: 'Europe', tier: 'International', type: 'Tournament', sport: 'Football', popularity: 'High' },
      { name: 'UEFA Europa League', displayName: 'Europa League', country: 'International', region: 'Europe', tier: 'International', type: 'Tournament', sport: 'Football', popularity: 'High' },
      { name: 'UEFA Conference League', displayName: 'Conference League', country: 'International', region: 'Europe', tier: 'International', type: 'Tournament', sport: 'Football', popularity: 'Medium' },
      { name: 'FIFA World Cup', displayName: 'World Cup', country: 'International', region: 'International', tier: 'International', type: 'Tournament', sport: 'Football', popularity: 'High' },
      { name: 'UEFA European Championship', displayName: 'Euro Championship', country: 'International', region: 'Europe', tier: 'International', type: 'Tournament', sport: 'Football', popularity: 'High' },
      { name: 'Copa America', displayName: 'Copa América', country: 'International', region: 'South America', tier: 'International', type: 'Tournament', sport: 'Football', popularity: 'High' },
      
      // USA
      { name: 'MLS', displayName: 'Major League Soccer', country: 'USA', region: 'North America', tier: '1st Division', type: 'League', sport: 'Football', popularity: 'Medium' },
      
      // Brazil
      { name: 'Brasileirão', displayName: 'Brazilian Série A', country: 'Brazil', region: 'South America', tier: '1st Division', type: 'League', sport: 'Football', popularity: 'High' },
      { name: 'Copa Libertadores', displayName: 'Copa Libertadores', country: 'International', region: 'South America', tier: 'International', type: 'Tournament', sport: 'Football', popularity: 'High' },
    ];

    // BASKETBALL LEAGUES
    const basketballLeagues: LeagueMetadata[] = [
      { name: 'NBA', displayName: 'NBA', country: 'USA', region: 'North America', tier: '1st Division', type: 'League', sport: 'Basketball', popularity: 'High' },
      { name: 'WNBA', displayName: 'WNBA', country: 'USA', region: 'North America', tier: '1st Division', type: 'League', sport: 'Basketball', popularity: 'Medium' },
      { name: 'EuroLeague', displayName: 'EuroLeague', country: 'International', region: 'Europe', tier: 'International', type: 'Tournament', sport: 'Basketball', popularity: 'High' },
      { name: 'NCAA', displayName: 'NCAA Basketball', country: 'USA', region: 'North America', tier: 'College', type: 'League', sport: 'Basketball', popularity: 'High' },
    ];

    // AMERICAN FOOTBALL LEAGUES
    const americanFootballLeagues: LeagueMetadata[] = [
      { name: 'NFL', displayName: 'NFL', country: 'USA', region: 'North America', tier: '1st Division', type: 'League', sport: 'American Football', popularity: 'High' },
      { name: 'NCAA Football', displayName: 'NCAA Football', country: 'USA', region: 'North America', tier: 'College', type: 'League', sport: 'American Football', popularity: 'High' },
    ];

    // ICE HOCKEY LEAGUES
    const hockeyLeagues: LeagueMetadata[] = [
      { name: 'NHL', displayName: 'NHL', country: 'USA/Canada', region: 'North America', tier: '1st Division', type: 'League', sport: 'Ice Hockey', popularity: 'High' },
      { name: 'KHL', displayName: 'KHL', country: 'Russia', region: 'Europe', tier: '1st Division', type: 'League', sport: 'Ice Hockey', popularity: 'Medium' },
    ];

    // TENNIS TOURNAMENTS
    const tennisTournaments: LeagueMetadata[] = [
      { name: 'ATP Tour', displayName: 'ATP Tour', country: 'International', region: 'International', tier: 'International', type: 'Tournament', sport: 'Tennis', popularity: 'High' },
      { name: 'WTA Tour', displayName: 'WTA Tour', country: 'International', region: 'International', tier: 'International', type: 'Tournament', sport: 'Tennis', popularity: 'High' },
      { name: 'Grand Slam', displayName: 'Grand Slam', country: 'International', region: 'International', tier: 'International', type: 'Tournament', sport: 'Tennis', popularity: 'High' },
    ];

    // Add all leagues to map
    [...footballLeagues, ...basketballLeagues, ...americanFootballLeagues, ...hockeyLeagues, ...tennisTournaments].forEach(league => {
      // Add both exact name and normalized name
      this.leagueMap.set(league.name, league);
      this.leagueMap.set(league.name.toLowerCase(), league);
      this.leagueMap.set(league.displayName.toLowerCase(), league);
    });
  }

  getLeagueMetadata(leagueName: string): LeagueMetadata | null {
    // Try exact match first
    let metadata = this.leagueMap.get(leagueName);
    if (metadata) return metadata;

    // Try lowercase
    metadata = this.leagueMap.get(leagueName.toLowerCase());
    if (metadata) return metadata;

    // Try partial match
    for (const [key, value] of Array.from(this.leagueMap.entries())) {
      if (key.includes(leagueName.toLowerCase()) || leagueName.toLowerCase().includes(key)) {
        return value;
      }
    }

    // Return default metadata
    return {
      name: leagueName,
      displayName: leagueName,
      country: 'Unknown',
      region: 'Unknown',
      tier: 'Unknown',
      type: 'League',
      sport: 'Unknown',
      popularity: 'Low'
    };
  }

  getAllLeagues(): LeagueMetadata[] {
    // Return unique leagues only
    const seen = new Set<string>();
    const result: LeagueMetadata[] = [];
    
    for (const league of Array.from(this.leagueMap.values())) {
      if (!seen.has(league.name)) {
        seen.add(league.name);
        result.push(league);
      }
    }
    
    return result;
  }

  getLeaguesByCountry(country: string): LeagueMetadata[] {
    return this.getAllLeagues().filter(league => league.country === country);
  }

  getLeaguesByRegion(region: string): LeagueMetadata[] {
    return this.getAllLeagues().filter(league => league.region === region);
  }

  getLeaguesBySport(sport: string): LeagueMetadata[] {
    return this.getAllLeagues().filter(league => league.sport === sport);
  }

  getCountriesBySport(sport: string): string[] {
    const countries = new Set<string>();
    this.getLeaguesBySport(sport).forEach(league => countries.add(league.country));
    return Array.from(countries).sort();
  }

  getRegions(): string[] {
    const regions = new Set<string>();
    this.getAllLeagues().forEach(league => regions.add(league.region));
    return Array.from(regions).sort();
  }
}

export const leagueMetadataService = new LeagueMetadataService();
