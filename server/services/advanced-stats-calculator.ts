/**
 * Advanced Stats Calculator
 * Calculates xG (Expected Goals), xA (Expected Assists), xPTS (Expected Points)
 * from available team data
 */

interface TeamData {
  teamName: string;
  goalsFor?: number;
  goalsAgainst?: number;
  shotsFor?: number;
  shotsOnTarget?: number;
  form?: string;
  wins?: number;
  draws?: number;
  losses?: number;
  possession?: number;
  corners?: number;
  [key: string]: any;
}

interface AdvancedStats {
  xG?: number;
  xGA?: number;
  xA?: number;
  xPTS?: number;
  possession?: number;
  shots?: number;
  shotsOnTarget?: number;
  corners?: number;
  fouls?: number;
  yellowCards?: number;
  redCards?: number;
}

export class AdvancedStatsCalculator {
  /**
   * Calculate Expected Goals (xG) for a team
   * Based on shots, shots on target, and historical conversion rates
   */
  calculateXG(teamData: TeamData, recentGames: number = 10): number {
    // If we have direct xG data from FBref or other sources, use it
    if (teamData.xG !== undefined) {
      return teamData.xG;
    }

    // Otherwise, estimate xG based on available data
    const shotsPerGame = teamData.shotsFor || 12; // Default average
    const shotsOnTargetPerGame = teamData.shotsOnTarget || 4; // Default average
    const goalsPerGame = teamData.goalsFor || 1.2; // Default average

    // xG estimation formula:
    // Base conversion rate: ~33% of shots on target result in goals
    // Quality adjustment based on shots/shotsOnTarget ratio
    const shotQuality = shotsOnTargetPerGame / Math.max(shotsPerGame, 1);
    const baseConversionRate = 0.33; // Industry average
    
    const xG = shotsOnTargetPerGame * baseConversionRate * (1 + shotQuality * 0.2);
    
    // Adjust based on actual goal-scoring performance
    const performanceAdjustment = goalsPerGame / Math.max(xG, 0.1);
    const adjustedXG = xG * Math.min(Math.max(performanceAdjustment, 0.7), 1.3);

    return parseFloat(adjustedXG.toFixed(2));
  }

  /**
   * Calculate Expected Goals Against (xGA)
   * Defensive xG - goals the team is expected to concede
   */
  calculateXGA(teamData: TeamData): number {
    if (teamData.xGA !== undefined) {
      return teamData.xGA;
    }

    const goalsAgainst = teamData.goalsAgainst || 1.0;
    
    // Estimate based on defensive performance
    // Teams with good form concede fewer goals
    const formAdjustment = this.getFormAdjustment(teamData.form);
    const xGA = goalsAgainst * (2 - formAdjustment); // Inverse relationship
    
    return parseFloat(Math.max(0.3, xGA).toFixed(2));
  }

  /**
   * Calculate Expected Assists (xA)
   * Based on possession, passing accuracy, and key passes
   */
  calculateXA(teamData: TeamData): number {
    if (teamData.xA !== undefined) {
      return teamData.xA;
    }

    const xG = this.calculateXG(teamData);
    const possession = teamData.possession || 50;
    
    // xA is typically 0.7-0.9 of xG
    // Teams with higher possession tend to create more assist opportunities
    const possessionFactor = possession / 50; // Normalized to average possession
    const xA = xG * 0.8 * possessionFactor;
    
    return parseFloat(Math.max(0.1, xA).toFixed(2));
  }

  /**
   * Calculate Expected Points (xPTS)
   * Estimates points a team should have based on xG and xGA
   */
  calculateXPTS(teamData: TeamData, gamesPlayed: number = 10): number {
    if (teamData.xPTS !== undefined) {
      return teamData.xPTS;
    }

    const xG = this.calculateXG(teamData);
    const xGA = this.calculateXGA(teamData);
    
    // Calculate expected goal difference per game
    const xGD = xG - xGA;
    
    // Convert xGD to expected points using statistical model
    // Win probability based on goal difference
    let expectedPointsPerGame: number;
    
    if (xGD > 1.5) {
      expectedPointsPerGame = 2.7; // High chance of win
    } else if (xGD > 0.8) {
      expectedPointsPerGame = 2.3;
    } else if (xGD > 0.3) {
      expectedPointsPerGame = 1.8;
    } else if (xGD > -0.3) {
      expectedPointsPerGame = 1.3; // Even match - likely draw
    } else if (xGD > -0.8) {
      expectedPointsPerGame = 0.9;
    } else {
      expectedPointsPerGame = 0.5; // High chance of loss
    }
    
    const xPTS = expectedPointsPerGame * gamesPlayed;
    
    return parseFloat(xPTS.toFixed(1));
  }

  /**
   * Get form adjustment factor (0.8 to 1.2)
   * Better form = higher multiplier for attacking stats, lower for defensive
   */
  private getFormAdjustment(form?: string): number {
    if (!form) return 1.0;
    
    // Parse form string like "WWDWL"
    const recentForm = form.slice(0, 5); // Last 5 games
    let formScore = 0;
    
    for (const result of recentForm) {
      if (result === 'W') formScore += 1.0;
      else if (result === 'D') formScore += 0.5;
      // L adds 0
    }
    
    // Normalize to 0.8-1.2 range
    const formPercentage = formScore / 5; // 0 to 1
    return 0.8 + (formPercentage * 0.4);
  }

  /**
   * Calculate all advanced stats for a team
   */
  calculateAllStats(teamData: TeamData, gamesPlayed: number = 10): AdvancedStats {
    return {
      xG: this.calculateXG(teamData),
      xGA: this.calculateXGA(teamData),
      xA: this.calculateXA(teamData),
      xPTS: this.calculateXPTS(teamData, gamesPlayed),
      possession: teamData.possession,
      shots: teamData.shotsFor,
      shotsOnTarget: teamData.shotsOnTarget,
      corners: teamData.corners,
      fouls: teamData.fouls,
      yellowCards: teamData.yellowCards,
      redCards: teamData.redCards,
    };
  }

  /**
   * Calculate match xG differential
   * Returns expected goal difference favoring home team
   */
  calculateMatchXGDifferential(homeStats: AdvancedStats, awayStats: AdvancedStats): number {
    const homeXG = homeStats.xG || 1.2;
    const awayXG = awayStats.xG || 1.2;
    const homeXGA = homeStats.xGA || 1.0;
    const awayXGA = awayStats.xGA || 1.0;
    
    // Home advantage factor (typically ~0.3 goals)
    const homeAdvantage = 0.3;
    
    // Expected goals for this specific match
    const homeExpectedGoals = (homeXG + awayXGA) / 2 + homeAdvantage;
    const awayExpectedGoals = (awayXG + homeXGA) / 2;
    
    return parseFloat((homeExpectedGoals - awayExpectedGoals).toFixed(2));
  }
}

export const advancedStatsCalculator = new AdvancedStatsCalculator();
