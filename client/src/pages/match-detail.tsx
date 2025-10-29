import { useQuery } from '@tanstack/react-query';
import { useParams, useLocation, Link } from 'wouter';
import { MatchDetail } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Trophy, Clock, MapPin, Users } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

export default function MatchDetailPage() {
  const params = useParams();
  const [, navigate] = useLocation();
  const gameId = params.id;

  const { data: match, isLoading } = useQuery<MatchDetail>({
    queryKey: ['/api/games', gameId],
    queryFn: async () => {
      const response = await fetch(`/api/games/${gameId}`);
      if (!response.ok) throw new Error('Failed to fetch match details');
      return response.json();
    },
    enabled: !!gameId,
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

  if (!match) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Match Not Found</h2>
          <p className="text-muted-foreground mb-4">The match you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
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
                <h1 className="text-base md:text-lg font-bold">Match Details</h1>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="w-full px-4 md:px-6 py-6 max-w-6xl mx-auto">
        {/* Match Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  {getStatusBadge()}
                  <Badge variant="outline">{match.sport}</Badge>
                  <Badge variant="outline">{match.league}</Badge>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl md:text-2xl font-bold" data-testid="text-home-team">
                      {match.teams.home}
                    </h2>
                    {match.odds.home && (
                      <span className="font-mono font-medium text-lg">{match.odds.home.toFixed(2)}</span>
                    )}
                  </div>
                  {match.currentScore && (
                    <div className="text-center">
                      <span className="text-4xl font-bold font-mono">
                        {match.currentScore.home} - {match.currentScore.away}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl md:text-2xl font-bold" data-testid="text-away-team">
                      {match.teams.away}
                    </h2>
                    {match.odds.away && (
                      <span className="font-mono font-medium text-lg">{match.odds.away.toFixed(2)}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>{match.date} • {match.time}</span>
              </div>
              {match.venue && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  <span>{match.venue}</span>
                </div>
              )}
              {match.referee && (
                <div className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  <span>{match.referee}</span>
                </div>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
            <TabsTrigger value="overview" className="text-xs md:text-sm">Overview</TabsTrigger>
            <TabsTrigger value="prediction" className="text-xs md:text-sm">Prediction</TabsTrigger>
            <TabsTrigger value="h2h" className="text-xs md:text-sm">H2H</TabsTrigger>
            <TabsTrigger value="standings" className="text-xs md:text-sm">Standings</TabsTrigger>
            <TabsTrigger value="stats" className="text-xs md:text-sm">Stats</TabsTrigger>
            <TabsTrigger value="odds" className="text-xs md:text-sm">Odds</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Match Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">{match.teams.home}</h3>
                    <p className="text-sm text-muted-foreground">Home odds: {match.odds.home?.toFixed(2) || 'N/A'}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">{match.teams.away}</h3>
                    <p className="text-sm text-muted-foreground">Away odds: {match.odds.away?.toFixed(2) || 'N/A'}</p>
                  </div>
                </div>
                {match.odds.draw && (
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">Draw</p>
                    <p className="font-mono font-semibold text-lg">{match.odds.draw.toFixed(2)}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prediction">
            <Card>
              <CardHeader>
                <CardTitle>AI Prediction</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Detailed predictions and analysis coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="h2h">
            <Card>
              <CardHeader>
                <CardTitle>Head to Head</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Historical matchup data coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="standings">
            <Card>
              <CardHeader>
                <CardTitle>League Standings & Form</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">League table and recent form coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Team statistics and performance metrics coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="odds">
            <Card>
              <CardHeader>
                <CardTitle>Bookmaker Odds Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Odds comparison from multiple bookmakers coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
