// FREE API Configuration - No paid services required
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
};

export const SPORTS_CONFIG = {
  football: {
    apiFootball: { sportId: 'soccer', enabled: true },
    theSportsDb: { sportName: 'Soccer', enabled: true },
  },
  basketball: {
    apiFootball: { sportId: 'basketball', enabled: true },
    theSportsDb: { sportName: 'Basketball', enabled: true },
  },
  hockey: {
    apiFootball: { sportId: 'hockey', enabled: true },
    theSportsDb: { sportName: 'Ice Hockey', enabled: true },
  },
  tennis: {
    theSportsDb: { sportName: 'Tennis', enabled: true },
  },
};
