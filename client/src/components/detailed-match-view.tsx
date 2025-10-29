import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, TrendingDown, Minus, Target, Activity, BarChart3, Trophy, Clock, MapPin } from "lucide-react";
import { type ApexPrediction } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";

interface DetailedMatchViewProps {
  prediction: ApexPrediction;
  onClose?: () => void;
}

export function DetailedMatchView({ prediction, onClose }: DetailedMatchViewProps) {
  const hasAdvancedStats = prediction.advancedStats;
  
  // Fetch H2H data
  const { data: h2hData, isLoading: h2hLoading } = useQuery({
    queryKey: ['/api/h2h', prediction.teams.home, prediction.teams.away],
    queryFn: async () => {
      const params = new URLSearchParams({
        teamA: prediction.teams.home,
        teamB: prediction.teams.away,
        sport: prediction.sport,
      });
      const response = await fetch(`/api/h2h?${params}`);
      if (!response.ok) throw new Error('Failed to fetch H2H data');
      return response.json();
    },
  });
  
  // Fetch league standings
  const { data: standings, isLoading: standingsLoading } = useQuery({
    queryKey: ['/api/standings', prediction.league],
    queryFn: async () => {
      const params = new URLSearchParams({
        league: prediction.league,
      });
      const response = await fetch(`/api/standings?${params}`);
      if (!response.ok) throw new Error('Failed to fetch standings');
      return response.json();
    },
  });
  
  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" data-testid="badge-sport">{prediction.sport}</Badge>
                <Badge data-testid="badge-league">{prediction.league}</Badge>
              </div>
              <CardTitle className="text-2xl" data-testid="text-match-title">
                {prediction.teams.home} vs {prediction.teams.away}
              </CardTitle>
              <CardDescription data-testid="text-match-id">
                Match ID: {prediction.id}
              </CardDescription>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
                data-testid="button-close"
              >
                ✕
              </button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-6" data-testid="tabs-match-details">
              <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
              <TabsTrigger value="prediction" data-testid="tab-prediction">Prediction</TabsTrigger>
              <TabsTrigger value="stats" data-testid="tab-stats">Stats</TabsTrigger>
              <TabsTrigger value="h2h" data-testid="tab-h2h">H2H</TabsTrigger>
              <TabsTrigger value="form" data-testid="tab-form">Form</TabsTrigger>
              <TabsTrigger value="odds" data-testid="tab-odds">Odds</TabsTrigger>
            </TabsList>

            {/* OVERVIEW TAB */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg" data-testid="text-home-team">{prediction.teams.home}</CardTitle>
                    <CardDescription>Home Team</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {hasAdvancedStats && (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">xG (Expected Goals)</span>
                          <span className="font-semibold" data-testid="text-home-xg">
                            {prediction.advancedStats?.home.xG?.toFixed(2) || 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">xPTS (Expected Points)</span>
                          <span className="font-semibold" data-testid="text-home-xpts">
                            {prediction.advancedStats?.home.xPTS?.toFixed(1) || 'N/A'}
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg" data-testid="text-away-team">{prediction.teams.away}</CardTitle>
                    <CardDescription>Away Team</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {hasAdvancedStats && (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">xG (Expected Goals)</span>
                          <span className="font-semibold" data-testid="text-away-xg">
                            {prediction.advancedStats?.away.xG?.toFixed(2) || 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">xPTS (Expected Points)</span>
                          <span className="font-semibold" data-testid="text-away-xpts">
                            {prediction.advancedStats?.away.xPTS?.toFixed(1) || 'N/A'}
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Match Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">League</span>
                    <span className="font-semibold" data-testid="text-league-info">
                      {prediction.leagueInfo?.displayName || prediction.league}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Competition Type</span>
                    <span className="font-semibold" data-testid="text-league-type">
                      {prediction.leagueInfo?.type || 'League'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Popularity</span>
                    <Badge variant={prediction.leagueInfo?.popularity === 'High' ? 'default' : 'secondary'} data-testid="badge-popularity">
                      {prediction.leagueInfo?.popularity || 'Medium'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* PREDICTION TAB */}
            <TabsContent value="prediction" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Best Betting Opportunity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold" data-testid="text-best-market">
                          {prediction.primaryMarket?.selection || prediction.betType}
                        </span>
                        <Badge className="bg-green-600" data-testid="badge-best-odds">
                          {prediction.primaryMarket?.odds.toFixed(2) || prediction.bestOdds.toFixed(2)}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-gray-600">Model Probability</div>
                          <div className="font-semibold" data-testid="text-model-prob">
                            {prediction.calculatedProbability.ensembleAverage.toFixed(1)}%
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-600">Market Probability</div>
                          <div className="font-semibold" data-testid="text-market-prob">
                            {(prediction.calculatedProbability.marketImplied || prediction.impliedProbability).toFixed(1)}%
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-600">Edge</div>
                          <div className="font-semibold text-green-600" data-testid="text-edge">
                            +{prediction.edge.toFixed(1)}%
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-600">Confidence</div>
                          <div className="font-semibold" data-testid="text-confidence">
                            {prediction.confidenceScore}/100
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold">Probability Breakdown</h4>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Raw Model Probability</span>
                            <span data-testid="text-raw-prob">{(prediction.calculatedProbability.rawUncapped || prediction.calculatedProbability.ensembleAverage).toFixed(1)}%</span>
                          </div>
                          <Progress value={prediction.calculatedProbability.rawUncapped || prediction.calculatedProbability.ensembleAverage} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Conservative Model (Capped)</span>
                            <span data-testid="text-conservative-prob">{prediction.calculatedProbability.ensembleAverage.toFixed(1)}%</span>
                          </div>
                          <Progress value={prediction.calculatedProbability.ensembleAverage} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Market Implied Probability</span>
                            <span data-testid="text-implied-prob">{(prediction.calculatedProbability.marketImplied || prediction.impliedProbability).toFixed(1)}%</span>
                          </div>
                          <Progress value={prediction.calculatedProbability.marketImplied || prediction.impliedProbability} className="h-2" />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* All Available Markets */}
              {prediction.markets && prediction.markets.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">All Available Markets ({prediction.markets.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead data-testid="header-market">Market</TableHead>
                          <TableHead data-testid="header-selection">Selection</TableHead>
                          <TableHead data-testid="header-odds">Odds</TableHead>
                          <TableHead data-testid="header-probability">Probability</TableHead>
                          <TableHead data-testid="header-market-edge">Edge</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {prediction.markets.slice(0, 10).map((market, index) => (
                          <TableRow key={index} data-testid={`row-market-${index}`}>
                            <TableCell data-testid={`cell-market-type-${index}`}>
                              {market.category}
                            </TableCell>
                            <TableCell data-testid={`cell-selection-${index}`}>{market.selection}</TableCell>
                            <TableCell data-testid={`cell-odds-${index}`}>{market.odds.toFixed(2)}</TableCell>
                            <TableCell data-testid={`cell-calc-prob-${index}`}>
                              {market.calculatedProbability.ensembleAverage.toFixed(1)}%
                            </TableCell>
                            <TableCell data-testid={`cell-edge-${index}`}>
                              <span className={market.edge > 0 ? 'text-green-600' : 'text-red-600'}>
                                {market.edge > 0 ? '+' : ''}{market.edge.toFixed(1)}%
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* STATS TAB - Advanced Statistics */}
            <TabsContent value="stats" className="space-y-4">
              {hasAdvancedStats ? (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        Advanced Statistics Comparison
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead data-testid="header-stat">Statistic</TableHead>
                            <TableHead className="text-right" data-testid="header-home">{prediction.teams.home}</TableHead>
                            <TableHead className="text-right" data-testid="header-away">{prediction.teams.away}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium" data-testid="row-xg">xG (Expected Goals)</TableCell>
                            <TableCell className="text-right font-semibold" data-testid="stat-home-xg">
                              {prediction.advancedStats?.home.xG?.toFixed(2) || 'N/A'}
                            </TableCell>
                            <TableCell className="text-right font-semibold" data-testid="stat-away-xg">
                              {prediction.advancedStats?.away.xG?.toFixed(2) || 'N/A'}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium" data-testid="row-xga">xGA (Expected Goals Against)</TableCell>
                            <TableCell className="text-right font-semibold" data-testid="stat-home-xga">
                              {prediction.advancedStats?.home.xGA?.toFixed(2) || 'N/A'}
                            </TableCell>
                            <TableCell className="text-right font-semibold" data-testid="stat-away-xga">
                              {prediction.advancedStats?.away.xGA?.toFixed(2) || 'N/A'}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium" data-testid="row-xa">xA (Expected Assists)</TableCell>
                            <TableCell className="text-right font-semibold" data-testid="stat-home-xa">
                              {prediction.advancedStats?.home.xA?.toFixed(2) || 'N/A'}
                            </TableCell>
                            <TableCell className="text-right font-semibold" data-testid="stat-away-xa">
                              {prediction.advancedStats?.away.xA?.toFixed(2) || 'N/A'}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium" data-testid="row-xpts">xPTS (Expected Points)</TableCell>
                            <TableCell className="text-right font-semibold" data-testid="stat-home-xpts">
                              {prediction.advancedStats?.home.xPTS?.toFixed(1) || 'N/A'}
                            </TableCell>
                            <TableCell className="text-right font-semibold" data-testid="stat-away-xpts">
                              {prediction.advancedStats?.away.xPTS?.toFixed(1) || 'N/A'}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium" data-testid="row-shots">Shots</TableCell>
                            <TableCell className="text-right" data-testid="stat-home-shots">
                              {prediction.advancedStats?.home.shots || 'N/A'}
                            </TableCell>
                            <TableCell className="text-right" data-testid="stat-away-shots">
                              {prediction.advancedStats?.away.shots || 'N/A'}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium" data-testid="row-shots-on-target">Shots on Target</TableCell>
                            <TableCell className="text-right" data-testid="stat-home-sot">
                              {prediction.advancedStats?.home.shotsOnTarget || 'N/A'}
                            </TableCell>
                            <TableCell className="text-right" data-testid="stat-away-sot">
                              {prediction.advancedStats?.away.shotsOnTarget || 'N/A'}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium" data-testid="row-possession">Possession %</TableCell>
                            <TableCell className="text-right" data-testid="stat-home-poss">
                              {prediction.advancedStats?.home.possession ? `${prediction.advancedStats.home.possession}%` : 'N/A'}
                            </TableCell>
                            <TableCell className="text-right" data-testid="stat-away-poss">
                              {prediction.advancedStats?.away.possession ? `${prediction.advancedStats.away.possession}%` : 'N/A'}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center text-gray-500">
                    Advanced statistics will be calculated once match data is available from FBref, Sofascore, and other sources.
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* H2H TAB - Head to Head */}
            <TabsContent value="h2h" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Head-to-Head History</CardTitle>
                  <CardDescription>Recent meetings between these teams</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center text-gray-500 py-8">
                    H2H data will be scraped from Flashscore, ESPN, and other sources for this fixture.
                    Feature coming in next update.
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* FORM TAB - Standings & Form */}
            <TabsContent value="form" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Trophy className="w-4 h-4" />
                    League Standings & Team Form
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center text-gray-500 py-8">
                    League table and recent form will be displayed here using data from Sports-Reference.com and other sources.
                    Feature coming in next update.
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ODDS TAB - Bookmaker Comparison */}
            <TabsContent value="odds" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Bookmaker Odds Comparison
                  </CardTitle>
                  <CardDescription>Compare odds from 5+ major bookmakers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="font-semibold">Main Market: {prediction.primaryMarket?.selection || prediction.betType}</div>
                    
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead data-testid="header-bookmaker">Bookmaker</TableHead>
                          <TableHead data-testid="header-bm-odds">Odds</TableHead>
                          <TableHead data-testid="header-implied">Implied Prob.</TableHead>
                          <TableHead data-testid="header-margin">Margin</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow data-testid="row-bookmaker-0">
                          <TableCell data-testid="cell-bm-name-0">{prediction.bookmaker}</TableCell>
                          <TableCell className="font-semibold" data-testid="cell-bm-odds-0">
                            {prediction.bestOdds.toFixed(2)}
                          </TableCell>
                          <TableCell data-testid="cell-bm-implied-0">
                            {((1 / prediction.bestOdds) * 100).toFixed(1)}%
                          </TableCell>
                          <TableCell data-testid="cell-bm-margin-0">Standard</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                    
                    <div className="text-sm text-gray-500 mt-4">
                      Additional bookmaker data from Oddsportal, BetExplorer, and other sources will be displayed here.
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
