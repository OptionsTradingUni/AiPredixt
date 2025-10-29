# Apex AI Sports Prediction Engine

## Overview
A sophisticated AI-powered sports betting prediction platform that provides comprehensive analytics, risk assessment, and detailed justifications for high-probability betting opportunities across Football, Tennis, Basketball, and Hockey. Building towards the full Advanced Sports Stats & Predictions Platform as outlined in the project brief.

## Current State
**Status:** ✅ MVP Complete + Enhanced Probability Model - Fully functional with transparent probability calculations

**Last Updated:** October 29, 2025

## Recent Enhancements (October 29, 2025)

### Enhanced Probability System
- **Dual Probability Display**: Now shows BOTH conservative model (45-75% capped) AND market-implied probabilities
- **Transparency**: Users can see the raw uncapped probability, conservative model, and market odds-based probability
- **New Fields in Schema**:
  - `marketImplied`: Market-implied probability from bookmaker odds
  - `modelType`: 'conservative' | 'aggressive' | 'balanced'
  - `rawUncapped`: Raw model probability before caps
- **Backend Calculation**: Updated `calculateTrueProbability` to return object with all three probability values
- **Example Output**: "Raw: 57.4%, Conservative: 57.4%, Market Implied: 52.6%"

## Features Implemented

### Core Functionality
- **Apex Pick Display**: Hero card showing the single best betting opportunity with prominent odds, confidence scores, and edge calculations
- **Sport Filtering**: Interactive filters for Football, Basketball, Tennis, and Hockey with real-time prediction updates
- **Comprehensive Metrics**: Calculated probability, implied probability, EV%, confidence scores, and prediction stability
- **Advanced Risk Assessment**: VaR/CVaR analysis, sensitivity testing, adversarial simulation, and black swan resilience
- **Multi-Level Justification**: Executive summary, deep dive analysis, competitive edge explanation, narrative debunking, and explainability scoring with causal feature analysis
- **Market Analysis**: Liquidity assessment, recommended stake sizing using Kelly Criterion
- **Contingency Picks**: Alternative betting recommendations with trigger conditions
- **Historical Performance**: Data visualization showing accuracy and ROI trends over time

### User Interface
- **Professional Dark Theme**: Data-rich interface optimized for analytics
- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop
- **Beautiful Data Visualizations**: Charts for historical performance with Recharts
- **Interactive Components**: Accordion sections, tabbed interfaces, progress bars
- **Monospace Numbers**: All numerical data uses JetBrains Mono for clarity
- **Smooth Interactions**: Hover effects, transitions, and loading states

## Technical Architecture

### Frontend
- **Framework**: React with TypeScript
- **Routing**: Wouter
- **State Management**: TanStack Query v5 for server state
- **UI Components**: Shadcn UI with Radix primitives
- **Styling**: Tailwind CSS with custom design system
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React

### Backend
- **Server**: Express.js
- **Storage**: In-memory storage with sophisticated mock data
- **API Endpoints**:
  - `GET /api/apex-prediction?sport={sport}` - Returns Apex prediction for specific sport or all sports
  - `GET /api/historical-performance?sport={sport}` - Returns historical performance data

### Data Models
See `shared/schema.ts` for complete type definitions:
- `ApexPrediction` - Complete prediction with all analytics
- `RiskAssessment` - Comprehensive risk metrics
- `Justification` - Multi-level analysis and explanations
- `ContingencyPick` - Alternative betting recommendations
- `HistoricalPerformance` - Time-series performance data

## Project Structure

```
├── client/
│   ├── src/
│   │   ├── pages/
│   │   │   └── dashboard.tsx          # Main dashboard page
│   │   ├── components/
│   │   │   ├── sport-filter.tsx       # Sport selection buttons
│   │   │   ├── apex-pick-card.tsx     # Hero prediction card
│   │   │   ├── metrics-grid.tsx       # Key metrics display
│   │   │   ├── risk-assessment-panel.tsx  # Risk analysis tabs
│   │   │   ├── justification-section.tsx  # Detailed justification
│   │   │   ├── market-analysis-table.tsx  # Market data & staking
│   │   │   ├── contingency-pick-card.tsx  # Alternative pick
│   │   │   └── historical-performance-chart.tsx  # Performance viz
│   │   └── index.css                  # Design system & theme
│   └── index.html                     # SEO metadata
├── server/
│   ├── routes.ts                      # API endpoint definitions
│   └── storage.ts                     # Mock data generation
├── shared/
│   └── schema.ts                      # TypeScript type definitions
└── design_guidelines.md               # UI/UX design specifications
```

## Design Guidelines
The application follows professional design principles outlined in `design_guidelines.md`:
- **Typography**: Inter for UI, JetBrains Mono for numerical data
- **Color System**: Professional dark theme with semantic color tokens
- **Component Patterns**: Consistent use of Shadcn components
- **Data Visualization**: Clear charts with proper legends and tooltips
- **Spacing**: Consistent 8px grid system
- **Interactions**: Subtle hover effects, smooth transitions

## Mock Data
The backend generates realistic predictions for 4 sports:
- **Football**: Manchester City vs Liverpool - Over 2.5 Goals
- **Basketball**: Lakers vs Warriors - Lakers -3.5 Spread
- **Tennis**: Djokovic vs Alcaraz - Djokovic Match Winner
- **Hockey**: Maple Leafs vs Bruins - Bruins Moneyline

Each prediction includes:
- Comprehensive probability calculations with confidence intervals
- Risk assessment (VaR, CVaR, sensitivity analysis)
- Detailed justifications with causal feature analysis
- Kelly Criterion stake recommendations
- Contingency picks with trigger conditions
- Historical performance metrics

## Running the Application

1. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Server runs on http://localhost:5000

2. **Access the Application**:
   Navigate to http://localhost:5000 in your browser

3. **Features**:
   - Click sport filter buttons to see sport-specific predictions
   - Expand accordion sections to view detailed analysis
   - Switch between risk assessment tabs
   - Scroll to view contingency pick and historical performance

## Next Phase (Future Development)

### Real API Integration
- Connect to live sports data APIs for real-time odds
- Integrate actual AI/ML prediction models
- Real-time injury reports and lineup confirmations
- Live odds tracking across multiple bookmakers

### Advanced Features
- User authentication and personalized risk profiles
- Betting history tracking and ROI analysis
- Real-time notifications for high-value opportunities
- Advanced portfolio management with bankroll tracking
- Social features for sharing predictions
- Mobile app versions

### Analytics Enhancements
- Live probability distributions
- More sophisticated risk models
- Machine learning model performance tracking
- A/B testing for prediction strategies

## Testing
- ✅ End-to-end tests passing for all core features
- ✅ Sport filtering verified for all sports
- ✅ UI components render correctly
- ✅ Data visualization working properly
- ✅ Responsive design tested

## Performance
- Fast page loads with efficient data fetching
- Optimized re-renders with TanStack Query
- Smooth transitions and interactions
- Lazy loading for charts and heavy components

## Browser Support
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Notes
- Application uses in-memory storage (data resets on server restart)
- Mock data is deterministic for consistent testing
- All timestamps are in ISO 8601 format
- Currency/stake calculations are for demonstration purposes only
- Legal disclaimer: For informational and educational purposes only
