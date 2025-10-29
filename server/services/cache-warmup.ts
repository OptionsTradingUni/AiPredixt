import cron from 'node-cron';
import { storage } from '../storage';
import type { SportType } from '@shared/schema';

export class CacheWarmupService {
  private isWarming = false;

  /**
   * Start warming up the cache immediately and schedule periodic warmups
   */
  async start() {
    console.log('🔥 Starting cache warmup service...');
    
    // Warm up cache immediately on startup (but don't block server start)
    setTimeout(() => this.warmupCache(), 2000);
    
    // Schedule cache warmup every 4 minutes
    cron.schedule('*/4 * * * *', async () => {
      await this.warmupCache();
    });
    
    console.log('✅ Cache warmup service started (runs every 4 minutes)');
  }

  /**
   * Warm up the cache by pre-generating predictions for all sports
   */
  private async warmupCache() {
    if (this.isWarming) {
      console.log('⏳ Cache warmup already in progress, skipping...');
      return;
    }

    this.isWarming = true;
    console.log('🔥 Starting cache warmup...');

    try {
      const sports: SportType[] = ['Football', 'Basketball', 'Hockey', 'Tennis'];
      
      // Generate predictions for all sports in parallel
      await Promise.allSettled(
        sports.map(async (sport) => {
          try {
            console.log(`🔄 Warming up ${sport} predictions...`);
            await storage.getApexPrediction(sport, 'today');
            console.log(`✅ ${sport} predictions cached`);
          } catch (error) {
            console.error(`❌ Failed to warm up ${sport} cache:`, error);
          }
        })
      );

      // Also warm up games cache
      try {
        console.log('🔄 Warming up games cache...');
        await storage.getGames({ date: 'today', limit: 100 });
        console.log('✅ Games cache warmed up');
      } catch (error) {
        console.error('❌ Failed to warm up games cache:', error);
      }

      console.log('✅ Cache warmup completed successfully');
    } catch (error) {
      console.error('❌ Cache warmup failed:', error);
    } finally {
      this.isWarming = false;
    }
  }
}

export const cacheWarmupService = new CacheWarmupService();
