import { pool } from '../server/db';
import { sql } from 'drizzle-orm';

async function migrate() {
  try {
    console.log('🚀 Creating database tables...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS predictions (
        id VARCHAR PRIMARY KEY,
        sport TEXT NOT NULL,
        match TEXT NOT NULL,
        home_team TEXT NOT NULL,
        away_team TEXT NOT NULL,
        league TEXT NOT NULL,
        bet_type TEXT NOT NULL,
        best_odds DECIMAL(10, 2) NOT NULL,
        bookmaker TEXT NOT NULL,
        edge DECIMAL(10, 2) NOT NULL,
        confidence_score INTEGER NOT NULL,
        data JSONB NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        expires_at TIMESTAMP NOT NULL
      );
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS games (
        id VARCHAR PRIMARY KEY,
        sport TEXT NOT NULL,
        league TEXT NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        home_team TEXT NOT NULL,
        away_team TEXT NOT NULL,
        status TEXT NOT NULL,
        data JSONB NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS scraped_data (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        sport TEXT NOT NULL,
        source TEXT NOT NULL,
        data JSONB NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        expires_at TIMESTAMP NOT NULL
      );
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      );
    `);
    
    console.log('✅ All tables created successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

migrate();
