# 🎯 Apex AI - Required APIs & Setup Guide

This document provides detailed information about all APIs needed to run the Apex AI Sports Prediction Engine in production, organized by priority and cost.

---

## 🔴 CRITICAL APIs (Must Have)

### 1. Sports Odds API - The Odds API
**Purpose**: Live betting odds from multiple bookmakers including SportyBet

**Provider**: [The Odds API](https://the-odds-api.com/)

**Pricing**:
- **Free Tier**: 500 requests/month
- **Starter**: $50/month - 10,000 requests
- **Pro**: $100/month - 25,000 requests
- **Enterprise**: Custom pricing

**Setup**:
```bash
# 1. Sign up at https://the-odds-api.com/
# 2. Get your API key from dashboard
# 3. Add to Railway environment variables
ODDS_API_KEY=your_api_key_here
```

**Coverage**:
- ✅ Football (Soccer)
- ✅ Basketball (NBA, NCAA)
- ✅ Hockey (NHL)
- ✅ Tennis (ATP, WTA)
- ✅ American Football
- ✅ Baseball, Cricket, Rugby, etc.

**API Example**:
```typescript
const response = await fetch(
  `https://api.the-odds-api.com/v4/sports/soccer_epl/odds/?apiKey=${ODDS_API_KEY}&regions=uk&markets=h2h,spreads,totals`
);
```

---

### 2. AI/ML API - OpenAI
**Purpose**: Advanced analysis, sentiment analysis, tactical insights, proxy modeling

**Provider**: [OpenAI](https://platform.openai.com/)

**Pricing**:
- **GPT-4o**: $2.50 per 1M input tokens, $10 per 1M output tokens
- **GPT-4o-mini**: $0.15 per 1M input tokens, $0.60 per 1M output tokens
- **Estimated**: $30-100/month for moderate usage

**Setup**:
```bash
# 1. Sign up at https://platform.openai.com/
# 2. Add payment method
# 3. Create API key
OPENAI_API_KEY=sk-your_api_key_here
```

**Use Cases in Apex**:
- Tactical matchup analysis
- Press conference sentiment analysis
- Game script narrative generation
- "Why they will fail" analysis
- Risk assessment synthesis

---

## 🟡 IMPORTANT APIs (Highly Recommended)

### 3. Web Search API - SerpAPI
**Purpose**: Google search for news, forums, tactical analysis, local sources

**Provider**: [SerpAPI](https://serpapi.com/)

**Pricing**:
- **Free**: 100 searches/month
- **Developer**: $50/month - 5,000 searches
- **Production**: $250/month - 30,000 searches

**Setup**:
```bash
# 1. Sign up at https://serpapi.com/
# 2. Get API key from dashboard
SERP_API_KEY=your_serpapi_key_here
```

**Use Cases**:
- Local beat writer news
- Team forums
- Press conference transcripts
- Tactical analysis articles
- Injury reports

**API Example**:
```typescript
const response = await fetch(
  `https://serpapi.com/search.json?q=Manchester+City+injury+news&api_key=${SERP_API_KEY}`
);
```

---

### 4. Sports Statistics API - API-Football
**Purpose**: Detailed football/soccer statistics, lineups, head-to-head data

**Provider**: [API-Sports.io](https://www.api-football.com/)

**Pricing**:
- **Free**: 100 requests/day
- **Basic**: $15/month - 500 requests/day
- **Pro**: $60/month - 3,000 requests/day
- **Ultra**: $150/month - 10,000 requests/day

**Setup**:
```bash
# 1. Sign up at https://www.api-football.com/
# 2. Subscribe to a plan
# 3. Get API key
FOOTBALL_API_KEY=your_api_key_here
```

**Coverage**:
- Live scores
- Team statistics
- Player statistics
- Head-to-head data
- Lineups and formations
- Injuries and suspensions
- Fixtures and results

---

### 5. News API - NewsAPI
**Purpose**: Sports news aggregation from global sources

**Provider**: [NewsAPI](https://newsapi.org/)

**Pricing**:
- **Developer**: Free - 100 requests/day (delayed news)
- **Business**: $449/month - 250,000 requests/month (live news)
- **Enterprise**: $1999/month - 1,000,000 requests/month

**Setup**:
```bash
# 1. Sign up at https://newsapi.org/
# 2. Get API key
NEWS_API_KEY=your_newsapi_key_here
```

**Note**: Free tier has 15-minute delay on news - consider paid tier for real-time

---

## 🟢 OPTIONAL APIs (Nice to Have)

### 6. Weather API - OpenWeatherMap
**Purpose**: Game-day weather conditions for outdoor sports

**Provider**: [OpenWeatherMap](https://openweathermap.org/api)

**Pricing**:
- **Free**: 1,000 calls/day
- **Startup**: $40/month - 60 calls/minute
- **Developer**: $120/month - 600 calls/minute

**Setup**:
```bash
WEATHER_API_KEY=your_weather_api_key_here
```

---

### 7. Basketball API - API-Basketball
**Provider**: [API-Sports.io](https://api-sports.io/documentation/basketball/v1)

**Pricing**: Same as API-Football ($15-150/month)

```bash
API_BASKETBALL_KEY=your_api_key_here
```

---

### 8. Hockey API - API-Hockey
**Provider**: [API-Sports.io](https://api-sports.io/documentation/hockey/v1)

**Pricing**: Same as API-Football ($15-150/month)

```bash
API_HOCKEY_KEY=your_api_key_here
```

---

### 9. Tennis API - Tennis Data API
**Provider**: Various options:
- [API-Tennis (API-Sports)](https://api-sports.io/)
- [Tennis Live Data](https://tennislivedata.com/)

**Pricing**: $15-100/month

```bash
TENNIS_API_KEY=your_api_key_here
```

---

### 10. Social Media - Twitter/X API
**Purpose**: Player sentiment, team announcements

**Provider**: [Twitter Developer Platform](https://developer.twitter.com/)

**Pricing**:
- **Free**: Very limited
- **Basic**: $100/month
- **Pro**: $5,000/month

**Setup**:
```bash
TWITTER_API_KEY=your_api_key_here
TWITTER_API_SECRET=your_api_secret_here
TWITTER_BEARER_TOKEN=your_bearer_token_here
```

---

## 💾 INFRASTRUCTURE APIs

### 11. Database - Railway PostgreSQL
**Purpose**: Store predictions, results, meta-learning data

**Provider**: Railway (included with deployment)

**Pricing**: ~$5-10/month

**Setup**: Automatically provided by Railway
```bash
DATABASE_URL=postgresql://... (auto-generated)
```

---

### 12. Caching - Railway Redis
**Purpose**: Cache API responses, rate limiting

**Provider**: Railway Redis plugin

**Pricing**: ~$2-5/month

**Setup**: Add Redis in Railway dashboard
```bash
REDIS_URL=redis://... (auto-generated)
```

---

## 📊 TOTAL COST ESTIMATES

### Minimal Setup (Testing/MVP)
**~$50-100/month**
- The Odds API: Free tier or $50
- OpenAI: Pay-as-you-go (~$10-20)
- SerpAPI: Free tier or $50
- NewsAPI: Free tier
- Weather: Free tier
- Railway: $5-10

**Features**:
- ✅ Basic odds data
- ✅ AI analysis
- ✅ Limited searches
- ⚠️ Delayed news
- ⚠️ Rate limits

---

### Production Setup (Recommended)
**~$250-400/month**
- The Odds API: $100
- OpenAI: $50-100
- SerpAPI: $50
- API-Football: $60
- API-Basketball: $60
- NewsAPI: $50
- Weather: Free
- Railway: $20-30

**Features**:
- ✅ Real-time odds
- ✅ Comprehensive stats
- ✅ Live news
- ✅ Multiple sports
- ✅ High request limits

---

### Enterprise Setup (Full Power)
**~$1000+/month**
- Multiple odds providers: $300-500
- SportsData.io: $200-500
- OpenAI + Claude: $200-300
- SerpAPI Pro: $250
- NewsAPI Business: $449
- Premium sports APIs: $300+
- Railway Pro: $50+

**Features**:
- ✅ Redundant data sources
- ✅ Maximum accuracy
- ✅ High volume
- ✅ Enterprise support
- ✅ Advanced ML

---

## 🚀 GETTING STARTED (Priority Order)

### Phase 1: Core Functionality
1. **The Odds API** (Critical) - Get betting odds
2. **OpenAI API** (Critical) - Enable AI analysis
3. **Railway PostgreSQL** (Critical) - Store data

**Cost**: ~$60-70/month  
**Result**: Working prediction system with basic data

---

### Phase 2: Enhanced Analysis
4. **SerpAPI** (Important) - Web search for insights
5. **API-Football** (Important) - Detailed stats
6. **NewsAPI** (Important) - News aggregation

**Cost**: +$120-170/month  
**Result**: Professional-grade analysis with deep insights

---

### Phase 3: Multi-Sport Coverage
7. **API-Basketball** - Basketball coverage
8. **API-Hockey** - Hockey coverage
9. **Tennis API** - Tennis coverage

**Cost**: +$45-100/month  
**Result**: Full 4-sport coverage

---

### Phase 4: Advanced Features
10. **Redis** - Caching & performance
11. **Twitter API** - Social sentiment
12. **Weather API** - Environmental factors

**Cost**: +$10-150/month  
**Result**: Maximum edge with all data sources

---

## 🔑 API Key Setup in Railway

### Step-by-Step

1. **Open Railway Dashboard**
   ```
   https://railway.app/dashboard → Your Project → Your Service
   ```

2. **Go to Variables Tab**
   ```
   Click "Variables" in the top navigation
   ```

3. **Add Each Variable**
   ```
   Click "+ New Variable"
   Name: ODDS_API_KEY
   Value: your_actual_api_key
   Click "Add"
   ```

4. **Repeat for All APIs**
   - Add each API key from this guide
   - Use exact variable names from .env.example
   - Double-check spelling

5. **Deploy**
   ```
   Changes trigger automatic redeployment
   Wait for build to complete
   ```

---

## 🧪 Testing API Connections

Create a test endpoint in your app:

```typescript
// server/routes.ts
app.get('/api/test-apis', async (req, res) => {
  const results = {
    odds: !!process.env.ODDS_API_KEY,
    openai: !!process.env.OPENAI_API_KEY,
    search: !!process.env.SERP_API_KEY,
    football: !!process.env.FOOTBALL_API_KEY,
    database: !!process.env.DATABASE_URL,
  };
  
  res.json({
    message: 'API Configuration Status',
    configured: results,
    ready: Object.values(results).filter(Boolean).length
  });
});
```

Visit: `https://your-app.railway.app/api/test-apis`

---

## 📝 NOTES

1. **Start Small**: Begin with free tiers and scale up as needed
2. **Monitor Usage**: Set up billing alerts on each API platform
3. **Rate Limiting**: Implement caching to reduce API calls
4. **Backup Keys**: Keep API keys in a secure password manager
5. **Rotate Keys**: Change keys periodically for security
6. **Error Handling**: Gracefully handle API failures

---

## 🔗 Quick Links

- [The Odds API](https://the-odds-api.com/)
- [OpenAI Platform](https://platform.openai.com/)
- [SerpAPI](https://serpapi.com/)
- [API-Football](https://www.api-football.com/)
- [NewsAPI](https://newsapi.org/)
- [Railway Dashboard](https://railway.app/dashboard)

---

**Good luck with your Apex AI deployment! 🎯**
