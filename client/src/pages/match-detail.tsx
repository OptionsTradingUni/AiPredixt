import { useQuery } from '@tanstack/react-query';
import { useParams, useLocation, Link } from 'wouter';
import { MatchDetail, H2HMatch, StandingsEntry, TeamForm } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Trophy, Clock, MapPin, Users, TrendingUp, TrendingDown, Minus, AlertCircle, Target, BarChart3, Calendar } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

export default function MatchDetailPage() {
  const params = useParams();
  const [, navigate] = useLocation();
  const gameId = params.id;

  const { data: match, isLoading, error, refetch } = useQuery<MatchDetail>({
    queryKey: ['/api/games', gameId],
    queryFn: async () => {
      const response = await fetch(`/api/games/${gameId}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        const error = new Error(errorData.error || 'Failed to fetch match details');
        (error as any).status = response.status;
        throw error;
      }
      return response.json();
    },
    enabled: !!gameId,
    retry: (failureCount, error: any) => {
      if (error?.status === 404) return false;
      return failureCount < 2;
    },
  });

  // Fetch H2H data
  const { data: h2hData, isLoading: h2hLoading, error: h2hError } = useQuery({
    queryKey: ['/api/h2h', match?.teams.home, match?.teams.away, match?.sport],
    queryFn: async () => {
      if (!match) return null;
      const params = new URLSearchParams({
        teamA: match.teams.home,
        teamB: match.teams.away,
        sport: match.sport,
      });
      const response = await fetch(`/api/h2h?${params}`);
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!match,
    retry: 1,
  });

  // Fetch standings
  const { data: standingsData, isLoading: standingsLoading, error: standingsError } = useQuery({
    queryKey: ['/api/standings', match?.league],
    queryFn: async () => {
      if (!match) return null;
      const params = new URLSearchParams({
        league: match.league,
        season: '2024/25',
      });
      const response = await fetch(`/api/standings?${params}`);
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!match,
    retry: 1,
  });

  // Fetch team form
  const { data: homeForm, isLoading: homeFormLoading, error: homeFormError } = useQuery({
    queryKey: ['/api/team-form', match?.teams.home],
    queryFn: async () => {
      if (!match) return null;
      const params = new URLSearchParams({
        team: match.teams.home,
        matches: '5',
      });
      const response = await fetch(`/api/team-form?${params}`);
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!match,
    retry: 1,
  });

  const { data: awayForm, isLoading: awayFormLoading, error: awayFormError } = useQuery({
    queryKey: ['/api/team-form', match?.teams.away],
    queryFn: async () => {
      if (!match) return null;
      const params = new URLSearchParams({
        team: match.teams.away,
        matches: '5',
      });
      const response = await fetch(`/api/team-form?${params}`);
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!match,
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading match details...</p>
        </div>
      </div>
    );
  }

  if (error || (!isLoading && !match)) {
    const errorStatus = (error as any)?.status;
    const isNotFound = errorStatus === 404;
    const isServerError = errorStatus === 500;
    
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <AlertCircle className="h-16 w-16 text-muted-foreground" />
              </div>
              
              <div>
                <h2 className="text-2xl font-bold mb-2" data-testid="text-error-title">
                  {isNotFound ? 'Match Not Found' : isServerError ? 'Server Error' : 'Unable to Load Match'}
                </h2>
                <p className="text-muted-foreground mb-4" data-testid="text-error-message">
                  {isNotFound ? (
                    <>The match you're looking for doesn't exist or may have been removed.</>
                  ) : isServerError ? (
                    <>Our server encountered an error while fetching match data. Some data sources may be temporarily unavailable. Please try again in a moment.</>
                  ) : (
                    <>We're having trouble loading this match. This could be due to network issues or temporary unavailability of data sources.</>
                  )}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {!isNotFound && (
                  <Button onClick={() => refetch()} variant="default" data-testid="button-retry">
                    Try Again
                  </Button>
                )}
                <Button onClick={() => navigate('/')} variant={isNotFound ? "default" : "outline"} data-testid="button-back">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Button>
              </div>

              {!isNotFound && (
                <div className="text-xs text-muted-foreground mt-4 p-3 bg-muted/50 dark:bg-muted/30 rounded">
                  <p className="font-semibold mb-1">Why am I seeing this?</p>
                  <p>We gather data from multiple sources. If all sources are temporarily unavailable or rate-limited, matches may not load. This usually resolves within a few minutes.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!match) {
    return null;
  }

  const getStatusBadge = () => {
    if (match.status === 'live') {
      return <Badge variant="destructive" className="animate-pulse">● LIVE</Badge>;
    }
    if (match.status === 'finished') {
      return <Badge variant="secondary">Full Time</Badge>;
    }
    return <Badge variant="outline">Upcoming</Badge>;
  };

  const getFormIcon = (result: 'W' | 'D' | 'L') => {
    if (result === 'W') return <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400" />;
    if (result === 'L') return <TrendingDown className="h-3 w-3 text-red-600 dark:text-red-400" />;
    return <Minus className="h-3 w-3 text-gray-600 dark:text-gray-400" />;
  };

  const renderFormBadge = (result: 'W' | 'D' | 'L') => {
    const colors = {
      W: 'bg-green-600 dark:bg-green-500 text-white',
      D: 'bg-gray-500 dark:bg-gray-400 text-white',
      L: 'bg-red-600 dark:bg-red-500 text-white',
    };
    return (
      <div className={`w-6 h-6 rounded-sm flex items-center justify-center text-xs font-bold ${colors[result]}`}>
        {result}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="w-full px-4 md:px-6">
          <div className="flex items-center justify-between h-14 md:h-16">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="sm" data-testid="button-back">
                  <ArrowLeft className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Back</span>
                </Button>
              </Link>
              <div>
                <h1 className="text-base md:text-lg font-bold">Match Analysis</h1>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="w-full px-4 md:px-6 py-6 max-w-7xl mx-auto space-y-6">
        {/* Match Header */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {getStatusBadge()}
              <Badge variant="outline">{match.sport}</Badge>
              <Badge variant="outline">{match.league}</Badge>
            </div>
            <div className="grid md:grid-cols-3 gap-6 items-center">
              {/* Home Team */}
              <div className="text-center md:text-right">
                <h2 className="text-2xl md:text-3xl font-bold mb-2" data-testid="text-home-team">
                  {match.teams.home}
                </h2>
                {match.odds.home && (
                  <div className="text-muted-foreground">
                    Odds: <span className="font-mono font-semibold text-foreground">{match.odds.home.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* Score/VS */}
              <div className="text-center">
                {match.currentScore ? (
                  <div className="text-5xl font-bold font-mono">
                    {match.currentScore.home} - {match.currentScore.away}
                  </div>
                ) : (
                  <div className="text-2xl text-muted-foreground font-semibold">VS</div>
                )}
              </div>

              {/* Away Team */}
              <div className="text-center md:text-left">
                <h2 className="text-2xl md:text-3xl font-bold mb-2" data-testid="text-away-team">
                  {match.teams.away}
                </h2>
                {match.odds.away && (
                  <div className="text-muted-foreground">
                    Odds: <span className="font-mono font-semibold text-foreground">{match.odds.away.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>

            <Separator className="my-4" />

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{match.date} • {match.time}</span>
              </div>
              {match.venue && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{match.venue}</span>
                </div>
              )}
              {match.referee && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>Ref: {match.referee}</span>
                </div>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 gap-1">
            <TabsTrigger value="overview" className="text-xs md:text-sm" data-testid="tab-overview">Overview</TabsTrigger>
            <TabsTrigger value="prediction" className="text-xs md:text-sm" data-testid="tab-prediction">AI Prediction</TabsTrigger>
            <TabsTrigger value="h2h" className="text-xs md:text-sm" data-testid="tab-h2h">H2H</TabsTrigger>
            <TabsTrigger value="standings" className="text-xs md:text-sm" data-testid="tab-standings">Standings</TabsTrigger>
            <TabsTrigger value="stats" className="text-xs md:text-sm" data-testid="tab-stats">Stats</TabsTrigger>
            <TabsTrigger value="odds" className="text-xs md:text-sm" data-testid="tab-odds">Odds</TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Home Team Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {match.teams.home}
                    <Badge variant="outline" className="text-xs">Home</Badge>
                  </CardTitle>
                  <CardDescription>Team Statistics & Form</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Match Odds</span>
                      <span className="font-mono font-semibold text-lg" data-testid="text-home-odds">
                        {match.odds.home?.toFixed(2) || 'N/A'}
                      </span>
                    </div>
                    
                    {match.prediction?.advancedStats?.home && (
                      <>
                        <Separator />
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold">Advanced Metrics</h4>
                          {match.prediction.advancedStats.home.xG !== undefined && (
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">xG (Expected Goals)</span>
                              <span className="font-semibold">{match.prediction.advancedStats.home.xG.toFixed(2)}</span>
                            </div>
                          )}
                          {match.prediction.advancedStats.home.xPTS !== undefined && (
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">xPTS (Expected Points)</span>
                              <span className="font-semibold">{match.prediction.advancedStats.home.xPTS.toFixed(1)}</span>
                            </div>
                          )}
                          {match.prediction.advancedStats.home.possession !== undefined && (
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Possession</span>
                              <span className="font-semibold">{match.prediction.advancedStats.home.possession}%</span>
                            </div>
                          )}
                          {match.prediction.advancedStats.home.shots !== undefined && (
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Shots per Game</span>
                              <span className="font-semibold">{match.prediction.advancedStats.home.shots}</span>
                            </div>
                          )}
                          {match.prediction.advancedStats.home.shotsOnTarget !== undefined && (
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Shots on Target</span>
                              <span className="font-semibold">{match.prediction.advancedStats.home.shotsOnTarget}</span>
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    {homeForm && homeForm.form && (
                      <>
                        <Separator />
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold">Recent Form</h4>
                          <div className="flex gap-1">
                            {homeForm.form.split('').reverse().map((result: string, i: number) => (
                              <div key={i}>{renderFormBadge(result as 'W' | 'D' | 'L')}</div>
                            ))}
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-xs text-center mt-2">
                            <div className="bg-muted/50 dark:bg-muted/30 p-2 rounded">
                              <div className="font-semibold text-green-600 dark:text-green-400">{homeForm.wins}W</div>
                            </div>
                            <div className="bg-muted/50 dark:bg-muted/30 p-2 rounded">
                              <div className="font-semibold text-gray-600 dark:text-gray-400">{homeForm.draws}D</div>
                            </div>
                            <div className="bg-muted/50 dark:bg-muted/30 p-2 rounded">
                              <div className="font-semibold text-red-600 dark:text-red-400">{homeForm.losses}L</div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Away Team Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {match.teams.away}
                    <Badge variant="outline" className="text-xs">Away</Badge>
                  </CardTitle>
                  <CardDescription>Team Statistics & Form</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Match Odds</span>
                      <span className="font-mono font-semibold text-lg" data-testid="text-away-odds">
                        {match.odds.away?.toFixed(2) || 'N/A'}
                      </span>
                    </div>
                    
                    {match.prediction?.advancedStats?.away && (
                      <>
                        <Separator />
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold">Advanced Metrics</h4>
                          {match.prediction.advancedStats.away.xG !== undefined && (
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">xG (Expected Goals)</span>
                              <span className="font-semibold">{match.prediction.advancedStats.away.xG.toFixed(2)}</span>
                            </div>
                          )}
                          {match.prediction.advancedStats.away.xPTS !== undefined && (
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">xPTS (Expected Points)</span>
                              <span className="font-semibold">{match.prediction.advancedStats.away.xPTS.toFixed(1)}</span>
                            </div>
                          )}
                          {match.prediction.advancedStats.away.possession !== undefined && (
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Possession</span>
                              <span className="font-semibold">{match.prediction.advancedStats.away.possession}%</span>
                            </div>
                          )}
                          {match.prediction.advancedStats.away.shots !== undefined && (
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Shots per Game</span>
                              <span className="font-semibold">{match.prediction.advancedStats.away.shots}</span>
                            </div>
                          )}
                          {match.prediction.advancedStats.away.shotsOnTarget !== undefined && (
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Shots on Target</span>
                              <span className="font-semibold">{match.prediction.advancedStats.away.shotsOnTarget}</span>
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    {awayForm && awayForm.form && (
                      <>
                        <Separator />
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold">Recent Form</h4>
                          <div className="flex gap-1">
                            {awayForm.form.split('').reverse().map((result: string, i: number) => (
                              <div key={i}>{renderFormBadge(result as 'W' | 'D' | 'L')}</div>
                            ))}
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-xs text-center mt-2">
                            <div className="bg-muted/50 dark:bg-muted/30 p-2 rounded">
                              <div className="font-semibold text-green-600 dark:text-green-400">{awayForm.wins}W</div>
                            </div>
                            <div className="bg-muted/50 dark:bg-muted/30 p-2 rounded">
                              <div className="font-semibold text-gray-600 dark:text-gray-400">{awayForm.draws}D</div>
                            </div>
                            <div className="bg-muted/50 dark:bg-muted/30 p-2 rounded">
                              <div className="font-semibold text-red-600 dark:text-red-400">{awayForm.losses}L</div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Draw Odds */}
            {match.odds.draw && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-2">Draw</div>
                    <div className="text-3xl font-mono font-bold">{match.odds.draw.toFixed(2)}</div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* AI PREDICTION TAB */}
          <TabsContent value="prediction" className="space-y-6">
            {match.prediction ? (
              <>
                {/* Main Prediction Card */}
                <Card className="border-primary/50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="h-5 w-5 text-primary" />
                          AI Prediction Analysis
                        </CardTitle>
                        <CardDescription>Comprehensive betting recommendation based on advanced analytics</CardDescription>
                      </div>
                      <Badge className="text-lg px-4 py-2">
                        {Math.round(match.prediction.confidenceScore)}% Confidence
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Primary Recommendation */}
                    <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-4">Recommended Bet</h3>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Bet Type</div>
                          <div className="text-xl font-bold">{match.prediction.betType}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Best Odds</div>
                          <div className="text-xl font-bold font-mono text-primary">{match.prediction.bestOdds.toFixed(2)}</div>
                          <div className="text-xs text-muted-foreground">{match.prediction.bookmaker}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Expected Value</div>
                          <div className="text-xl font-bold text-green-600 dark:text-green-400">+{match.prediction.edge.toFixed(1)}%</div>
                        </div>
                      </div>
                      <Separator className="my-4" />
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">Recommended Stake</div>
                        <div className="text-lg font-semibold">{match.prediction.recommendedStake.kellyFraction}</div>
                        <div className="text-xs text-muted-foreground">{match.prediction.recommendedStake.unitDescription}</div>
                        <div className="text-sm">Bankroll: {match.prediction.recommendedStake.percentageOfBankroll.toFixed(1)}%</div>
                      </div>
                    </div>

                    {/* Analysis Summary */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Analysis Summary
                      </h3>
                      <div className="prose dark:prose-invert max-w-none">
                        <p className="text-muted-foreground">{match.prediction.justification.summary}</p>
                      </div>
                      
                      {match.prediction.justification.deepDive && match.prediction.justification.deepDive.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-sm font-semibold">Deep Dive Analysis</h4>
                          <ul className="space-y-2">
                            {match.prediction.justification.deepDive.map((point, i) => (
                              <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                                <span className="text-primary mt-1">•</span>
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {match.prediction.justification.competitiveEdge && match.prediction.justification.competitiveEdge.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-sm font-semibold">Competitive Edge</h4>
                          <ul className="space-y-2">
                            {match.prediction.justification.competitiveEdge.map((point, i) => (
                              <li key={i} className="flex gap-2 text-sm text-green-700 dark:text-green-400">
                                <span className="mt-1">✓</span>
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Risk Assessment */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        Risk Assessment
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-muted/50 dark:bg-muted/30 p-4 rounded-lg">
                          <div className="text-sm text-muted-foreground mb-1">Value at Risk (VaR)</div>
                          <div className="text-lg font-semibold">{match.prediction.riskAssessment.var.toFixed(2)} units</div>
                        </div>
                        <div className="bg-muted/50 dark:bg-muted/30 p-4 rounded-lg">
                          <div className="text-sm text-muted-foreground mb-1">Conditional VaR (CVaR)</div>
                          <div className="text-lg font-semibold">{match.prediction.riskAssessment.cvar.toFixed(2)} units</div>
                        </div>
                      </div>
                      
                      {match.prediction.riskAssessment.keyRisks && match.prediction.riskAssessment.keyRisks.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold">Key Risks</h4>
                          <ul className="space-y-1">
                            {match.prediction.riskAssessment.keyRisks.map((risk, i) => (
                              <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                                <span className="text-orange-600 dark:text-orange-400 mt-1">⚠</span>
                                <span>{risk}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Probability Analysis */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Probability Analysis</h3>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm text-muted-foreground">Calculated Probability</span>
                            <span className="font-semibold">{match.prediction.calculatedProbability.ensembleAverage.toFixed(1)}%</span>
                          </div>
                          <Progress value={match.prediction.calculatedProbability.ensembleAverage} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm text-muted-foreground">Market Implied Probability</span>
                            <span className="font-semibold">{match.prediction.impliedProbability.toFixed(1)}%</span>
                          </div>
                          <Progress value={match.prediction.impliedProbability} className="h-2" />
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">
                          Range: {match.prediction.calculatedProbability.calibratedRange.lower.toFixed(1)}% - {match.prediction.calculatedProbability.calibratedRange.upper.toFixed(1)}%
                        </div>
                      </div>
                    </div>

                    {/* Latest News & Insights */}
                    {match.prediction.justification.detailedNews && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Latest News & Insights</h3>
                        <div className="space-y-4">
                          {match.prediction.justification.detailedNews.homeTeam && match.prediction.justification.detailedNews.homeTeam.length > 0 && (
                            <div>
                              <h4 className="text-sm font-semibold mb-2">{match.teams.home}</h4>
                              <div className="space-y-2">
                                {match.prediction.justification.detailedNews.homeTeam.map((news, i) => (
                                  <div key={i} className="border border-border rounded-lg p-3 bg-card">
                                    <div className="flex items-start gap-2">
                                      <Badge variant={news.sentiment === 'positive' ? 'default' : news.sentiment === 'negative' ? 'destructive' : 'outline'} className="text-xs">
                                        {news.sentiment}
                                      </Badge>
                                      <div className="flex-1">
                                        <div className="font-medium text-sm mb-1">{news.headline}</div>
                                        <div className="text-xs text-muted-foreground mb-2">{news.source}</div>
                                        <div className="text-sm text-muted-foreground">{news.summary}</div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {match.prediction.justification.detailedNews.awayTeam && match.prediction.justification.detailedNews.awayTeam.length > 0 && (
                            <div>
                              <h4 className="text-sm font-semibold mb-2">{match.teams.away}</h4>
                              <div className="space-y-2">
                                {match.prediction.justification.detailedNews.awayTeam.map((news, i) => (
                                  <div key={i} className="border border-border rounded-lg p-3 bg-card">
                                    <div className="flex items-start gap-2">
                                      <Badge variant={news.sentiment === 'positive' ? 'default' : news.sentiment === 'negative' ? 'destructive' : 'outline'} className="text-xs">
                                        {news.sentiment}
                                      </Badge>
                                      <div className="flex-1">
                                        <div className="font-medium text-sm mb-1">{news.headline}</div>
                                        <div className="text-xs text-muted-foreground mb-2">{news.source}</div>
                                        <div className="text-sm text-muted-foreground">{news.summary}</div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Contingency Pick */}
                    {match.prediction.contingencyPick && (
                      <div className="border-t border-border pt-4">
                        <h3 className="text-lg font-semibold mb-3">Contingency Pick</h3>
                        <div className="bg-muted/50 dark:bg-muted/30 p-4 rounded-lg">
                          <div className="grid md:grid-cols-4 gap-3">
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">Match</div>
                              <div className="text-sm font-semibold">{match.prediction.contingencyPick.match}</div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">Bet Type</div>
                              <div className="text-sm font-semibold">{match.prediction.contingencyPick.betType}</div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">Odds</div>
                              <div className="text-sm font-semibold font-mono">{match.prediction.contingencyPick.odds.toFixed(2)}</div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">Confidence</div>
                              <div className="text-sm font-semibold">{match.prediction.contingencyPick.confidenceScore}%</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* All Available Markets */}
                {match.prediction.markets && match.prediction.markets.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>All Available Markets</CardTitle>
                      <CardDescription>Alternative betting opportunities for this match</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {match.prediction.markets.map((market, i) => (
                          <div key={i} className="border border-border rounded-lg p-4 hover:bg-muted/50 dark:hover:bg-muted/30 transition-colors">
                            <div className="grid md:grid-cols-5 gap-3">
                              <div>
                                <div className="text-xs text-muted-foreground mb-1">Market</div>
                                <div className="text-sm font-semibold capitalize">{market.category.replace('_', ' ')}</div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground mb-1">Selection</div>
                                <div className="text-sm font-semibold">{market.selection}</div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground mb-1">Odds</div>
                                <div className="text-sm font-semibold font-mono">{market.odds.toFixed(2)}</div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground mb-1">Edge</div>
                                <div className={`text-sm font-semibold ${market.edge > 0 ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                                  {market.edge > 0 ? '+' : ''}{market.edge.toFixed(1)}%
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground mb-1">Confidence</div>
                                <div className="text-sm font-semibold">{market.confidenceScore}%</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No AI prediction available for this match yet.</p>
                  <p className="text-sm text-muted-foreground mt-2">Check back closer to match time.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* HEAD TO HEAD TAB */}
          <TabsContent value="h2h" className="space-y-6">
            {h2hLoading ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading head-to-head data...</p>
                </CardContent>
              </Card>
            ) : h2hError || !h2hData ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Head-to-head data temporarily unavailable</p>
                  <p className="text-sm text-muted-foreground mt-2">Data sources may be rate-limited. Try again later.</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Head to Head History</CardTitle>
                  <CardDescription>Recent encounters between {match.teams.home} and {match.teams.away}</CardDescription>
                </CardHeader>
                <CardContent>
                  {h2hData.matches && h2hData.matches.length > 0 ? (
                    <div className="space-y-3">
                      {h2hData.matches.map((h2hMatch: H2HMatch, i: number) => (
                        <div key={i} className="border border-border rounded-lg p-4 hover:bg-muted/50 dark:hover:bg-muted/30 transition-colors">
                          <div className="grid md:grid-cols-4 gap-3">
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">Date</div>
                              <div className="text-sm font-semibold flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {h2hMatch.date}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">Match</div>
                              <div className="text-sm font-semibold">{h2hMatch.homeTeam} vs {h2hMatch.awayTeam}</div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">Score</div>
                              <div className="text-sm font-mono font-bold">{h2hMatch.score}</div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">Competition</div>
                              <div className="text-sm">{h2hMatch.competition}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No previous encounters found
                    </div>
                  )}
                  
                  {h2hData.summary && (
                    <>
                      <Separator className="my-6" />
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-muted/50 dark:bg-muted/30 rounded-lg">
                          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{h2hData.summary.homeWins || 0}</div>
                          <div className="text-sm text-muted-foreground">Home Wins</div>
                        </div>
                        <div className="text-center p-4 bg-muted/50 dark:bg-muted/30 rounded-lg">
                          <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{h2hData.summary.draws || 0}</div>
                          <div className="text-sm text-muted-foreground">Draws</div>
                        </div>
                        <div className="text-center p-4 bg-muted/50 dark:bg-muted/30 rounded-lg">
                          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{h2hData.summary.awayWins || 0}</div>
                          <div className="text-sm text-muted-foreground">Away Wins</div>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* STANDINGS TAB */}
          <TabsContent value="standings" className="space-y-6">
            {standingsLoading ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading league standings...</p>
                </CardContent>
              </Card>
            ) : standingsError || !standingsData ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">League standings temporarily unavailable</p>
                  <p className="text-sm text-muted-foreground mt-2">Data sources may be rate-limited. Try again later.</p>
                </CardContent>
              </Card>
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>League Standings</CardTitle>
                    <CardDescription>{match.league} - Current Table</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {standingsData.standings && standingsData.standings.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="border-b border-border">
                            <tr className="text-left">
                              <th className="p-2 font-semibold">#</th>
                              <th className="p-2 font-semibold">Team</th>
                              <th className="p-2 font-semibold text-center">P</th>
                              <th className="p-2 font-semibold text-center">W</th>
                              <th className="p-2 font-semibold text-center">D</th>
                              <th className="p-2 font-semibold text-center">L</th>
                              <th className="p-2 font-semibold text-center">GF</th>
                              <th className="p-2 font-semibold text-center">GA</th>
                              <th className="p-2 font-semibold text-center">GD</th>
                              <th className="p-2 font-semibold text-center">Pts</th>
                            </tr>
                          </thead>
                          <tbody>
                            {standingsData.standings.map((entry: StandingsEntry, i: number) => {
                              const isHomeTeam = entry.team === match.teams.home;
                              const isAwayTeam = entry.team === match.teams.away;
                              const highlight = isHomeTeam || isAwayTeam;
                              
                              return (
                                <tr key={i} className={`border-b border-border ${highlight ? 'bg-primary/10 dark:bg-primary/5 font-semibold' : ''} hover:bg-muted/50 dark:hover:bg-muted/30 transition-colors`}>
                                  <td className="p-2">{entry.position}</td>
                                  <td className="p-2">
                                    <div className="flex items-center gap-2">
                                      {entry.team}
                                      {isHomeTeam && <Badge variant="outline" className="text-xs">H</Badge>}
                                      {isAwayTeam && <Badge variant="outline" className="text-xs">A</Badge>}
                                    </div>
                                  </td>
                                  <td className="p-2 text-center">{entry.played}</td>
                                  <td className="p-2 text-center">{entry.won}</td>
                                  <td className="p-2 text-center">{entry.drawn}</td>
                                  <td className="p-2 text-center">{entry.lost}</td>
                                  <td className="p-2 text-center">{entry.goalsFor}</td>
                                  <td className="p-2 text-center">{entry.goalsAgainst}</td>
                                  <td className={`p-2 text-center ${entry.goalDifference > 0 ? 'text-green-600 dark:text-green-400' : entry.goalDifference < 0 ? 'text-red-600 dark:text-red-400' : ''}`}>
                                    {entry.goalDifference > 0 ? '+' : ''}{entry.goalDifference}
                                  </td>
                                  <td className="p-2 text-center font-bold">{entry.points}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No standings data available
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Team Form */}
                <div className="grid md:grid-cols-2 gap-6">
                  {homeFormLoading ? (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-sm text-muted-foreground">Loading form data...</p>
                      </CardContent>
                    </Card>
                  ) : homeFormError || !homeForm?.form ? (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground mb-4" />
                        <p className="text-sm text-muted-foreground">Team form data unavailable</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">{match.teams.home} - Recent Form</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex gap-1 mb-4">
                          {homeForm.form.split('').reverse().map((result: string, i: number) => (
                            <div key={i}>{renderFormBadge(result as 'W' | 'D' | 'L')}</div>
                          ))}
                        </div>
                        {homeForm.lastMatches && homeForm.lastMatches.length > 0 && (
                          <div className="space-y-2">
                            {homeForm.lastMatches.map((m: any, i: number) => (
                              <div key={i} className="flex items-center justify-between text-sm border-b border-border pb-2">
                                <div className="flex items-center gap-2">
                                  {getFormIcon(m.result)}
                                  <span>{m.opponent}</span>
                                </div>
                                <span className="font-mono">{m.score}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {awayFormLoading ? (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-sm text-muted-foreground">Loading form data...</p>
                      </CardContent>
                    </Card>
                  ) : awayFormError || !awayForm?.form ? (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground mb-4" />
                        <p className="text-sm text-muted-foreground">Team form data unavailable</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">{match.teams.away} - Recent Form</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex gap-1 mb-4">
                          {awayForm.form.split('').reverse().map((result: string, i: number) => (
                            <div key={i}>{renderFormBadge(result as 'W' | 'D' | 'L')}</div>
                          ))}
                        </div>
                        {awayForm.lastMatches && awayForm.lastMatches.length > 0 && (
                          <div className="space-y-2">
                            {awayForm.lastMatches.map((m: any, i: number) => (
                              <div key={i} className="flex items-center justify-between text-sm border-b border-border pb-2">
                                <div className="flex items-center gap-2">
                                  {getFormIcon(m.result)}
                                  <span>{m.opponent}</span>
                                </div>
                                <span className="font-mono">{m.score}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </>
            )}
          </TabsContent>

          {/* ADVANCED STATS TAB */}
          <TabsContent value="stats" className="space-y-6">
            {match.prediction?.advancedStats ? (
              <div className="grid md:grid-cols-2 gap-6">
                {/* Home Team Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle>{match.teams.home}</CardTitle>
                    <CardDescription>Advanced Performance Metrics</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {match.prediction.advancedStats.home.xG !== undefined && (
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm">Expected Goals (xG)</span>
                          <span className="font-semibold">{match.prediction.advancedStats.home.xG.toFixed(2)}</span>
                        </div>
                        <Progress value={(match.prediction.advancedStats.home.xG / 3) * 100} className="h-2" />
                      </div>
                    )}
                    {match.prediction.advancedStats.home.xGA !== undefined && (
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm">Expected Goals Against (xGA)</span>
                          <span className="font-semibold">{match.prediction.advancedStats.home.xGA.toFixed(2)}</span>
                        </div>
                        <Progress value={(match.prediction.advancedStats.home.xGA / 3) * 100} className="h-2" />
                      </div>
                    )}
                    {match.prediction.advancedStats.home.xPTS !== undefined && (
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm">Expected Points (xPTS)</span>
                          <span className="font-semibold">{match.prediction.advancedStats.home.xPTS.toFixed(1)}</span>
                        </div>
                        <Progress value={(match.prediction.advancedStats.home.xPTS / 3) * 100} className="h-2" />
                      </div>
                    )}
                    {match.prediction.advancedStats.home.possession !== undefined && (
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm">Possession</span>
                          <span className="font-semibold">{match.prediction.advancedStats.home.possession}%</span>
                        </div>
                        <Progress value={match.prediction.advancedStats.home.possession} className="h-2" />
                      </div>
                    )}
                    
                    <Separator />
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {match.prediction.advancedStats.home.shots !== undefined && (
                        <div className="text-center p-3 bg-muted/50 dark:bg-muted/30 rounded-lg">
                          <div className="text-2xl font-bold">{match.prediction.advancedStats.home.shots}</div>
                          <div className="text-muted-foreground">Shots</div>
                        </div>
                      )}
                      {match.prediction.advancedStats.home.shotsOnTarget !== undefined && (
                        <div className="text-center p-3 bg-muted/50 dark:bg-muted/30 rounded-lg">
                          <div className="text-2xl font-bold">{match.prediction.advancedStats.home.shotsOnTarget}</div>
                          <div className="text-muted-foreground">On Target</div>
                        </div>
                      )}
                      {match.prediction.advancedStats.home.corners !== undefined && (
                        <div className="text-center p-3 bg-muted/50 dark:bg-muted/30 rounded-lg">
                          <div className="text-2xl font-bold">{match.prediction.advancedStats.home.corners}</div>
                          <div className="text-muted-foreground">Corners</div>
                        </div>
                      )}
                      {match.prediction.advancedStats.home.fouls !== undefined && (
                        <div className="text-center p-3 bg-muted/50 dark:bg-muted/30 rounded-lg">
                          <div className="text-2xl font-bold">{match.prediction.advancedStats.home.fouls}</div>
                          <div className="text-muted-foreground">Fouls</div>
                        </div>
                      )}
                      {match.prediction.advancedStats.home.yellowCards !== undefined && (
                        <div className="text-center p-3 bg-yellow-500/20 dark:bg-yellow-500/10 rounded-lg">
                          <div className="text-2xl font-bold">{match.prediction.advancedStats.home.yellowCards}</div>
                          <div className="text-muted-foreground">Yellow Cards</div>
                        </div>
                      )}
                      {match.prediction.advancedStats.home.redCards !== undefined && (
                        <div className="text-center p-3 bg-red-500/20 dark:bg-red-500/10 rounded-lg">
                          <div className="text-2xl font-bold">{match.prediction.advancedStats.home.redCards}</div>
                          <div className="text-muted-foreground">Red Cards</div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Away Team Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle>{match.teams.away}</CardTitle>
                    <CardDescription>Advanced Performance Metrics</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {match.prediction.advancedStats.away.xG !== undefined && (
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm">Expected Goals (xG)</span>
                          <span className="font-semibold">{match.prediction.advancedStats.away.xG.toFixed(2)}</span>
                        </div>
                        <Progress value={(match.prediction.advancedStats.away.xG / 3) * 100} className="h-2" />
                      </div>
                    )}
                    {match.prediction.advancedStats.away.xGA !== undefined && (
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm">Expected Goals Against (xGA)</span>
                          <span className="font-semibold">{match.prediction.advancedStats.away.xGA.toFixed(2)}</span>
                        </div>
                        <Progress value={(match.prediction.advancedStats.away.xGA / 3) * 100} className="h-2" />
                      </div>
                    )}
                    {match.prediction.advancedStats.away.xPTS !== undefined && (
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm">Expected Points (xPTS)</span>
                          <span className="font-semibold">{match.prediction.advancedStats.away.xPTS.toFixed(1)}</span>
                        </div>
                        <Progress value={(match.prediction.advancedStats.away.xPTS / 3) * 100} className="h-2" />
                      </div>
                    )}
                    {match.prediction.advancedStats.away.possession !== undefined && (
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm">Possession</span>
                          <span className="font-semibold">{match.prediction.advancedStats.away.possession}%</span>
                        </div>
                        <Progress value={match.prediction.advancedStats.away.possession} className="h-2" />
                      </div>
                    )}
                    
                    <Separator />
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {match.prediction.advancedStats.away.shots !== undefined && (
                        <div className="text-center p-3 bg-muted/50 dark:bg-muted/30 rounded-lg">
                          <div className="text-2xl font-bold">{match.prediction.advancedStats.away.shots}</div>
                          <div className="text-muted-foreground">Shots</div>
                        </div>
                      )}
                      {match.prediction.advancedStats.away.shotsOnTarget !== undefined && (
                        <div className="text-center p-3 bg-muted/50 dark:bg-muted/30 rounded-lg">
                          <div className="text-2xl font-bold">{match.prediction.advancedStats.away.shotsOnTarget}</div>
                          <div className="text-muted-foreground">On Target</div>
                        </div>
                      )}
                      {match.prediction.advancedStats.away.corners !== undefined && (
                        <div className="text-center p-3 bg-muted/50 dark:bg-muted/30 rounded-lg">
                          <div className="text-2xl font-bold">{match.prediction.advancedStats.away.corners}</div>
                          <div className="text-muted-foreground">Corners</div>
                        </div>
                      )}
                      {match.prediction.advancedStats.away.fouls !== undefined && (
                        <div className="text-center p-3 bg-muted/50 dark:bg-muted/30 rounded-lg">
                          <div className="text-2xl font-bold">{match.prediction.advancedStats.away.fouls}</div>
                          <div className="text-muted-foreground">Fouls</div>
                        </div>
                      )}
                      {match.prediction.advancedStats.away.yellowCards !== undefined && (
                        <div className="text-center p-3 bg-yellow-500/20 dark:bg-yellow-500/10 rounded-lg">
                          <div className="text-2xl font-bold">{match.prediction.advancedStats.away.yellowCards}</div>
                          <div className="text-muted-foreground">Yellow Cards</div>
                        </div>
                      )}
                      {match.prediction.advancedStats.away.redCards !== undefined && (
                        <div className="text-center p-3 bg-red-500/20 dark:bg-red-500/10 rounded-lg">
                          <div className="text-2xl font-bold">{match.prediction.advancedStats.away.redCards}</div>
                          <div className="text-muted-foreground">Red Cards</div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Advanced statistics will be available closer to match time.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ODDS COMPARISON TAB */}
          <TabsContent value="odds" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Bookmaker Odds Comparison</CardTitle>
                <CardDescription>Current odds from available bookmakers</CardDescription>
              </CardHeader>
              <CardContent>
                {match.bookmakerOdds && match.bookmakerOdds.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b border-border">
                        <tr className="text-left">
                          <th className="p-3 font-semibold">Bookmaker</th>
                          <th className="p-3 font-semibold text-center">Home</th>
                          {match.odds.draw && <th className="p-3 font-semibold text-center">Draw</th>}
                          <th className="p-3 font-semibold text-center">Away</th>
                          <th className="p-3 font-semibold text-right">Last Updated</th>
                        </tr>
                      </thead>
                      <tbody>
                        {match.bookmakerOdds.map((bookmaker, i) => (
                          <tr key={i} className="border-b border-border hover:bg-muted/50 dark:hover:bg-muted/30 transition-colors">
                            <td className="p-3 font-medium">{bookmaker.bookmaker}</td>
                            <td className="p-3 text-center font-mono font-semibold">{bookmaker.home.toFixed(2)}</td>
                            {match.odds.draw && <td className="p-3 text-center font-mono font-semibold">{bookmaker.draw?.toFixed(2) || '-'}</td>}
                            <td className="p-3 text-center font-mono font-semibold">{bookmaker.away.toFixed(2)}</td>
                            <td className="p-3 text-right text-xs text-muted-foreground">{new Date(bookmaker.lastUpdated).toLocaleTimeString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center py-4 text-sm text-muted-foreground">
                      Current match odds from primary source
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-muted/50 dark:bg-muted/30 rounded-lg">
                        <div className="text-sm text-muted-foreground mb-2">Home</div>
                        <div className="text-2xl font-mono font-bold">{match.odds.home?.toFixed(2) || 'N/A'}</div>
                      </div>
                      {match.odds.draw && (
                        <div className="text-center p-4 bg-muted/50 dark:bg-muted/30 rounded-lg">
                          <div className="text-sm text-muted-foreground mb-2">Draw</div>
                          <div className="text-2xl font-mono font-bold">{match.odds.draw.toFixed(2)}</div>
                        </div>
                      )}
                      <div className="text-center p-4 bg-muted/50 dark:bg-muted/30 rounded-lg">
                        <div className="text-sm text-muted-foreground mb-2">Away</div>
                        <div className="text-2xl font-mono font-bold">{match.odds.away?.toFixed(2) || 'N/A'}</div>
                      </div>
                    </div>
                  </div>
                )}

                {match.prediction?.markets && match.prediction.markets.length > 0 && (
                  <>
                    <Separator className="my-6" />
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Alternative Markets</h3>
                      <div className="space-y-2">
                        {match.prediction.markets.map((market, i) => (
                          <div key={i} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 dark:hover:bg-muted/30 transition-colors">
                            <div>
                              <div className="font-medium capitalize">{market.category.replace('_', ' ')}</div>
                              <div className="text-sm text-muted-foreground">{market.selection}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-mono font-bold">{market.odds.toFixed(2)}</div>
                              <div className="text-xs text-muted-foreground">{market.bookmaker}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
