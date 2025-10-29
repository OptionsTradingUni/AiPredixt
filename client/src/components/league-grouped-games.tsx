import { ApexPrediction } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, TrendingUp, Target, Clock, ChevronRight, Activity } from 'lucide-react';
import { Link } from 'wouter';
import { useState } from 'react';
import { DetailedMatchView } from './detailed-match-view';

interface LeagueGroupedGamesProps {
  predictions: ApexPrediction[];
}

export function LeagueGroupedGames({ predictions }: LeagueGroupedGamesProps) {
  const [selectedMatch, setSelectedMatch] = useState<ApexPrediction | null>(null);
  const groupedByLeague = predictions.reduce((acc, prediction) => {
    const league = prediction.league;
    if (!acc[league]) {
      acc[league] = [];
    }
    acc[league].push(prediction);
    return acc;
  }, {} as Record<string, ApexPrediction[]>);

  const sortedLeagues = Object.keys(groupedByLeague).sort((a, b) => {
    const aHighQuality = groupedByLeague[a].some(p => p.edge > 5);
    const bHighQuality = groupedByLeague[b].some(p => p.edge > 5);
    if (aHighQuality && !bHighQuality) return -1;
    if (!aHighQuality && bHighQuality) return 1;
    return groupedByLeague[b].length - groupedByLeague[a].length;
  });

  const getSportColor = (sport: string) => {
    const colors = {
      Football: 'bg-green-500/10 text-green-500 border-green-500/20',
      Basketball: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
      Tennis: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      Hockey: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    };
    return colors[sport as keyof typeof colors] || 'bg-gray-500/10 text-gray-500 border-gray-500/20';
  };

  const getEdgeColor = (edge: number) => {
    if (edge >= 10) return 'text-green-500';
    if (edge >= 5) return 'text-blue-500';
    if (edge >= 3) return 'text-yellow-500';
    return 'text-muted-foreground';
  };

  // Show detailed match view if a match is selected
  if (selectedMatch) {
    return (
      <DetailedMatchView 
        prediction={selectedMatch} 
        onClose={() => setSelectedMatch(null)}
      />
    );
  }

  if (predictions.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <Trophy className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Games Found</h3>
          <p className="text-sm text-muted-foreground">
            Try selecting a different sport or date range
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">All Games</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {predictions.length} games analyzed across {sortedLeagues.length} leagues
          </p>
        </div>
      </div>

      {sortedLeagues.map((league) => {
        const leagueGames = groupedByLeague[league];
        const topGame = leagueGames[0];
        
        return (
          <Card key={league} className="overflow-hidden" data-testid={`league-${league}`}>
            <CardHeader className="bg-muted/50 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Trophy className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle className="text-xl">{league}</CardTitle>
                    {topGame.leagueInfo && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {topGame.leagueInfo.country} • {topGame.leagueInfo.tier} • {topGame.leagueInfo.type}
                      </p>
                    )}
                  </div>
                </div>
                <Badge variant="outline" className={getSportColor(topGame.sport)}>
                  {topGame.sport}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {leagueGames.map((game) => (
                  <div
                    key={game.id}
                    className="p-4 hover:bg-muted/50 transition-colors cursor-pointer group"
                    data-testid={`game-${game.id}`}
                    onClick={() => setSelectedMatch(game)}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-base truncate">
                            {game.teams.home} vs {game.teams.away}
                          </h3>
                          {game.edge >= 5 && (
                            <Badge variant="default" className="bg-green-500/10 text-green-500 border-green-500/20 shrink-0">
                              High Value
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Target className="h-3.5 w-3.5" />
                            <span className="font-mono">{game.betType}</span>
                          </div>
                          {game.advancedStats && (
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Activity className="h-3.5 w-3.5" />
                              <span className="text-xs">
                                xG: {game.advancedStats.home.xG?.toFixed(1)}-{game.advancedStats.away.xG?.toFixed(1)}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5">
                            <TrendingUp className="h-3.5 w-3.5" />
                            <span className={`font-mono font-semibold ${getEdgeColor(game.edge)}`}>
                              {game.edge > 0 ? '+' : ''}{game.edge.toFixed(2)}% EV
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            <span>Confidence: {game.confidenceScore}/100</span>
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <div className="text-xs">
                            <span className="text-muted-foreground">Our Model:</span>{' '}
                            <span className="font-mono font-semibold">
                              {game.calculatedProbability.ensembleAverage.toFixed(1)}%
                            </span>
                          </div>
                          {game.calculatedProbability.marketImplied && (
                            <div className="text-xs">
                              <span className="text-muted-foreground">Market:</span>{' '}
                              <span className="font-mono">
                                {game.calculatedProbability.marketImplied.toFixed(1)}%
                              </span>
                            </div>
                          )}
                          {game.calculatedProbability.rawUncapped && (
                            <div className="text-xs">
                              <span className="text-muted-foreground">Raw:</span>{' '}
                              <span className="font-mono">
                                {game.calculatedProbability.rawUncapped.toFixed(1)}%
                              </span>
                            </div>
                          )}
                          <div className="text-xs">
                            <span className="text-muted-foreground">Odds:</span>{' '}
                            <span className="font-mono font-semibold">
                              {game.bestOdds.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        data-testid={`button-view-${game.id}`}
                      >
                        View Details
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
