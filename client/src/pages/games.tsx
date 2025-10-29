import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Game, GamesListResponse, SportType } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, TrendingUp, Clock, Trophy } from 'lucide-react';
import { Link } from 'wouter';

export default function GamesPage() {
  const [selectedSport, setSelectedSport] = useState<SportType | 'All'>('All');
  const [selectedDate, setSelectedDate] = useState<'today' | 'tomorrow' | 'upcoming' | 'past'>('today');

  const { data: gamesData, isLoading } = useQuery<GamesListResponse>({
    queryKey: ['/api/games', selectedSport, selectedDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedSport !== 'All') params.append('sport', selectedSport);
      params.append('date', selectedDate);
      params.append('limit', '200');
      
      const response = await fetch(`/api/games?${params}`);
      if (!response.ok) throw new Error('Failed to fetch games');
      return response.json();
    },
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const gameDate = new Date(date);
    gameDate.setHours(0, 0, 0, 0);
    
    if (gameDate.getTime() === today.getTime()) return 'Today';
    if (gameDate.getTime() === today.getTime() + 86400000) return 'Tomorrow';
    
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const groupGamesByDate = (games: Game[]) => {
    const grouped: Record<string, Game[]> = {};
    games.forEach(game => {
      if (!grouped[game.date]) {
        grouped[game.date] = [];
      }
      grouped[game.date].push(game);
    });
    return grouped;
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
      return <Badge variant="destructive" className="animate-pulse" data-testid={`badge-status-live`}>● LIVE</Badge>;
    }
    if (status === 'finished') {
      return <Badge variant="secondary" data-testid={`badge-status-finished`}>FT</Badge>;
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading games...</p>
        </div>
      </div>
    );
  }

  const games = gamesData?.games || [];
  const groupedGames = groupGamesByDate(games);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2" data-testid="heading-games">All Games</h1>
          <p className="text-muted-foreground">
            {gamesData?.filteredCount || 0} games available{' '}
            {selectedSport !== 'All' && `• ${selectedSport}`}
          </p>
        </div>
        <Link href="/" data-testid="link-dashboard">
          <Button variant="outline">
            <Trophy className="mr-2 h-4 w-4" />
            View Apex Pick
          </Button>
        </Link>
      </div>

      {/* Sport Filter */}
      <div className="flex gap-2 flex-wrap" data-testid="filter-sport">
        {(['All', 'Football', 'Basketball', 'Tennis', 'Hockey'] as const).map((sport) => (
          <Button
            key={sport}
            variant={selectedSport === sport ? 'default' : 'outline'}
            onClick={() => setSelectedSport(sport)}
            data-testid={`button-sport-${sport.toLowerCase()}`}
          >
            {sport}
          </Button>
        ))}
      </div>

      {/* Date Filter */}
      <Tabs value={selectedDate} onValueChange={(value) => setSelectedDate(value as typeof selectedDate)} data-testid="filter-date">
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="today" data-testid="button-date-today">
            <Calendar className="mr-2 h-4 w-4" />
            Today
          </TabsTrigger>
          <TabsTrigger value="tomorrow" data-testid="button-date-tomorrow">
            <Clock className="mr-2 h-4 w-4" />
            Tomorrow
          </TabsTrigger>
          <TabsTrigger value="upcoming" data-testid="button-date-upcoming">
            <TrendingUp className="mr-2 h-4 w-4" />
            Upcoming
          </TabsTrigger>
          <TabsTrigger value="past" data-testid="button-date-past">
            <Trophy className="mr-2 h-4 w-4" />
            Past Results
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Games List */}
      <ScrollArea className="h-[calc(100vh-320px)]">
        <div className="space-y-6">
          {Object.entries(groupedGames).map(([date, dateGames]) => (
            <div key={date} className="space-y-3">
              <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-2 z-10 border-b">
                <h2 className="text-xl font-semibold" data-testid={`heading-date-${date}`}>
                  {formatDate(date)}
                  <span className="text-sm text-muted-foreground ml-2 font-normal">
                    ({dateGames.length} games)
                  </span>
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dateGames.map((game) => (
                  <Card 
                    key={game.id} 
                    className="hover-elevate active-elevate-2 cursor-pointer transition-all"
                    data-testid={`card-game-${game.id}`}
                  >
                    <CardHeader className="pb-3 space-y-0">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <Badge className={getSportColor(game.sport)} data-testid={`badge-sport-${game.id}`}>
                          {game.sport}
                        </Badge>
                        {getStatusBadge(game.status)}
                      </div>
                      <div className="text-xs text-muted-foreground" data-testid={`text-league-${game.id}`}>
                        {game.league} • {game.time}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Teams */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium" data-testid={`text-home-team-${game.id}`}>{game.teams.home}</span>
                          <span className="font-mono text-sm text-muted-foreground" data-testid={`text-home-odds-${game.id}`}>
                            {game.odds.home.toFixed(2)}
                          </span>
                        </div>
                        {game.sport === 'Football' && game.odds.draw && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Draw</span>
                            <span className="font-mono text-sm text-muted-foreground" data-testid={`text-draw-odds-${game.id}`}>
                              {game.odds.draw.toFixed(2)}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="font-medium" data-testid={`text-away-team-${game.id}`}>{game.teams.away}</span>
                          <span className="font-mono text-sm text-muted-foreground" data-testid={`text-away-odds-${game.id}`}>
                            {game.odds.away.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Current Score (if live or finished) */}
                      {game.currentScore && (
                        <div className="flex items-center justify-center gap-4 py-2 bg-muted rounded-md">
                          <span className="font-mono text-2xl font-bold" data-testid={`text-score-home-${game.id}`}>
                            {game.currentScore.home}
                          </span>
                          <span className="text-muted-foreground">-</span>
                          <span className="font-mono text-2xl font-bold" data-testid={`text-score-away-${game.id}`}>
                            {game.currentScore.away}
                          </span>
                        </div>
                      )}

                      {/* Best Bet */}
                      {game.bestBet && (
                        <div className="bg-primary/5 border border-primary/20 rounded-md p-3 space-y-1">
                          <div className="text-xs text-muted-foreground">Best Bet</div>
                          <div className="font-medium text-sm" data-testid={`text-best-bet-type-${game.id}`}>{game.bestBet.type}</div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-mono" data-testid={`text-best-bet-odds-${game.id}`}>{game.bestBet.odds.toFixed(2)}</span>
                            <Badge variant={game.bestBet.ev > 15 ? 'default' : 'secondary'} data-testid={`badge-ev-${game.id}`}>
                              EV: +{game.bestBet.ev.toFixed(1)}%
                            </Badge>
                          </div>
                        </div>
                      )}

                      {/* Prediction Available */}
                      {game.predictionAvailable && game.confidence && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Confidence</span>
                          <Badge variant="outline" data-testid={`badge-confidence-${game.id}`}>
                            {game.confidence}%
                          </Badge>
                        </div>
                      )}

                      {!game.predictionAvailable && (
                        <div className="text-center text-xs text-muted-foreground">
                          Prediction not available
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {games.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No games found</h3>
            <p className="text-muted-foreground">
              Try selecting a different sport or date range
            </p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
