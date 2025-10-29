// COMPREHENSIVE DATA SOURCES CONFIGURATION
// This application uses 15+ data sources with intelligent fallbacks

export const API_CONFIG = {
  // The Odds API - FREE 500 requests/month
  // Sign up at: https://the-odds-api.com/
  oddsApi: {
    key: process.env.ODDS_API_KEY || '',
    baseUrl: 'https://api.the-odds-api.com/v4',
    enabled: !!process.env.ODDS_API_KEY,
    freeLimit: 500, // monthly
  },

  // API-Football - FREE 100 requests/day
  // Sign up at: https://dashboard.api-football.com
  sportsApi: {
    key: process.env.API_FOOTBALL_KEY || '',
    baseUrl: 'https://v3.football.api-sports.io',
    enabled: !!process.env.API_FOOTBALL_KEY,
    freeLimit: 100, // daily
  },

  // OpenWeatherMap - FREE 1000 calls/day
  // Sign up at: https://openweathermap.org/api
  weatherApi: {
    key: process.env.WEATHER_API_KEY || '',
    baseUrl: 'https://api.openweathermap.org/data/2.5',
    enabled: !!process.env.WEATHER_API_KEY,
    freeLimit: 1000, // daily
  },

  // TheSportsDB - Completely FREE
  // No API key needed
  sportsDb: {
    baseUrl: 'https://www.thesportsdb.com/api/v1/json/3',
    enabled: true,
    freeLimit: Infinity,
  },

  // ESPN Public API - FREE (no key needed)
  espnApi: {
    baseUrl: 'https://site.api.espn.com/apis/site/v2/sports',
    enabled: true,
    freeLimit: Infinity,
  },

  // NBA Stats API - FREE (via nba npm package)
  // Note: May be blocked on cloud provider IPs
  nbaApi: {
    enabled: true,
    freeLimit: Infinity,
    warning: 'May be blocked on AWS/Heroku/cloud IPs',
  },
};

export const SPORTS_CONFIG = {
  football: {
    apiFootball: { sportId: 'soccer', enabled: true },
    theSportsDb: { sportName: 'Soccer', enabled: true },
    espn: { sport: 'soccer', league: 'eng.1' },
    fbref: { enabled: true },
    proFootballReference: { enabled: true },
  },
  basketball: {
    apiFootball: { sportId: 'basketball', enabled: true },
    theSportsDb: { sportName: 'Basketball', enabled: true },
    espn: { sport: 'basketball', league: 'nba' },
    nba: { enabled: true },
    basketballReference: { enabled: true },
  },
  hockey: {
    apiFootball: { sportId: 'hockey', enabled: true },
    theSportsDb: { sportName: 'Ice Hockey', enabled: true },
    espn: { sport: 'hockey', league: 'nhl' },
    hockeyReference: { enabled: true },
  },
  tennis: {
    theSportsDb: { sportName: 'Tennis', enabled: true },
    espn: { sport: 'tennis', league: 'atp' },
  },
  baseball: {
    espn: { sport: 'baseball', league: 'mlb' },
    baseballReference: { enabled: true },
  },
};

// DATA SOURCE INVENTORY
export const DATA_SOURCES = {
  // FREE APIs (No scraping required)
  apis: [
    'TheSportsDB - Completely free, no key needed',
    'ESPN Public API - Free sports data and scores',
    'NBA Stats API - Free NBA data (via npm package)',
    'The Odds API - 500 free requests/month',
    'API-Football - 100 free requests/day',
  ],

  // Sports-Reference Family (Rate-limited scrapers)
  sportsReference: [
    'Baseball-Reference.com - 20 req/min',
    'Basketball-Reference.com - 20 req/min',
    'Pro-Football-Reference.com - 20 req/min',
    'Hockey-Reference.com - 20 req/min',
    'FBref.com - 10 req/min',
  ],

  // Free Scrapers (No rate limits)
  freeScrapers: [
    'Physioroom.com - Injury reports',
    'BBC Sport - News and analysis',
    'Transfermarkt - Player valuations',
  ],

  // Advanced Scrapers (Puppeteer/JavaScript rendering)
  advancedScrapers: [
    'Sofascore - Live scores and stats',
    'Flashscore - Real-time results',
    'Scores24.live - Live scores',
    'Oddsportal - Betting odds',
    'BetExplorer - Sports betting data',
  ],

  // News Sources (With sentiment analysis)
  newsSources: [
    'ESPN News API',
    'BBC Sport News',
    'Sky Sports News',
  ],

  // Analysis Capabilities
  analysis: [
    'Sentiment Analysis (Sentiment.js)',
    'Natural Language Processing (Natural)',
    'Entity Extraction (Compromise)',
    'Keyword Extraction',
  ],
};
