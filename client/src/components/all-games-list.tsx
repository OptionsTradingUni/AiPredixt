import { Game, GroupedGamesResponse, SportType } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Clock, TrendingUp, ChevronDown } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface AllGamesListProps {
  groupedGames: GroupedGamesResponse;
  onGameClick?: (game: Game) => void;
}

export function AllGamesList({ groupedGames, onGameClick }: AllGamesListProps) {
  // Safe numeric formatting - handles both strings and numbers
  const formatOdds = (value: any): string => {
    if (value === null || value === undefined || value === '') return '-';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return !isNaN(num) ? num.toFixed(2) : '-';
  };

  const formatPercent = (value: any): string => {
    if (value === null || value === undefined || value === '') return '-';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return !isNaN(num) ? num.toFixed(1) : '-';
  };

  const getSportColor = (sport: SportType) => {
    const colors = {
      Football: 'bg-green-500/10 text-green-500 border-green-500/20',
      Basketball: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
      Tennis: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      Hockey: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    };
    return colors[sport];
  };

  const getStatusBadge = (status: Game['status']) => {
    if (status === 'live') {
      return <Badge variant="destructive" className="animate-pulse">● LIVE</Badge>;
    }
    if (status === 'finished') {
      return <Badge variant="secondary">FT</Badge>;
    }
    return <Badge variant="outline">Upcoming</Badge>;
  };

  const formatTime = (time: string) => {
    return time;
  };

  if (!groupedGames.leagues || groupedGames.leagues.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <Trophy className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Games Found</h3>
          <p className="text-sm text-muted-foreground">
            No games available for the selected filters. Try changing your sport or date selection.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight" data-testid="heading-all-games">All Games</h2>
          <p className="text-sm text-muted-foreground mt-1" data-testid="text-games-summary">
            {groupedGames.filteredGames} games across {groupedGames.leagues.length} leagues
          </p>
        </div>
      </div>

      <Accordion type="multiple" className="space-y-4">
        {groupedGames.leagues.map((leagueGroup, index) => (
          <AccordionItem 
            key={leagueGroup.league} 
            value={`league-${index}`}
            className="border rounded-lg overflow-hidden"
            data-testid={`league-card-${leagueGroup.league}`}
          >
            <AccordionTrigger className="hover:no-underline px-6 py-4 bg-muted/50 hover:bg-muted/70 transition-colors [&[data-state=open]]:bg-muted">
              <div className="flex items-center justify-between w-full pr-4">
                <div className="flex items-center gap-3">
                  <Trophy className="h-5 w-5 text-primary flex-shrink-0" />
                  <div className="text-left">
                    <div className="font-semibold text-lg" data-testid={`league-title-${leagueGroup.league}`}>
                      {leagueGroup.league}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {leagueGroup.gameCount} {leagueGroup.gameCount === 1 ? 'game' : 'games'}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className={getSportColor(leagueGroup.sport)} data-testid={`league-sport-${leagueGroup.league}`}>
                  {leagueGroup.sport}
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-0">
              <div className="divide-y">
                {leagueGroup.games.map((game) => (
                  <div
                    key={game.id}
                    className="p-4 hover:bg-muted/50 transition-colors cursor-pointer group"
                    data-testid={`game-card-${game.id}`}
                    onClick={() => onGameClick?.(game)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0 space-y-3">
                        {/* Header with Status and Time */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {getStatusBadge(game.status)}
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            <span data-testid={`game-time-${game.id}`}>{formatTime(game.time)}</span>
                          </div>
                          {game.date && (
                            <span className="text-sm text-muted-foreground" data-testid={`game-date-${game.id}`}>
                              {new Date(game.date).toLocaleDateString('en-US', { 
                                weekday: 'short', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </span>
                          )}
                        </div>

                        {/* Teams */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-base" data-testid={`home-team-${game.id}`}>
                              {game.teams?.home || 'TBD'}
                            </span>
                            {game.odds?.home && (
                              <span className="font-mono text-sm font-medium" data-testid={`home-odds-${game.id}`}>
                                {game.odds.home.toFixed(2)}
                              </span>
                            )}
                          </div>
                          {game.currentScore && (
                            <div className="flex items-center justify-center gap-4 py-1 bg-muted/30 rounded-md">
                              <span className="font-mono text-xl font-bold" data-testid={`score-home-${game.id}`}>
                                {game.currentScore.home}
                              </span>
                              <span className="text-muted-foreground">-</span>
                              <span className="font-mono text-xl font-bold" data-testid={`score-away-${game.id}`}>
                                {game.currentScore.away}
                              </span>
                            </div>
                          )}
                          {game.sport === 'Football' && game.odds?.draw && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Draw</span>
                              <span className="font-mono text-sm text-muted-foreground" data-testid={`draw-odds-${game.id}`}>
                                {game.odds.draw.toFixed(2)}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-base" data-testid={`away-team-${game.id}`}>
                              {game.teams?.away || 'TBD'}
                            </span>
                            {game.odds?.away && (
                              <span className="font-mono text-sm font-medium" data-testid={`away-odds-${game.id}`}>
                                {game.odds.away.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Best Bet if available */}
                        {game.bestBet && (
                          <div className="bg-primary/5 border border-primary/20 rounded-md p-3 space-y-1">
                            <div className="text-xs text-muted-foreground">Best Bet</div>
                            <div className="font-medium text-sm" data-testid={`best-bet-type-${game.id}`}>
                              {game.bestBet.type}
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-mono" data-testid={`best-bet-odds-${game.id}`}>
                                {game.bestBet.odds.toFixed(2)}
                              </span>
                              <Badge 
                                variant={game.bestBet.ev > 10 ? 'default' : 'secondary'}
                                data-testid={`best-bet-ev-${game.id}`}
                              >
                                <TrendingUp className="mr-1 h-3 w-3" />
                                +{game.bestBet.ev.toFixed(1)}% EV
                              </Badge>
                            </div>
                          </div>
                        )}

                        {/* Confidence if prediction available */}
                        {game.predictionAvailable && game.confidence && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Prediction Confidence</span>
                            <Badge variant="outline" data-testid={`confidence-${game.id}`}>
                              {Math.round(game.confidence)}%
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
