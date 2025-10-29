import { type User, type InsertUser, type ApexPrediction, type HistoricalPerformance, type SportType } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getApexPrediction(sport?: SportType): Promise<ApexPrediction>;
  getHistoricalPerformance(sport?: SportType): Promise<HistoricalPerformance[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;

  constructor() {
    this.users = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getApexPrediction(sport?: SportType): Promise<ApexPrediction> {
    // Generate mock prediction data based on sport
    const predictions = this.generateMockPredictions();
    
    if (sport) {
      const filtered = predictions.find(p => p.sport === sport);
      return filtered || predictions[0];
    }
    
    return predictions[0];
  }

  async getHistoricalPerformance(sport?: SportType): Promise<HistoricalPerformance[]> {
    const data: HistoricalPerformance[] = [];
    const sports: SportType[] = sport ? [sport] : ['Football', 'Basketball', 'Tennis', 'Hockey'];
    
    // Generate 10 days of historical data
    for (let i = 9; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      for (const s of sports) {
        data.push({
          date: date.toISOString().split('T')[0],
          sport: s,
          accuracy: 70 + Math.random() * 25, // 70-95% accuracy
          roi: 5 + Math.random() * 20, // 5-25% ROI
          confidenceScore: 75 + Math.random() * 20, // 75-95 confidence
        });
      }
    }
    
    return data;
  }

  private generateMockPredictions(): ApexPrediction[] {
    const timestamp = new Date().toISOString();
    
    return [
      {
        id: randomUUID(),
        sport: 'Football',
        match: 'Manchester City vs Liverpool',
        teams: {
          home: 'Manchester City',
          away: 'Liverpool',
        },
        league: 'Premier League',
        betType: 'Over 2.5 Goals',
        bestOdds: 1.85,
        bookmaker: 'SportyBet',
        timestamp,
        marketLiquidity: 'High',
        calculatedProbability: {
          ensembleAverage: 0.628,
          calibratedRange: {
            lower: 0.594,
            upper: 0.662,
          },
        },
        impliedProbability: 0.541,
        edge: 16.08,
        confidenceScore: 87,
        predictionStability: 'High',
        riskAssessment: {
          var: 2.34,
          cvar: 3.89,
          sensitivityAnalysis: 'Model shows robust performance across varying input parameters. Monte Carlo simulations with ±10% variance in key metrics (team form, tactical setups, weather conditions) demonstrate prediction stability within 4.2% deviation. Historical head-to-head analysis weighted at 23% influence shows consistent over 2.5 goals in 8 of last 10 meetings.',
          adversarialSimulation: 'Worst-case scenario modeling (key player absence, tactical surprises, referee bias) indicates minimum 54.2% probability even under adverse conditions. The prediction maintains positive EV across 94.7% of simulated adversarial scenarios. Defensive injury concerns for both teams actually strengthen the over goals case.',
          blackSwanResilience: 'High resilience score (8.4/10). Unlikely events (red cards, VAR controversies, extreme weather) modeled with historical frequency data. Prediction remains valid unless multiple simultaneous low-probability events occur (combined probability <2.1%). Diversification across betting markets provides additional risk mitigation.',
          keyRisks: [
            'Early goal could lead to defensive tactical shift, reducing goal-scoring opportunities',
            'Weather forecast shows potential for heavy rain in second half, historically correlating with 12% fewer goals',
            'Both teams have crucial Champions League fixtures midweek, potential squad rotation',
          ],
          potentialFailures: [
            'Unexpected ultra-defensive formation from Liverpool (probability 8.3%)',
            'First-half red card leading to match abandonment or extreme defensive play',
            'Late breaking injury news not yet factored into model',
          ],
        },
        recommendedStake: {
          kellyFraction: 'Quarter Kelly',
          unitDescription: '2.5 units recommended based on edge, confidence, and risk-adjusted bankroll management',
          percentageOfBankroll: 3.2,
        },
        justification: {
          summary: 'This Over 2.5 Goals prediction represents exceptional value driven by multiple converging factors: both teams rank in the top 3 for xG generation this season (Man City 2.8, Liverpool 2.6 per match), recent tactical evolution favoring attacking play, verified absences in both defensive lines, and historical precedent showing 78% of their meetings producing 3+ goals. Our ensemble model (Bayesian, XGBoost, Neural Network consensus 94.2%) identifies significant market mispricing with 16.08% positive EV - the largest edge detected across all fixtures today.',
          deepDive: [
            'Advanced metrics analysis: Both teams averaging combined 5.4 xG in head-to-head matches this season, with shot quality indicators (xG per shot) 23% above league average',
            'Tactical intelligence: Man City\'s recent switch to aggressive high press (PPDA 6.8) forces errors leading to high-value chances. Liverpool\'s counter-attacking speed (avg 4.2 seconds transition) exploits spaces',
            'Verified team news via official channels (timestamp: 2 hours ago): Man City missing Ruben Dias (defensive anchor), Liverpool without Virgil van Dijk replacement quality',
            'Weather-adjusted model: Mild conditions (18°C, <10% rain probability) optimal for open, attacking football based on historical correlation analysis',
            'Referee analysis: Michael Oliver assigned - historical average of 3.8 goals in Man City vs Liverpool matches he officiates, 18% above fixture average',
            'Market microstructure: Sharp money identified moving Over 2.5 line from 1.95 to 1.85 despite public backing under - following the smart money',
            'Psychological factors: Title race implications create attacking imperative for both teams, risk-taking behavior increases 31% in must-win scenarios per our behavioral model',
          ],
          competitiveEdge: [
            'Real-time API integration (sub-1 second latency) captured late team news 47 minutes before mainstream aggregators, allowing optimal line capture before market adjustment',
            'Proprietary tactical analysis model incorporating 127 in-game variables missed by standard platforms - identified Man City\'s recent high-press adjustment with 89.3% prediction accuracy',
            'Multi-source verification system triangulated injury reports across 6 independent sources, while popular sites rely on single-source data with 23% historical error rate',
          ],
          narrativeDebunking: 'Common narrative suggests "big teams defend in big matches" - our data shows this is outdated. In last 3 seasons, top-6 vs top-6 Premier League matches actually average 3.2 goals (12% higher than league average). The defensive narrative is a cognitive bias from memorable 0-0 draws, not statistical reality. Our causal analysis proves attacking quality, not caution, dominates modern elite matchups.',
          refutation: 'Counter-argument that "both teams need points so will play safe" is contradicted by game theory analysis - in simultaneous high-stakes scenarios, attacking strategy Nash equilibrium emerges. Historical data: teams tied on points late-season actually score 0.7 MORE goals per game due to necessity of winning.',
          explainabilityScore: 9,
          keyFeatures: [
            {
              feature: 'Combined Expected Goals (xG)',
              weight: 0.28,
              impact: 'Both teams generating 2.7+ xG per match',
              causalLink: 'Higher shot quality and volume directly increases goal probability through Poisson distribution modeling',
            },
            {
              feature: 'Defensive Absences',
              weight: 0.22,
              impact: 'Key defensive players out for both teams',
              causalLink: 'Loss of defensive anchors increases xG against by avg 0.8 goals based on historical player impact analysis',
            },
            {
              feature: 'Historical Head-to-Head',
              weight: 0.19,
              impact: '78% of recent meetings had 3+ goals',
              causalLink: 'Style matchup creates tactical vulnerabilities - high press vs counter-attack opens spaces consistently',
            },
            {
              feature: 'Tactical Setup Analysis',
              weight: 0.17,
              impact: 'Both managers favor attacking formations',
              causalLink: 'Formation analysis shows 3.1 forwards average for both teams in similar fixtures correlates with goal output',
            },
            {
              feature: 'Market Inefficiency Signal',
              weight: 0.14,
              impact: 'Sharp money movement detected',
              causalLink: 'Professional betting syndicates with verified ROI >18% backing Over indicates information edge in market',
            },
          ],
        },
        contingencyPick: {
          sport: 'Basketball',
          match: 'Lakers vs Warriors',
          betType: 'Lakers -3.5 Spread',
          odds: 1.91,
          confidenceScore: 79,
          stakeSize: 'Half Kelly (1.8 units)',
          triggerConditions: [
            'If Man City vs Liverpool Over 2.5 odds drop below 1.75 (indicating significant market movement)',
            'If confirmed heavy rain forecast updates to >60% probability in final hour before kickoff',
            'If late breaking news confirms additional defensive absences not yet priced in',
          ],
        },
      },
      {
        id: randomUUID(),
        sport: 'Basketball',
        match: 'Lakers vs Warriors',
        teams: {
          home: 'Los Angeles Lakers',
          away: 'Golden State Warriors',
        },
        league: 'NBA',
        betType: 'Lakers -3.5 Point Spread',
        bestOdds: 1.91,
        bookmaker: 'SportyBet',
        timestamp,
        marketLiquidity: 'High',
        calculatedProbability: {
          ensembleAverage: 0.594,
          calibratedRange: {
            lower: 0.561,
            upper: 0.627,
          },
        },
        impliedProbability: 0.524,
        edge: 13.36,
        confidenceScore: 79,
        predictionStability: 'Medium',
        riskAssessment: {
          var: 3.12,
          cvar: 4.67,
          sensitivityAnalysis: 'Spread prediction shows moderate sensitivity to LeBron James minutes restriction (±5 minutes impact: 2.1 point swing). Rest-vs-travel advantage heavily weighted (Lakers rested, Warriors on back-to-back). Simulation with variable rotation patterns maintains edge in 87.3% of scenarios.',
          adversarialSimulation: 'Warriors surprising zone defense deployment (15% probability based on coaching tendencies) would reduce expected margin by 1.8 points but maintain positive expected outcome. Model accounts for Stephen Curry\'s historical performance variance in LA (±4.2 points from average).',
          blackSwanResilience: 'Moderate resilience (6.7/10). Late scratch of key player would significantly impact model - monitoring injury reports until 30 minutes before tip-off critical. Technical foul accumulation or ejection scenarios modeled with 3.4% combined probability.',
          keyRisks: [
            'Warriors shoot above 40% from three-point range (season average 37.2%) - variance risk',
            'Lakers foul trouble in frontcourt could neutralize rebounding advantage',
            'Referee assignment: Scott Foster officiated (historically tight games, lower scoring)',
          ],
          potentialFailures: [
            'Late injury to Anthony Davis (monitoring required until game time)',
            'Unexpected pace slowdown if Warriors employ delay tactics',
          ],
        },
        recommendedStake: {
          kellyFraction: 'Quarter Kelly',
          unitDescription: '2.0 units based on moderate confidence and medium stability',
          percentageOfBankroll: 2.7,
        },
        justification: {
          summary: 'Lakers demonstrate clear advantages across multiple dimensions: rest differential (2 days vs Warriors back-to-back), home court with verified 68% ATS performance, superior rebounding metrics (+8.4 per game), and Anthony Davis matchup dominance against Warriors frontcourt. Model ensemble consensus at 89.1% supports -3.5 spread with 13.36% edge.',
          deepDive: [
            'Rest vs Fatigue analysis: Warriors playing 4th game in 6 nights, Lakers had 3 days rest. Historical data shows back-to-back teams underperform by average 4.2 points',
            'Matchup analytics: Anthony Davis averages 31.2 points against Warriors this season, exploiting size mismatch',
            'Pace and efficiency: Lakers control tempo at home (98.3 possessions), defensive rating 106.4 vs Warriors 112.1',
            'Three-point defense: Lakers holding opponents to 34.1% from beyond arc at home, Warriors rely heavily on perimeter (42% of points)',
            'Rebounding advantage: Lakers +8.4 rebound differential, creates second-chance opportunities worth 6.3 expected points',
          ],
          competitiveEdge: [
            'Real-time player tracking data shows Warriors key rotation players fatigue markers elevated by 18% on back-to-backs',
            'Advanced lineup analysis reveals Lakers starting five has +12.4 net rating in last 10 games vs Warriors bench-heavy rotations',
          ],
          explainabilityScore: 8,
          keyFeatures: [
            {
              feature: 'Rest Differential',
              weight: 0.31,
              impact: 'Lakers rested, Warriors fatigued',
              causalLink: 'Back-to-back games reduce shooting efficiency by 3.2% and increase turnover rate by 12%',
            },
            {
              feature: 'Home Court Advantage',
              weight: 0.24,
              impact: '68% ATS at home this season',
              causalLink: 'Crowd noise increases opponent turnover rate, Lakers shoot 4.7% better at home',
            },
            {
              feature: 'Rebounding Differential',
              weight: 0.23,
              impact: '+8.4 boards per game advantage',
              causalLink: 'Each offensive rebound creates 1.1 expected points, defensive boards limit possessions',
            },
            {
              feature: 'Defensive Matchup',
              weight: 0.22,
              impact: 'Lakers perimeter defense elite',
              causalLink: 'Limiting Warriors 3-point volume reduces their scoring by 8-12 points historically',
            },
          ],
        },
        contingencyPick: {
          sport: 'Tennis',
          match: 'Djokovic vs Alcaraz',
          betType: 'Djokovic to Win',
          odds: 2.15,
          confidenceScore: 73,
          stakeSize: 'Eighth Kelly (1.2 units)',
          triggerConditions: [
            'If Lakers spread moves to -5.5 or worse',
            'If late injury news affects Lakers rotation',
          ],
        },
      },
      {
        id: randomUUID(),
        sport: 'Tennis',
        match: 'Djokovic vs Alcaraz - ATP Finals',
        teams: {
          home: 'Novak Djokovic',
          away: 'Carlos Alcaraz',
        },
        league: 'ATP Finals',
        betType: 'Djokovic Match Winner',
        bestOdds: 2.15,
        bookmaker: 'SportyBet',
        timestamp,
        marketLiquidity: 'Medium',
        calculatedProbability: {
          ensembleAverage: 0.523,
          calibratedRange: {
            lower: 0.487,
            upper: 0.559,
          },
        },
        impliedProbability: 0.465,
        edge: 12.47,
        confidenceScore: 73,
        predictionStability: 'Medium',
        riskAssessment: {
          var: 4.21,
          cvar: 6.33,
          sensitivityAnalysis: 'Indoor hard court conditions favor Djokovic serve efficiency (+4.2% first serve points won vs outdoor). Model sensitivity to Alcaraz recent injury history (minor ankle concern) creates ±6.1% probability variance. Court speed measurements critical - faster courts increase Djokovic edge by 3.4%.',
          adversarialSimulation: 'Alcaraz peak performance scenario (95th percentile) still results in 48.7% Djokovic win probability. Mental fortitude factor heavily weighted - Djokovic 12-2 record in ATP Finals, Alcaraz first appearance creates pressure differential.',
          blackSwanResilience: 'Moderate (6.9/10). Match abandonment due to injury low probability (2.8%) but high impact. Weather not a factor (indoor). Outlier performance from Alcaraz possible but historically rare against Djokovic in high-pressure scenarios.',
          keyRisks: [
            'Alcaraz exceptional return game could neutralize Djokovic serve advantage',
            'Young player "nothing to lose" mentality may enable peak performance',
            'Court conditions final measurement needed 2 hours before match',
          ],
          potentialFailures: [
            'Djokovic showing minor signs of fatigue after long season',
            'Alcaraz momentum from recent tournament victory',
          ],
        },
        recommendedStake: {
          kellyFraction: 'Eighth Kelly',
          unitDescription: '1.5 units given moderate confidence and medium liquidity',
          percentageOfBankroll: 1.9,
        },
        justification: {
          summary: 'Djokovic presents value despite close odds due to superior indoor hard court performance metrics (82.4% win rate last 3 seasons), ATP Finals experience advantage (7 titles vs 0 for Alcaraz), and historical head-to-head tactical matchup favoring baseline consistency over aggressive shot-making. Recent form analysis shows Djokovic peaking at optimal tournament timing.',
          deepDive: [
            'Surface-specific performance: Djokovic 47-4 on indoor hard courts since 2021, Alcaraz 18-3 but limited sample size',
            'Serve analysis: Djokovic first serve points won 76.2% indoors vs Alcaraz 72.8%, critical in best-of-3 format',
            'Return metrics: Both elite returners, but Djokovic break point conversion 47.3% vs 43.1% in high-pressure matches',
            'Physical conditioning: Late season favors Djokovic preparation and experience, Alcaraz showing minor fatigue markers',
            'Mental edge: Djokovic 73.2% win rate in matches as underdog, thrives in pressure situations',
          ],
          competitiveEdge: [
            'Proprietary tennis analytics incorporating 34 biomechanical factors show Djokovic court coverage optimal for these specific court dimensions',
            'Recent practice session analysis (verified sources) indicates Djokovic serve speed increased 3.2% in final preparation',
          ],
          explainabilityScore: 7,
          keyFeatures: [
            {
              feature: 'Indoor Hard Court Performance',
              weight: 0.29,
              impact: 'Djokovic 82.4% win rate',
              causalLink: 'Controlled conditions favor consistent baseline play, neutralizing power differential',
            },
            {
              feature: 'Tournament Experience',
              weight: 0.26,
              impact: '7 ATP Finals titles vs 0',
              causalLink: 'Pressure management and strategic pacing based on experience reduces unforced errors by 8.3%',
            },
            {
              feature: 'Head-to-Head Tactical Matchup',
              weight: 0.24,
              impact: 'Style clash favors defense',
              causalLink: 'Alcaraz aggressive style generates 12% more unforced errors against Djokovic counterpunching',
            },
            {
              feature: 'Late Season Form',
              weight: 0.21,
              impact: 'Djokovic peaking timing',
              causalLink: 'Veteran preparation pattern shows performance optimization in November, stamina advantage',
            },
          ],
        },
        contingencyPick: {
          sport: 'Hockey',
          match: 'Maple Leafs vs Bruins',
          betType: 'Bruins Moneyline',
          odds: 1.87,
          confidenceScore: 76,
          stakeSize: 'Quarter Kelly (1.7 units)',
          triggerConditions: [
            'If Djokovic odds drop below 1.95',
            'If late injury update affects match',
          ],
        },
      },
      {
        id: randomUUID(),
        sport: 'Hockey',
        match: 'Toronto Maple Leafs vs Boston Bruins',
        teams: {
          home: 'Toronto Maple Leafs',
          away: 'Boston Bruins',
        },
        league: 'NHL',
        betType: 'Boston Bruins Moneyline',
        bestOdds: 1.87,
        bookmaker: 'SportyBet',
        timestamp,
        marketLiquidity: 'High',
        calculatedProbability: {
          ensembleAverage: 0.587,
          calibratedRange: {
            lower: 0.553,
            upper: 0.621,
          },
        },
        impliedProbability: 0.535,
        edge: 9.72,
        confidenceScore: 76,
        predictionStability: 'High',
        riskAssessment: {
          var: 2.89,
          cvar: 4.12,
          sensitivityAnalysis: 'Goaltender matchup heavily weighted (38% model influence). Bruins goalie Linus Ullmark .923 save percentage vs Maple Leafs .901. Sensitivity testing shows prediction stable across variance in offensive output (±0.5 goals) due to defensive/goaltending edge.',
          adversarialSimulation: 'Maple Leafs power play surge (scoring on 3+ opportunities) modeled at 11.2% probability - Bruins penalty kill 84.3% successful rate provides mitigation. Road team advantage in historical Leafs-Bruins matchups (62% road team wins last 15 games) supports thesis.',
          blackSwanResilience: 'High (8.1/10). Goalie injury mid-game is primary black swan risk (probability 1.7%). Backup goalie metrics factored into secondary model. Fight-induced game flow disruption historically negligible impact on outcome.',
          keyRisks: [
            'Maple Leafs elite offensive talent (Matthews, Marner, Nylander) can generate scoring bursts',
            'Home crowd momentum in playoff-atmosphere rivalry game',
            'Referee tendency toward make-up calls could impact special teams',
          ],
          potentialFailures: [
            'Bruins defensive pairing injury in warm-ups (monitoring required)',
            'Unusual puck luck variance (shooting percentage extremes)',
          ],
        },
        recommendedStake: {
          kellyFraction: 'Quarter Kelly',
          unitDescription: '1.9 units based on strong confidence and high stability',
          percentageOfBankroll: 2.4,
        },
        justification: {
          summary: 'Bruins represent strong value driven by elite goaltending matchup (Ullmark .923 SV% vs Leafs .901), superior defensive structure (allowing 2.1 goals per game vs 2.8), and favorable historical pattern in this rivalry. Advanced analytics show Bruins expected goals against (xGA) 12% better, with special teams advantage providing additional edge.',
          deepDive: [
            'Goaltending analysis: Ullmark 12-3-2 record against Toronto, save percentage .931 in rivalry games specifically',
            'Defensive metrics: Bruins allowing 24.3 shots per game (3rd in NHL), Leafs 28.7 (18th), shot quality against (xGA/60) favors Bruins 2.1 vs 2.4',
            'Special teams: Bruins power play 26.8% (2nd) vs Leafs penalty kill 78.2% (17th) creates leverage opportunity',
            'Possession metrics: Corsi For % shows Bruins 53.2% vs Leafs 51.1%, controlling puck possession critical in playoff-style games',
            'Travel and rest: Both teams on equal rest, travel factor neutral',
            'Historical patterns: Road team 9-6 in last 15 meetings, suggesting home ice less impactful in this rivalry',
          ],
          competitiveEdge: [
            'Proprietary goalie performance model incorporating 23 situational factors (crowd noise, rest, recent workload) projects Ullmark 7.2% above baseline',
            'Real-time line combination tracking identified Bruins optimal top-6 forward deployment matching up favorably against Leafs defensive pairings',
          ],
          explainabilityScore: 8,
          keyFeatures: [
            {
              feature: 'Goaltending Differential',
              weight: 0.38,
              impact: 'Ullmark .922 SV% advantage',
              causalLink: 'Every 0.01 SV% differential equals approximately 0.3 goals prevented per game in high-shot environments',
            },
            {
              feature: 'Defensive Structure',
              weight: 0.27,
              impact: 'Bruins elite defensive metrics',
              causalLink: 'Lower shot volume and quality against directly reduces expected goals by 0.7 per game',
            },
            {
              feature: 'Special Teams Advantage',
              weight: 0.19,
              impact: 'Power play vs penalty kill mismatch',
              causalLink: 'Expected 2.3 power play opportunities per game, 26.8% conversion adds 0.6 expected goals',
            },
            {
              feature: 'Historical Rivalry Pattern',
              weight: 0.16,
              impact: 'Road team success in series',
              causalLink: 'Playoff-intensity matchup reduces home ice advantage, Bruins road performance 58% win rate',
            },
          ],
        },
        contingencyPick: {
          sport: 'Football',
          match: 'Bayern Munich vs Dortmund',
          betType: 'Bayern Munich -1.5 Goals',
          odds: 2.05,
          confidenceScore: 71,
          stakeSize: 'Eighth Kelly (1.4 units)',
          triggerConditions: [
            'If Bruins moneyline drops below 1.75',
            'If goaltender change announced',
          ],
        },
      },
    ];
  }
}

export const storage = new MemStorage();
