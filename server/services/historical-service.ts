// PHASE 6: Post-Mortem & Meta-Learning
import { HistoricalPerformance, SportType } from '@shared/schema';

export interface PredictionResult {
  predictionId: string;
  sport: SportType;
  outcome: 'won' | 'lost' | 'push';
  actualResult: string;
  predictedProbability: number;
  actualProbability: number;
  profitLoss: number;
  processQuality: 'good' | 'bad';
  luckFactor: 'good' | 'bad' | 'neutral';
  learnings: string[];
}

export class HistoricalService {
  private results: PredictionResult[] = [];
  private performance: Map<SportType, HistoricalPerformance[]> = new Map();

  // Log a prediction result
  logResult(result: PredictionResult): void {
    console.log(`📊 PHASE 6: Logging result for ${result.predictionId}`);
    
    this.results.push(result);
    
    // Perform meta-analysis
    this.analyzeResult(result);
    
    // Update model weightings
    this.updateModelWeights(result);
    
    console.log(`✅ Meta-learning complete: ${result.outcome.toUpperCase()}`);
  }

  // Analyze if result was good process or luck
  private analyzeResult(result: PredictionResult): void {
    const probabilityError = Math.abs(result.predictedProbability - result.actualProbability);
    
    // Good process = predicted probability was accurate
    // Bad luck = good process but lost, Good luck = bad process but won
    
    if (result.outcome === 'won') {
      if (probabilityError < 10) {
        result.processQuality = 'good';
        result.luckFactor = 'neutral';
        result.learnings = ['Model accurately predicted outcome', 'Continue current methodology'];
      } else {
        result.processQuality = 'bad';
        result.luckFactor = 'good';
        result.learnings = ['Win despite poor calibration', 'Review probability model'];
      }
    } else if (result.outcome === 'lost') {
      if (probabilityError < 10) {
        result.processQuality = 'good';
        result.luckFactor = 'bad';
        result.learnings = ['Model was accurate but variance occurred', 'Maintain process'];
      } else {
        result.processQuality = 'bad';
        result.luckFactor = 'neutral';
        result.learnings = ['Model failed to predict outcome', 'Major recalibration needed'];
      }
    }
  }

  // Update model weights based on results
  private updateModelWeights(result: PredictionResult): void {
    // In a real implementation, this would update ML model weights
    // For now, we log what would be updated
    console.log(`🔄 Updating model weights based on ${result.outcome}`);
    
    if (result.processQuality === 'bad') {
      console.log('   - Reduce confidence in similar scenarios by 5%');
      console.log('   - Increase uncertainty bounds for this sport');
    } else if (result.processQuality === 'good') {
      console.log('   - Maintain current model parameters');
      console.log('   - Increase confidence in similar patterns');
    }
  }

  // Get historical performance data
  getPerformance(sport?: SportType): HistoricalPerformance[] {
    // Generate synthetic historical data for demonstration
    const days = 30;
    const data: HistoricalPerformance[] = [];
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Simulate improving performance over time
      const baseAccuracy = 55 + (30 - i) * 0.5;
      const baseROI = 3 + (30 - i) * 0.3;
      
      data.push({
        date: date.toISOString().split('T')[0],
        sport: sport || 'Football',
        accuracy: Math.min(75, baseAccuracy + Math.random() * 5),
        roi: Math.min(20, baseROI + Math.random() * 2),
        confidenceScore: 70 + Math.random() * 15,
      });
    }
    
    return data;
  }

  // Get overall statistics
  getStatistics(sport?: SportType): {
    totalPredictions: number;
    winRate: number;
    avgROI: number;
    avgConfidence: number;
    goodProcess: number;
  } {
    const filtered = sport
      ? this.results.filter(r => r.sport === sport)
      : this.results;

    if (filtered.length === 0) {
      return {
        totalPredictions: 0,
        winRate: 0,
        avgROI: 0,
        avgConfidence: 0,
        goodProcess: 0,
      };
    }

    const wins = filtered.filter(r => r.outcome === 'won').length;
    const goodProcessCount = filtered.filter(r => r.processQuality === 'good').length;

    return {
      totalPredictions: filtered.length,
      winRate: (wins / filtered.length) * 100,
      avgROI: filtered.reduce((sum, r) => sum + r.profitLoss, 0) / filtered.length,
      avgConfidence: filtered.reduce((sum, r) => sum + r.predictedProbability, 0) / filtered.length,
      goodProcess: (goodProcessCount / filtered.length) * 100,
    };
  }
}

export const historicalService = new HistoricalService();
