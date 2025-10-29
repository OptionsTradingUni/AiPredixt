import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SportType, ApexPrediction } from '@shared/schema';
import { SportFilter } from '@/components/sport-filter';
import { ThemeToggle } from '@/components/theme-toggle';
import { RefreshCw, TrendingUp, AlertTriangle, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'wouter';

export default function AllGamesPage() {
  const [selectedSport, setSelectedSport] = useState<SportType | 'All'>('All');

  const { data: predictions, isLoading, refetch } = useQuery<ApexPrediction[]>({
    queryKey: ['/api/all-predictions', selectedSport],
    queryFn: async () => {
      const sportParam = selectedSport !== 'All' ? `?sport=${selectedSport}` : '';
      const response = await fetch(`/api/all-predictions${sportParam}`);
      if (!response.ok) throw new Error('Failed to fetch predictions');
      return response.json();
    },
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary text-primary-foreground">
                <span className="font-mono font-bold text-lg">Δ</span>
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">Apex AI</h1>
                <p className="text-xs text-muted-foreground">All Games</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Link href="/">
                <Button variant="ghost" size="sm" data-testid="link-dashboard">
                  Dashboard
                </Button>
              </Link>
              <Button
                size="sm"
                variant="outline"
                onClick={() => refetch()}
                data-testid="button-refresh"
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Sport Filters */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 py-6">
          <SportFilter
            selectedSport={selectedSport}
            onSelectSport={setSelectedSport}
          />
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader className="pb-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : predictions && predictions.length > 0 ? (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <Card data-testid="card-total-games">
                <CardHeader className="pb-3">
                  <CardDescription>Total Games Analyzed</CardDescription>
                  <CardTitle className="text-3xl">{predictions.length}</CardTitle>
                </CardHeader>
              </Card>
              <Card data-testid="card-avg-edge">
                <CardHeader className="pb-3">
                  <CardDescription>Average Edge</CardDescription>
                  <CardTitle className="text-3xl text-primary">
                    {(predictions.reduce((sum, p) => sum + p.edge, 0) / predictions.length).toFixed(1)}%
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card data-testid="card-high-confidence">
                <CardHeader className="pb-3">
                  <CardDescription>High Confidence (&gt;80)</CardDescription>
                  <CardTitle className="text-3xl">
                    {predictions.filter(p => p.confidenceScore > 80).length}
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>

            {/* Games Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {predictions.map((prediction) => (
                <Card 
                  key={prediction.id} 
                  className="overflow-hidden hover-elevate active-elevate-2 cursor-pointer" 
                  data-testid={`card-game-${prediction.id}`}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="font-mono text-xs" data-testid={`badge-sport-${prediction.id}`}>
                        {prediction.sport}
                      </Badge>
                      <Badge 
                        variant={prediction.edge > 15 ? 'default' : 'secondary'}
                        className="font-mono text-xs"
                        data-testid={`badge-edge-${prediction.id}`}
                      >
                        {prediction.edge.toFixed(1)}% EV
                      </Badge>
                    </div>
                    <CardTitle className="text-lg leading-tight" data-testid={`title-match-${prediction.id}`}>
                      {prediction.teams.home} vs {prediction.teams.away}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2" data-testid={`description-league-${prediction.id}`}>
                      <Calendar className="h-3 w-3" />
                      {prediction.league}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Bet Type */}
                    <div className="bg-muted rounded-md p-3">
                      <p className="text-xs text-muted-foreground mb-1">Recommended Bet</p>
                      <p className="font-semibold" data-testid={`text-bettype-${prediction.id}`}>
                        {prediction.betType}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1" data-testid={`text-odds-${prediction.id}`}>
                        @ {prediction.bestOdds.toFixed(2)} ({prediction.bookmaker})
                      </p>
                    </div>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Confidence</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-primary h-full transition-all"
                              style={{ width: `${prediction.confidenceScore}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium" data-testid={`text-confidence-${prediction.id}`}>
                            {prediction.confidenceScore}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Win Probability</p>
                        <p className="text-lg font-bold" data-testid={`text-probability-${prediction.id}`}>
                          {prediction.calculatedProbability.ensembleAverage.toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    {/* Stake Recommendation */}
                    <div className="border-t pt-3">
                      <p className="text-xs text-muted-foreground mb-1">Recommended Stake</p>
                      <p className="text-sm font-medium" data-testid={`text-stake-${prediction.id}`}>
                        {prediction.recommendedStake.kellyFraction}
                      </p>
                      <p className="text-xs text-muted-foreground" data-testid={`text-bankroll-${prediction.id}`}>
                        {prediction.recommendedStake.percentageOfBankroll.toFixed(1)}% of bankroll
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2">
                      {prediction.predictionStability === 'High' ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      )}
                      <span className="text-xs text-muted-foreground" data-testid={`text-stability-${prediction.id}`}>
                        {prediction.predictionStability} Stability
                      </span>
                    </div>
                    <Link href={`/?sport=${prediction.sport}`}>
                      <Button variant="ghost" size="sm" data-testid={`button-details-${prediction.id}`}>
                        View Details
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <RefreshCw className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Games Available</h3>
              <p className="text-sm text-muted-foreground mb-4">
                No predictions available for the selected sport. Try refreshing or selecting a different sport.
              </p>
              <Button onClick={() => refetch()} data-testid="button-refresh-empty">
                Refresh Predictions
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-20">
        <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <p>© 2025 Apex AI Sports Prediction Engine. For informational purposes only.</p>
            <p className="font-mono">
              Showing {predictions?.length || 0} predictions
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
