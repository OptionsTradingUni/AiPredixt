# 🚀 APEX AI - Complete API Setup Guides

This document contains step-by-step guides for setting up ALL free APIs and data sources used in the Apex AI Sports Prediction Intelligence system.

---

## 📋 Table of Contents

1. [Google Custom Search API](#1-google-custom-search-api-free-100-searchesday)
2. [Twitter/X API v2](#2-twitterx-api-v2-paid-100month-for-basic)
3. [Reddit API (PRAW)](#3-reddit-api-praw-free)
4. [The Odds API](#4-the-odds-api-free-500-requestsmonth)
5. [API-Football](#5-api-football-free-100-requestsday)
6. [OpenWeather API](#6-openweather-api-free-1000-callsday)

---

## 1. Google Custom Search API (FREE: 100 searches/day)

### What it does
- Scrapes Google search results programmatically
- 100 FREE searches per day
- Used for finding team stats, news, injuries, and more

### Setup Steps

#### Step 1: Create a Programmable Search Engine
1. Go to https://programmablesearchengine.google.com/controlpanel
2. Click **"Add"** to create a new search engine
3. Configure:
   - **Sites to search**: Select **"Search the entire web"**
   - **Name**: "Sports Intelligence Scraper"
4. Click **"Create"**
5. **Copy your Search Engine ID (cx)** - looks like: `017576662512468239146:omuauf_lfve`

#### Step 2: Get Google API Key
1. Go to https://console.cloud.google.com/apis/credentials
2. Create a new project or select existing
3. Click **"Create Credentials"** → **"API Key"**
4. **Copy your API key** - looks like: `AIzaSyD...`
5. (Optional) Click "Restrict Key" → Select "Custom Search API" for security

#### Step 3: Enable Custom Search API
1. Go to https://console.cloud.google.com/apis/library
2. Search for **"Custom Search API"**
3. Click it and press **"Enable"**

#### Step 4: Add to .env file
```bash
GOOGLE_SEARCH_API_KEY=AIzaSyD_your_key_here
GOOGLE_SEARCH_CX=017576662512468239146:your_cx_here
```

### Testing
```bash
curl "https://www.googleapis.com/customsearch/v1?key=YOUR_API_KEY&cx=YOUR_CX&q=Manchester+City+statistics"
```

---

## 2. Twitter/X API v2 (PAID: $100/month for Basic)

### What it does
- Access Twitter data (tweets, user info, trends)
- Basic tier: 10,000 tweets/month read access
- Used for social sentiment analysis

### ⚠️ Important: Twitter API is NO LONGER FREE for reading data

Free tier only allows:
- Posting 1,500 tweets/month
- NO read access

For social sentiment analysis, you need **Basic tier ($100/month)**

### Setup Steps (Basic Tier)

#### Step 1: Create Developer Account
1. Go to https://developer.twitter.com/
2. Click **"Sign Up"** with your Twitter account
3. Accept Developer Agreement
4. Verify your email

#### Step 2: Subscribe to Basic Tier
1. Go to https://developer.twitter.com/en/portal/dashboard
2. Navigate to **"Products"** section
3. Click **"Basic"** tier
4. Click **"Subscribe"**
5. Enter payment details ($100/month)
6. Fill out use case description:
   ```
   "Building a sports analytics tool to analyze social media sentiment
   and engagement metrics for sports teams and athletes. Will fetch
   tweets, user profiles, and trending topics to provide insights
   for sports prediction and fan engagement analysis."
   ```

#### Step 3: Create App and Get Keys
1. Go to **"Projects & Apps"** → **"Create Project"**
2. Enter project name: "Apex Sports Intelligence"
3. Select use case: **"Exploring the API"**
4. Create app name: "apex-sports-scraper"
5. **SAVE THESE KEYS IMMEDIATELY** (shown only once):
   - API Key (Consumer Key)
   - API Secret Key (Consumer Secret)
   - Bearer Token
6. Go to **"Keys and Tokens"** → **"Generate"** Access Token
7. **SAVE**:
   - Access Token
   - Access Token Secret

#### Step 4: Add to .env file
```bash
TWITTER_API_KEY=your_api_key_here
TWITTER_API_SECRET=your_api_secret_here
TWITTER_BEARER_TOKEN=your_bearer_token_here
TWITTER_ACCESS_TOKEN=your_access_token_here
TWITTER_ACCESS_SECRET=your_access_secret_here
```

### Free Alternative: TwitterAPI.io
If $100/month is too expensive:
- https://twitterapi.io
- Pay-as-you-go: $0.15 per 1,000 tweets
- No developer account needed

---

## 3. Reddit API (PRAW) (FREE)

### What it does
- Access Reddit posts, comments, and user data
- 100 requests per minute (FREE)
- Used for fan sentiment and community analysis

### Setup Steps

#### Step 1: Create Reddit App
1. Log into Reddit at https://www.reddit.com
2. Go to https://www.reddit.com/prefs/apps
3. Scroll down and click **"Create App"** or **"Create Another App"**
4. Fill out:
   - **Name**: "Apex Sports Intelligence"
   - **App type**: Select **"script"**
   - **Description**: "Sports prediction analytics"
   - **About URL**: Leave blank
   - **Redirect URI**: `http://127.0.0.1:65010/authorize_callback`
5. Click **"Create app"**
6. **Copy these values**:
   - **Client ID**: The string below "personal use script" (14 characters)
   - **Secret**: The "secret" field (27 characters)

#### Step 2: Add to .env file
```bash
REDDIT_CLIENT_ID=your_client_id_here
REDDIT_CLIENT_SECRET=your_client_secret_here
REDDIT_USER_AGENT=apex-sports-bot/1.0 by u/YourRedditUsername
```

### Testing
```python
import praw

reddit = praw.Reddit(
    client_id="YOUR_CLIENT_ID",
    client_secret="YOUR_CLIENT_SECRET",
    user_agent="apex-sports-bot/1.0"
)

# Test - get hot posts from r/soccer
for post in reddit.subreddit("soccer").hot(limit=5):
    print(post.title)
```

---

## 4. The Odds API (FREE: 500 requests/month)

### What it does
- Live betting odds from 80+ sportsbooks
- 500 FREE requests per month
- Covers 30+ sports

### Setup Steps

#### Step 1: Sign Up
1. Go to https://the-odds-api.com/
2. Click **"Get API Key"**
3. Enter your email
4. Check your email and click the verification link
5. **Copy your API key** from the dashboard

#### Step 2: Add to .env file
```bash
ODDS_API_KEY=your_odds_api_key_here
```

### Testing
```bash
curl "https://api.the-odds-api.com/v4/sports/soccer_epl/odds/?apiKey=YOUR_API_KEY&regions=us,uk&markets=h2h"
```

---

## 5. API-Football (FREE: 100 requests/day)

### What it does
- Comprehensive football/soccer data
- 100 FREE requests per day
- 1,100+ leagues, live scores, stats

### Setup Steps

#### Step 1: Sign Up
1. Go to https://dashboard.api-football.com
2. Click **"Sign Up"** (no credit card required)
3. Verify your email
4. Login to dashboard

#### Step 2: Get API Key
1. In dashboard, find **"Your API Key"**
2. **Copy your API key**

#### Step 3: Add to .env file
```bash
API_FOOTBALL_KEY=your_api_football_key_here
```

### Testing
```bash
curl --request GET \
  --url 'https://v3.football.api-sports.io/fixtures?league=39&season=2024' \
  --header 'x-rapidapi-host: v3.football.api-sports.io' \
  --header 'x-rapidapi-key: YOUR_API_KEY'
```

---

## 6. OpenWeather API (FREE: 1,000 calls/day)

### What it does
- Weather data for match locations
- 1,000 FREE calls per day
- Used for environmental factor analysis

### Setup Steps

#### Step 1: Sign Up
1. Go to https://openweathermap.org/api
2. Click **"Sign Up"**
3. Verify your email
4. Login to your account

#### Step 2: Get API Key
1. Go to https://home.openweathermap.org/api_keys
2. **Copy your API key** (default key is auto-generated)
3. Or create a new key by entering a name and clicking **"Generate"**

#### Step 3: Add to .env file
```bash
WEATHER_API_KEY=your_weather_api_key_here
```

### Testing
```bash
curl "https://api.openweathermap.org/data/2.5/weather?q=Manchester&appid=YOUR_API_KEY&units=metric"
```

---

## 🎯 Complete .env File Example

After completing all setups, your `.env` file should look like:

```bash
# Google Custom Search (100/day FREE)
GOOGLE_SEARCH_API_KEY=AIzaSyD_your_key_here
GOOGLE_SEARCH_CX=017576662512468239146:your_cx_here

# Twitter API (Paid $100/month or use alternative)
TWITTER_API_KEY=your_api_key
TWITTER_API_SECRET=your_api_secret
TWITTER_BEARER_TOKEN=your_bearer_token
TWITTER_ACCESS_TOKEN=your_access_token
TWITTER_ACCESS_SECRET=your_access_secret

# Reddit API (FREE)
REDDIT_CLIENT_ID=your_client_id
REDDIT_CLIENT_SECRET=your_client_secret
REDDIT_USER_AGENT=apex-sports-bot/1.0 by u/YourUsername

# The Odds API (500/month FREE)
ODDS_API_KEY=your_odds_api_key

# API-Football (100/day FREE)
API_FOOTBALL_KEY=your_api_football_key

# OpenWeather (1000/day FREE)
WEATHER_API_KEY=your_weather_api_key
```

---

## 💰 Cost Summary

| API | Free Tier | Paid Tier | Monthly Cost (if paid) |
|-----|-----------|-----------|------------------------|
| Google Search | 100 searches/day | 10K/day max | $5 per 1K searches |
| Twitter API | Write-only | Basic (10K tweets/month) | $100 |
| Reddit API | 100 req/min | N/A | FREE |
| The Odds API | 500 req/month | Unlimited | $49-$199 |
| API-Football | 100 req/day | Up to 1.5M/day | $0-$800+ |
| OpenWeather | 1K calls/day | Unlimited | $0-$40+ |

**Total FREE usage**: $0/month
**Recommended paid**: Twitter Basic ($100/month) - everything else stays FREE

---

## 🔒 Security Best Practices

1. **Never commit .env file to git**
   ```bash
   echo ".env" >> .gitignore
   ```

2. **Use environment variables in production**
   - Railway, Heroku, Vercel all support env vars
   - Add them in the dashboard, don't hardcode

3. **Rotate API keys regularly**
   - Change keys every 90 days
   - Especially after team members leave

4. **Monitor API usage**
   - Check dashboards daily
   - Set up billing alerts
   - Track request counts

5. **Restrict API keys**
   - Use IP restrictions when possible
   - Limit to specific APIs
   - Use separate keys for dev/production

---

## ❓ Troubleshooting

### Google Search: "Daily Limit Exceeded"
- **Solution**: Wait until midnight UTC for reset, or upgrade to paid tier

### Twitter: "403 Forbidden"
- **Solution**: You're using Essential (free) tier which has no read access. Upgrade to Basic ($100/month)

### Reddit: "401 Unauthorized"
- **Solution**: Check your client ID and secret are correct

### Odds API: "Out of requests"
- **Solution**: You've used your 500 monthly requests. Either wait for next month or upgrade

### API-Football: "Rate limit reached"
- **Solution**: You've used today's 100 requests. Wait until tomorrow (resets at midnight UTC)

---

## 🚀 Next Steps

1. Copy `.env.example` to `.env`
2. Follow setup guides above to get all API keys
3. Paste keys into `.env` file
4. Run `npm run dev` to start the application
5. The system will automatically use real data when APIs are configured!

---

## 📚 Additional Resources

- [Google Custom Search Docs](https://developers.google.com/custom-search/v1/overview)
- [Twitter API Documentation](https://developer.twitter.com/en/docs/twitter-api)
- [Reddit API (PRAW) Docs](https://praw.readthedocs.io/)
- [The Odds API Docs](https://the-odds-api.com/liveapi/guides/v4/)
- [API-Football Docs](https://www.api-football.com/documentation-v3)
- [OpenWeather API Docs](https://openweathermap.org/api)
