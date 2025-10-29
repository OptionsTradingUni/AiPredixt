/**
 * Centralized Probability Calculator
 * 
 * Ensures all probability calculations are:
 * 1. Deterministic (no random numbers)
 * 2. Sum to exactly 100% for 3-way markets
 * 3. Respect bounds (5-95%)
 */

export interface ThreeWayProbabilities {
  home: number;
  draw: number;
  away: number;
}

export interface TwoWayProbabilities {
  option1: number;
  option2: number;
}

export class ProbabilityCalculator {
  private static readonly MIN_PROB = 5;
  private static readonly MAX_PROB = 95;
  private static readonly PRECISION = 10; // 1 decimal place

  /**
   * Normalize 3-way market probabilities (Home/Draw/Away)
   * Ensures they sum to exactly 100% and respect bounds [5, 95]
   */
  static normalizeThreeWay(probs: ThreeWayProbabilities): ThreeWayProbabilities {
    let { home, draw, away } = probs;

    // Step 1: Clamp initial values to bounds
    home = Math.max(this.MIN_PROB, Math.min(this.MAX_PROB, home));
    draw = Math.max(this.MIN_PROB, Math.min(this.MAX_PROB, draw));
    away = Math.max(this.MIN_PROB, Math.min(this.MAX_PROB, away));

    // Step 2: Calculate current sum
    let sum = home + draw + away;

    // Step 3: Normalize to 100% while maintaining ratios and respecting bounds
    if (Math.abs(sum - 100) > 0.01) {
      // Calculate proportional adjustment needed
      const targetSum = 100;
      const scale = targetSum / sum;

      // Apply proportional scaling
      home = home * scale;
      draw = draw * scale;
      away = away * scale;

      // Step 4: Check if any value exceeds bounds after scaling
      const violations = [];
      if (home > this.MAX_PROB) violations.push({ name: 'home', excess: home - this.MAX_PROB });
      if (home < this.MIN_PROB) violations.push({ name: 'home', excess: home - this.MIN_PROB });
      if (draw > this.MAX_PROB) violations.push({ name: 'draw', excess: draw - this.MAX_PROB });
      if (draw < this.MIN_PROB) violations.push({ name: 'draw', excess: draw - this.MIN_PROB });
      if (away > this.MAX_PROB) violations.push({ name: 'away', excess: away - this.MAX_PROB });
      if (away < this.MIN_PROB) violations.push({ name: 'away', excess: away - this.MIN_PROB });

      // Step 5: Handle bound violations by redistributing excess
      if (violations.length > 0) {
        home = Math.max(this.MIN_PROB, Math.min(this.MAX_PROB, home));
        draw = Math.max(this.MIN_PROB, Math.min(this.MAX_PROB, draw));
        away = Math.max(this.MIN_PROB, Math.min(this.MAX_PROB, away));

        // Recalculate sum after clamping
        sum = home + draw + away;

        // Final proportional redistribution
        const adjustment = 100 - sum;
        
        // Distribute adjustment to probabilities that have room
        const canAdjust = [];
        if (adjustment > 0) {
          if (home < this.MAX_PROB) canAdjust.push('home');
          if (draw < this.MAX_PROB) canAdjust.push('draw');
          if (away < this.MAX_PROB) canAdjust.push('away');
        } else {
          if (home > this.MIN_PROB) canAdjust.push('home');
          if (draw > this.MIN_PROB) canAdjust.push('draw');
          if (away > this.MIN_PROB) canAdjust.push('away');
        }

        if (canAdjust.length > 0) {
          const perItem = adjustment / canAdjust.length;
          if (canAdjust.includes('home')) home += perItem;
          if (canAdjust.includes('draw')) draw += perItem;
          if (canAdjust.includes('away')) away += perItem;
        }
      }
    }

    // Step 6: Round to precision BEFORE final normalization
    home = Math.round(home * this.PRECISION) / this.PRECISION;
    draw = Math.round(draw * this.PRECISION) / this.PRECISION;
    away = Math.round(away * this.PRECISION) / this.PRECISION;

    // Step 7: Calculate sum and adjust to exactly 100 while preserving bounds
    sum = home + draw + away;
    if (Math.abs(sum - 100) > 0.001) {
      // Find the largest probability that has room to adjust
      const diff = 100 - sum;
      const probs = [
        { name: 'home', value: home, canAdjust: diff > 0 ? home < this.MAX_PROB : home > this.MIN_PROB },
        { name: 'draw', value: draw, canAdjust: diff > 0 ? draw < this.MAX_PROB : draw > this.MIN_PROB },
        { name: 'away', value: away, canAdjust: diff > 0 ? away < this.MAX_PROB : away > this.MIN_PROB }
      ].filter(p => p.canAdjust).sort((a, b) => b.value - a.value);

      if (probs.length > 0) {
        // Adjust the largest probability that can accommodate the change
        const target = probs[0].name;
        if (target === 'home') {
          home = Math.max(this.MIN_PROB, Math.min(this.MAX_PROB, home + diff));
        } else if (target === 'draw') {
          draw = Math.max(this.MIN_PROB, Math.min(this.MAX_PROB, draw + diff));
        } else {
          away = Math.max(this.MIN_PROB, Math.min(this.MAX_PROB, away + diff));
        }
        
        // Round again after adjustment
        home = Math.round(home * this.PRECISION) / this.PRECISION;
        draw = Math.round(draw * this.PRECISION) / this.PRECISION;
        away = Math.round(away * this.PRECISION) / this.PRECISION;
      }
    }

    // Final verification: ensure bounds are still respected
    home = Math.max(this.MIN_PROB, Math.min(this.MAX_PROB, home));
    draw = Math.max(this.MIN_PROB, Math.min(this.MAX_PROB, draw));
    away = Math.max(this.MIN_PROB, Math.min(this.MAX_PROB, away));

    return { home, draw, away };
  }

  /**
   * Normalize 2-way market probabilities
   * Ensures they sum to exactly 100% and respect bounds [5, 95]
   */
  static normalizeTwoWay(probs: TwoWayProbabilities): TwoWayProbabilities {
    let { option1, option2 } = probs;

    // Step 1: Clamp to bounds
    option1 = Math.max(this.MIN_PROB, Math.min(this.MAX_PROB, option1));
    option2 = Math.max(this.MIN_PROB, Math.min(this.MAX_PROB, option2));

    // Step 2: Normalize to 100%
    let sum = option1 + option2;
    option1 = (option1 / sum) * 100;
    option2 = (option2 / sum) * 100;

    // Step 3: Round and adjust for rounding errors
    option1 = Math.round(option1 * this.PRECISION) / this.PRECISION;
    option2 = Math.round(option2 * this.PRECISION) / this.PRECISION;

    sum = option1 + option2;
    if (Math.abs(sum - 100) > 0.001) {
      const diff = 100 - sum;
      if (option1 >= option2) {
        option1 += diff;
      } else {
        option2 += diff;
      }
      option1 = Math.round(option1 * this.PRECISION) / this.PRECISION;
      option2 = Math.round(option2 * this.PRECISION) / this.PRECISION;
    }

    return { option1, option2 };
  }

  /**
   * Calculate 3-way probabilities from bookmaker odds
   * Removes bookmaker margin and normalizes to fair probabilities
   */
  static calculateThreeWayFromOdds(homeOdds: number, awayOdds: number, drawOdds?: number, trueProbAdjustment: number = 0): ThreeWayProbabilities {
    // Calculate implied probabilities (with bookmaker margin)
    const homeImplied = (1 / homeOdds) * 100;
    const awayImplied = (1 / awayOdds) * 100;
    const drawImplied = drawOdds ? (1 / drawOdds) * 100 : 0;
    const totalImplied = homeImplied + awayImplied + drawImplied;
    
    // Normalize to 100% (remove bookmaker margin)
    let homeFair = (homeImplied / totalImplied) * 100;
    let awayFair = (awayImplied / totalImplied) * 100;
    let drawFair = drawOdds ? (drawImplied / totalImplied) * 100 : 0;

    // Apply our analytical edge (trueProbAdjustment is between -0.5 and 0.5)
    // Positive adjustment favors home, negative favors away
    const adjustment = trueProbAdjustment * 15; // Scale to max ±7.5 percentage points
    homeFair += adjustment;
    drawFair -= adjustment * 0.3; // Draw probability inversely correlated
    awayFair -= adjustment * 0.7; // Away absorbs most of the adjustment

    // Ensure we have draw for football
    if (drawOdds && drawFair === 0) {
      drawFair = 25; // Default draw probability for football
      homeFair -= 12.5;
      awayFair -= 12.5;
    }

    return this.normalizeThreeWay({ home: homeFair, draw: drawFair, away: awayFair });
  }

  /**
   * Calculate 2-way probabilities from bookmaker odds
   */
  static calculateTwoWayFromOdds(option1Odds: number, option2Odds: number, trueProbAdjustment: number = 0): TwoWayProbabilities {
    // Calculate implied probabilities
    const option1Implied = (1 / option1Odds) * 100;
    const option2Implied = (1 / option2Odds) * 100;
    const totalImplied = option1Implied + option2Implied;
    
    // Normalize to 100%
    let option1Fair = (option1Implied / totalImplied) * 100;
    let option2Fair = (option2Implied / totalImplied) * 100;

    // Apply analytical edge
    const adjustment = trueProbAdjustment * 10; // Scale to max ±5 percentage points
    option1Fair += adjustment;
    option2Fair -= adjustment;

    return this.normalizeTwoWay({ option1: option1Fair, option2: option2Fair });
  }

  /**
   * Verify probabilities are valid
   */
  static verifyThreeWay(probs: ThreeWayProbabilities): { valid: boolean; sum: number; errors: string[] } {
    const { home, draw, away } = probs;
    const errors: string[] = [];
    
    // Check bounds
    if (home < this.MIN_PROB || home > this.MAX_PROB) errors.push(`Home probability ${home}% out of bounds [${this.MIN_PROB}, ${this.MAX_PROB}]`);
    if (draw < this.MIN_PROB || draw > this.MAX_PROB) errors.push(`Draw probability ${draw}% out of bounds [${this.MIN_PROB}, ${this.MAX_PROB}]`);
    if (away < this.MIN_PROB || away > this.MAX_PROB) errors.push(`Away probability ${away}% out of bounds [${this.MIN_PROB}, ${this.MAX_PROB}]`);
    
    // Check sum
    const sum = home + draw + away;
    if (Math.abs(sum - 100) > 0.1) errors.push(`Probabilities sum to ${sum.toFixed(2)}%, not 100%`);
    
    return {
      valid: errors.length === 0,
      sum,
      errors
    };
  }

  /**
   * Verify 2-way probabilities are valid
   */
  static verifyTwoWay(probs: TwoWayProbabilities): { valid: boolean; sum: number; errors: string[] } {
    const { option1, option2 } = probs;
    const errors: string[] = [];
    
    if (option1 < this.MIN_PROB || option1 > this.MAX_PROB) errors.push(`Option 1 probability ${option1}% out of bounds`);
    if (option2 < this.MIN_PROB || option2 > this.MAX_PROB) errors.push(`Option 2 probability ${option2}% out of bounds`);
    
    const sum = option1 + option2;
    if (Math.abs(sum - 100) > 0.1) errors.push(`Probabilities sum to ${sum.toFixed(2)}%, not 100%`);
    
    return {
      valid: errors.length === 0,
      sum,
      errors
    };
  }
}
