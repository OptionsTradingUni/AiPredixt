/**
 * Specialty Markets Calculator
 * Calculates predictions for:
 * - Corners (Total Corners, Team Corners Over/Under)
 * - Cards (Yellow Cards, Red Cards, Total Bookings)
 * - Player Props (if data available)
 */

interface TeamData {
  teamName: string;
  cornersFor?: number;
  cornersAgainst?: number;
  yellowCards?: number;
  redCards?: number;
  fouls?: number;
  possession?: number;
  aggressiveness?: number; // Derived metric
  [key: string]: any;
}

interface CornersPrediction {
  homeCorners: number;
  awayCorners: number;
  totalCorners: number;
  overUnderLine: number; // Most common line (e.g., 9.5, 10.5)
  overProbability: number;
  underProbability: number;
  confidence: number;
}

interface CardsPrediction {
  homeYellowCards: number;
  awayYellowCards: number;
  totalYellowCards: number;
  homeRedCards: number;
  awayRedCards: number;
  totalBookings: number; // Yellow = 1, Red = 2
  over25CardsProb: number; // Over 2.5 total cards
  over35CardsProb: number; // Over 3.5 total cards
  confidence: number;
}

export class SpecialtyMarketsCalculator {
  /**
   * Calculate expected corners for a match
   */
  calculateCorners(homeTeam: TeamData, awayTeam: TeamData): CornersPrediction {
    // Default averages if no data available
    const defaultCornersPerGame = 5.5;
    
    // Calculate expected corners for each team
    const homeCornersAvg = homeTeam.cornersFor || defaultCornersPerGame;
    const awayCornersAvg = awayTeam.cornersFor || defaultCornersPerGame;
    
    // Adjust for possession - teams with more possession typically get more corners
    const homePossessionFactor = (homeTeam.possession || 50) / 50;
    const awayPossessionFactor = (awayTeam.possession || 50) / 50;
    
    // Home advantage for corners (typically +0.5 corners)
    const homeAdvantage = 0.5;
    
    const homeCorners = homeCornersAvg * homePossessionFactor + homeAdvantage;
    const awayCorners = awayCornersAvg * awayPossessionFactor;
    const totalCorners = homeCorners + awayCorners;
    
    // Determine the most appropriate over/under line
    const overUnderLine = this.getOptimalCornersLine(totalCorners);
    
    // Calculate over/under probabilities using Poisson distribution approximation
    const overProbability = this.calculateOverProbability(totalCorners, overUnderLine);
    const underProbability = 100 - overProbability;
    
    // Confidence based on data quality
    const confidence = this.calculateConfidence([
      homeTeam.cornersFor !== undefined,
      awayTeam.cornersFor !== undefined,
      homeTeam.possession !== undefined,
    ]);
    
    return {
      homeCorners: parseFloat(homeCorners.toFixed(1)),
      awayCorners: parseFloat(awayCorners.toFixed(1)),
      totalCorners: parseFloat(totalCorners.toFixed(1)),
      overUnderLine,
      overProbability: parseFloat(overProbability.toFixed(1)),
      underProbability: parseFloat(underProbability.toFixed(1)),
      confidence,
    };
  }

  /**
   * Calculate expected cards/bookings for a match
   */
  calculateCards(homeTeam: TeamData, awayTeam: TeamData, refereeStrict?: boolean): CardsPrediction {
    // Default averages
    const defaultYellowCards = 2.0;
    const defaultRedCards = 0.1;
    
    // Calculate expected yellow cards
    const homeYellowCards = homeTeam.yellowCards || defaultYellowCards;
    const awayYellowCards = awayTeam.yellowCards || defaultYellowCards;
    
    // Calculate expected red cards
    const homeRedCards = homeTeam.redCards || defaultRedCards;
    const awayRedCards = awayTeam.redCards || defaultRedCards;
    
    // Adjust for team aggressiveness (fouls committed)
    const homeAggressiveness = this.calculateAggressiveness(homeTeam);
    const awayAggressiveness = this.calculateAggressiveness(awayTeam);
    
    // Referee factor (strict referees show 20% more cards)
    const refereeFactor = refereeStrict ? 1.2 : 1.0;
    
    const adjustedHomeYellow = homeYellowCards * homeAggressiveness * refereeFactor;
    const adjustedAwayYellow = awayYellowCards * awayAggressiveness * refereeFactor;
    const adjustedHomeRed = homeRedCards * homeAggressiveness * refereeFactor;
    const adjustedAwayRed = awayRedCards * awayAggressiveness * refereeFactor;
    
    const totalYellowCards = adjustedHomeYellow + adjustedAwayYellow;
    const totalRedCards = adjustedHomeRed + adjustedAwayRed;
    
    // Total bookings (1 point per yellow, 2 points per red)
    const totalBookings = totalYellowCards + (totalRedCards * 2);
    
    // Calculate over/under probabilities for common lines
    const over25CardsProb = this.calculateOverProbability(totalYellowCards, 2.5);
    const over35CardsProb = this.calculateOverProbability(totalYellowCards, 3.5);
    
    // Confidence based on data quality
    const confidence = this.calculateConfidence([
      homeTeam.yellowCards !== undefined,
      awayTeam.yellowCards !== undefined,
      homeTeam.fouls !== undefined,
    ]);
    
    return {
      homeYellowCards: parseFloat(adjustedHomeYellow.toFixed(1)),
      awayYellowCards: parseFloat(adjustedAwayYellow.toFixed(1)),
      totalYellowCards: parseFloat(totalYellowCards.toFixed(1)),
      homeRedCards: parseFloat(adjustedHomeRed.toFixed(2)),
      awayRedCards: parseFloat(adjustedAwayRed.toFixed(2)),
      totalBookings: parseFloat(totalBookings.toFixed(1)),
      over25CardsProb: parseFloat(over25CardsProb.toFixed(1)),
      over35CardsProb: parseFloat(over35CardsProb.toFixed(1)),
      confidence,
    };
  }

  /**
   * Calculate team aggressiveness based on fouls and cards
   */
  private calculateAggressiveness(team: TeamData): number {
    const defaultAggressiveness = 1.0;
    
    if (!team.fouls) {
      return defaultAggressiveness;
    }
    
    // Teams that commit more fouls tend to get more cards
    // Average fouls per game is ~12-13
    const foulsPerGame = team.fouls;
    const avgFouls = 12.5;
    
    // Normalize: 0.8x to 1.2x multiplier
    const aggressiveness = 0.8 + ((foulsPerGame - avgFouls) / avgFouls) * 0.4;
    
    return Math.max(0.7, Math.min(1.3, aggressiveness));
  }

  /**
   * Get optimal corners over/under line based on expected total
   */
  private getOptimalCornersLine(expectedTotal: number): number {
    // Common corners lines: 8.5, 9.5, 10.5, 11.5, 12.5
    const lines = [8.5, 9.5, 10.5, 11.5, 12.5];
    
    // Find the closest line
    let closestLine = lines[0];
    let minDiff = Math.abs(expectedTotal - closestLine);
    
    for (const line of lines) {
      const diff = Math.abs(expectedTotal - line);
      if (diff < minDiff) {
        minDiff = diff;
        closestLine = line;
      }
    }
    
    return closestLine;
  }

  /**
   * Calculate probability of going over a line using simplified Poisson approximation
   */
  private calculateOverProbability(expected: number, line: number): number {
    // For simplicity, use normal distribution approximation for Poisson
    // P(X > line) where X ~ Poisson(expected)
    
    // Standard deviation for Poisson is sqrt(lambda)
    const stdDev = Math.sqrt(expected);
    
    // Z-score for the line
    const z = (line - expected) / stdDev;
    
    // Approximate probability using sigmoid function
    // This gives us a smooth probability curve
    const probability = 1 / (1 + Math.exp(z));
    
    return probability * 100;
  }

  /**
   * Calculate confidence score based on data availability
   */
  private calculateConfidence(dataAvailability: boolean[]): number {
    const availableDataPoints = dataAvailability.filter(Boolean).length;
    const totalDataPoints = dataAvailability.length;
    
    const baseConfidence = (availableDataPoints / totalDataPoints) * 100;
    
    // Add bonus for having more data points
    const bonus = availableDataPoints >= 3 ? 10 : 0;
    
    return Math.min(100, baseConfidence + bonus);
  }

  /**
   * Generate corners betting markets
   */
  generateCornersMarkets(homeTeam: TeamData, awayTeam: TeamData): {
    market: string;
    selection: string;
    expectedValue: number;
    probability: number;
    confidence: number;
  }[] {
    const cornersData = this.calculateCorners(homeTeam, awayTeam);
    
    return [
      {
        market: 'Total Corners',
        selection: `Over ${cornersData.overUnderLine}`,
        expectedValue: cornersData.totalCorners,
        probability: cornersData.overProbability,
        confidence: cornersData.confidence,
      },
      {
        market: 'Total Corners',
        selection: `Under ${cornersData.overUnderLine}`,
        expectedValue: cornersData.totalCorners,
        probability: cornersData.underProbability,
        confidence: cornersData.confidence,
      },
      {
        market: 'Team Corners',
        selection: `${homeTeam.teamName} Over 5.5`,
        expectedValue: cornersData.homeCorners,
        probability: this.calculateOverProbability(cornersData.homeCorners, 5.5),
        confidence: cornersData.confidence,
      },
      {
        market: 'Team Corners',
        selection: `${awayTeam.teamName} Over 4.5`,
        expectedValue: cornersData.awayCorners,
        probability: this.calculateOverProbability(cornersData.awayCorners, 4.5),
        confidence: cornersData.confidence,
      },
    ];
  }

  /**
   * Generate cards/bookings betting markets
   */
  generateCardsMarkets(homeTeam: TeamData, awayTeam: TeamData, refereeStrict?: boolean): {
    market: string;
    selection: string;
    expectedValue: number;
    probability: number;
    confidence: number;
  }[] {
    const cardsData = this.calculateCards(homeTeam, awayTeam, refereeStrict);
    
    return [
      {
        market: 'Total Cards',
        selection: 'Over 2.5',
        expectedValue: cardsData.totalYellowCards,
        probability: cardsData.over25CardsProb,
        confidence: cardsData.confidence,
      },
      {
        market: 'Total Cards',
        selection: 'Under 2.5',
        expectedValue: cardsData.totalYellowCards,
        probability: 100 - cardsData.over25CardsProb,
        confidence: cardsData.confidence,
      },
      {
        market: 'Total Cards',
        selection: 'Over 3.5',
        expectedValue: cardsData.totalYellowCards,
        probability: cardsData.over35CardsProb,
        confidence: cardsData.confidence,
      },
      {
        market: 'Total Cards',
        selection: 'Under 3.5',
        expectedValue: cardsData.totalYellowCards,
        probability: 100 - cardsData.over35CardsProb,
        confidence: cardsData.confidence,
      },
      {
        market: 'Total Bookings Points',
        selection: 'Over 30.5',
        expectedValue: cardsData.totalBookings * 10, // Convert to points (10pts per booking)
        probability: this.calculateOverProbability(cardsData.totalBookings * 10, 30.5),
        confidence: cardsData.confidence,
      },
    ];
  }
}

export const specialtyMarketsCalculator = new SpecialtyMarketsCalculator();
