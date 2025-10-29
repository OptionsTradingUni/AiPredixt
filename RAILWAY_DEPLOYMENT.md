# 🚂 Railway Deployment Guide - Apex AI Sports Prediction Engine

## Overview
This guide walks you through deploying the Apex AI Sports Prediction Engine to Railway. Railway provides automatic deployments, managed PostgreSQL, Redis caching, and environment variable management.

---

## 📋 Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **GitHub Repository**: Push your code to GitHub
3. **API Keys**: Obtain necessary API keys (see Environment Variables section)

---

## 🚀 Quick Deploy (Recommended)

### Option 1: Deploy from GitHub

1. **Connect GitHub to Railway**
   ```
   1. Go to https://railway.app/new
   2. Click "Deploy from GitHub repo"
   3. Authorize Railway to access your GitHub
   4. Select your Apex AI repository
   ```

2. **Railway Auto-Detection**
   - Railway detects Node.js project automatically
   - Reads `package.json` and runs:
     - **Install**: `npm install`
     - **Build**: `npm run build`
     - **Start**: `npm start`

3. **Generate Domain**
   ```
   1. Go to your service settings
   2. Click "Networking" → "Generate Domain"
   3. Your app will be live at: https://your-app.up.railway.app
   ```

### Option 2: Deploy via Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project (in your app directory)
railway init

# Link to new or existing project
railway link

# Deploy
railway up

# Open in browser
railway open
```

---

## 🗄️ Database Setup

### Add PostgreSQL Database

1. **In Railway Dashboard**
   ```
   1. Open your project
   2. Click "+ New" → "Database" → "PostgreSQL"
   3. Railway auto-generates DATABASE_URL
   ```

2. **Connect to Database**
   - Railway automatically sets `DATABASE_URL` environment variable
   - Your app reads it from `process.env.DATABASE_URL`
   - Format: `postgresql://user:password@host:port/database`

3. **Run Migrations**
   ```bash
   # Using Railway CLI
   railway run npm run db:push
   
   # Or via Railway dashboard: Settings → Deploy Triggers → Run Command
   ```

### Add Redis (Optional but Recommended for Caching)

```
1. Click "+ New" → "Database" → "Redis"
2. Railway provides REDIS_URL automatically
3. Use for caching API responses and rate limiting
```

---

## 🔐 Environment Variables Setup

### Critical Variables (Set These First)

Go to your Railway service → **Variables** tab:

#### 1. Application Config
```bash
NODE_ENV=production
PORT=${{PORT}}  # Railway auto-assigns this
SESSION_SECRET=generate-random-32-char-string
```

#### 2. Database (Auto-provided by Railway if you added PostgreSQL)
```bash
DATABASE_URL=${{Postgres.DATABASE_URL}}  # Auto-linked
```

#### 3. Sports Data APIs (Choose based on your budget)
```bash
# Essential for production
ODDS_API_KEY=your_odds_api_key_here
FOOTBALL_API_KEY=your_football_api_key_here
API_BASKETBALL_KEY=your_basketball_api_key_here

# Optional: For comprehensive data
SPORTSDATA_API_KEY=your_key
```

#### 4. AI/ML APIs (For Analysis)
```bash
OPENAI_API_KEY=your_openai_api_key_here
```

#### 5. Search APIs (For Investigative Phase)
```bash
SERP_API_KEY=your_serpapi_key_here
NEWS_API_KEY=your_newsapi_key_here
```

### Variable Groups (Organize by Category)

Railway allows grouping variables:

**Group: Sports Data**
- ODDS_API_KEY
- FOOTBALL_API_KEY
- API_BASKETBALL_KEY
- API_HOCKEY_KEY
- TENNIS_API_KEY

**Group: AI Services**
- OPENAI_API_KEY
- ANTHROPIC_API_KEY

**Group: Search & News**
- SERP_API_KEY
- NEWS_API_KEY
- TWITTER_API_KEY

**Group: Configuration**
- NODE_ENV
- USE_REAL_APIS
- MIN_CONFIDENCE_THRESHOLD
- MIN_EV_THRESHOLD

---

## 📦 Build Configuration

### Verify package.json Scripts

Your `package.json` should have (already configured):

```json
{
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start": "NODE_ENV=production node dist/index.js",
    "db:push": "drizzle-kit push"
  }
}
```

### Railway Build Process

Railway automatically runs:
1. `npm install` (installs all dependencies)
2. `npm run build` (builds Vite frontend + bundles Express backend)
3. `npm start` (starts production server)

---

## 🌐 Custom Domain (Optional)

### Add Your Own Domain

1. **In Railway Dashboard**
   ```
   Settings → Networking → Custom Domain
   ```

2. **Add DNS Records** (at your domain registrar)
   ```
   Type: CNAME
   Name: apex (or @ for root domain)
   Value: your-app.up.railway.app
   ```

3. **SSL Certificate**
   - Railway auto-generates SSL certificate
   - HTTPS enabled automatically

---

## 🔍 Monitoring & Logs

### View Logs

**In Railway Dashboard:**
```
1. Go to your service
2. Click "Deployments"
3. Select active deployment
4. View real-time logs
```

**Via CLI:**
```bash
railway logs
```

### Health Check Endpoint

Add to your Express app (recommended):

```typescript
// server/routes.ts
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version 
  });
});
```

---

## 🛡️ Security Best Practices

### 1. Environment Variables
- ✅ Store ALL secrets in Railway Variables (never in code)
- ✅ Use Railway's encrypted variables for sensitive data
- ✅ Rotate API keys regularly

### 2. CORS Configuration
```typescript
// server/index.ts
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));
```

### 3. Rate Limiting
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

---

## 💰 Cost Estimation

### Railway Costs
- **Starter Plan**: $5/month
  - $5 included credits
  - ~500 hours of runtime
  - Suitable for small apps

- **Hobby Plan**: $20/month
  - $20 included credits
  - Unlimited projects
  - Good for production apps

- **Database Add-ons**:
  - PostgreSQL: ~$5-10/month
  - Redis: ~$2-5/month

### External API Costs (Monthly)

**Minimal Setup** (~$50-100/month):
- The Odds API: Free tier or $50
- OpenAI API: Pay-as-you-go (~$10-30)
- NewsAPI: Free tier (100 requests/day)

**Production Setup** (~$200-500/month):
- The Odds API: $100-200
- SportsData.io: $29-99
- OpenAI API: $50-100
- SerpAPI: $50-100
- Weather API: Free tier

**Enterprise Setup** ($1000+/month):
- Multiple sports data providers
- Unlimited API calls
- Premium AI models
- Advanced monitoring

---

## 🔄 Deployment Workflow

### Automatic Deployments

Railway deploys automatically when you push to GitHub:

```bash
# Make changes locally
git add .
git commit -m "Update prediction algorithm"
git push origin main

# Railway automatically:
# 1. Detects push
# 2. Runs build
# 3. Deploys new version
# 4. Zero-downtime deployment
```

### Manual Deployments

```bash
# Via CLI
railway up

# Or redeploy latest in dashboard
# Deployments → Active Deployment → Redeploy
```

---

## 🧪 Testing Production Build Locally

Before deploying to Railway, test production build:

```bash
# Build the app
npm run build

# Set environment variables
export NODE_ENV=production
export PORT=5000
export DATABASE_URL=your_local_db_url

# Start production server
npm start

# Test at http://localhost:5000
```

---

## 📊 Performance Optimization

### 1. Enable Redis Caching

Cache expensive API calls:

```typescript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

async function getCachedOdds(gameId: string) {
  const cached = await redis.get(`odds:${gameId}`);
  if (cached) return JSON.parse(cached);
  
  const odds = await fetchOddsFromAPI(gameId);
  await redis.setex(`odds:${gameId}`, 300, JSON.stringify(odds)); // 5 min cache
  return odds;
}
```

### 2. Database Connection Pooling

```typescript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // max connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### 3. Compress Responses

```typescript
import compression from 'compression';
app.use(compression());
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Build Fails
```bash
# Check logs in Railway dashboard
# Common causes:
# - Missing dependencies in package.json
# - TypeScript errors
# - Environment variables not set

# Fix: Ensure all dependencies are in package.json
npm install --save-dev @types/node typescript
```

#### 2. App Crashes on Start
```bash
# Check Railway logs
# Common causes:
# - Missing DATABASE_URL
# - Wrong PORT binding
# - Missing environment variables

# Fix: Ensure server binds to 0.0.0.0:PORT
app.listen(process.env.PORT || 5000, '0.0.0.0');
```

#### 3. 502 Bad Gateway
```bash
# Cause: App not responding to HTTP requests
# Fix: Ensure app starts successfully and logs "serving on port XXXX"
```

#### 4. Database Connection Fails
```bash
# Check DATABASE_URL is set correctly
railway variables

# Test database connection
railway run npm run db:push
```

---

## 📝 Post-Deployment Checklist

- [ ] App is accessible at Railway URL
- [ ] All environment variables are set
- [ ] Database migrations ran successfully
- [ ] Health check endpoint returns 200 OK
- [ ] API endpoints respond correctly
- [ ] Frontend loads and displays data
- [ ] Check Railway logs for errors
- [ ] Test prediction generation
- [ ] Verify API rate limits aren't exceeded
- [ ] Set up monitoring/alerts (optional)
- [ ] Configure custom domain (optional)

---

## 🔗 Useful Links

- **Railway Dashboard**: https://railway.app/dashboard
- **Railway Docs**: https://docs.railway.com
- **Railway Templates**: https://railway.app/templates
- **Railway CLI**: https://docs.railway.com/guides/cli
- **Railway Discord**: https://discord.gg/railway

---

## 🆘 Support

If you encounter issues:

1. **Check Railway Logs**: Most issues are visible in deployment logs
2. **Railway Documentation**: https://docs.railway.com
3. **Railway Discord**: Active community support
4. **GitHub Issues**: Report bugs in your repository

---

## 📈 Scaling Considerations

As your app grows:

1. **Horizontal Scaling**: Railway auto-scales with traffic
2. **Database Optimization**: Add indexes, optimize queries
3. **Caching Layer**: Use Redis for frequently accessed data
4. **CDN**: Use Railway's built-in CDN for static assets
5. **Load Balancing**: Railway handles this automatically
6. **Monitoring**: Consider adding Sentry, DataDog, or New Relic

---

**🎉 Congratulations!** Your Apex AI Sports Prediction Engine is now deployed on Railway!

Remember to monitor your API usage and costs, especially with external APIs. Start with free tiers and scale up as needed.
