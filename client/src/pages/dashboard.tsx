import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SportType, ApexPrediction, GroupedGamesResponse } from '@shared/schema';
import { SportFilter } from '@/components/sport-filter';
import { ApexPickCard } from '@/components/apex-pick-card';
import { MetricsGrid } from '@/components/metrics-grid';
import { RiskAssessmentPanel } from '@/components/risk-assessment-panel';
import { JustificationSection } from '@/components/justification-section';
import { MarketAnalysisTable } from '@/components/market-analysis-table';
import { ContingencyPickCard } from '@/components/contingency-pick-card';
import { HistoricalPerformanceChart } from '@/components/historical-performance-chart';
import { ConfigStatusBanner } from '@/components/config-status-banner';
import { AllMarketsPanel } from '@/components/all-markets-panel';
import { ThemeToggle } from '@/components/theme-toggle';
import { AllGamesList } from '@/components/all-games-list';
import { RefreshCw, List, Calendar, Clock, TrendingUp, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link, useLocation } from 'wouter';

interface DataSourceStatus {
  isRealData: boolean;
  apis: {
    oddsApi: boolean;
    sportsApi: boolean;
  };
  scrapingSources: string[];
  totalSources: number;
}

export default function Dashboard() {
  const [, navigate] = useLocation();
  const [selectedSport, setSelectedSport] = useState<SportType | 'All'>('All');
  const [selectedDate, setSelectedDate] = useState<'today' | 'tomorrow' | 'upcoming' | 'past'>('today');

  const { data: dataSourceStatus } = useQuery<DataSourceStatus>({
    queryKey: ['/api/data-source-status'],
  });

  const { data: apexPrediction, isLoading: apexLoading, refetch: refetchApex } = useQuery<ApexPrediction>({
    queryKey: ['/api/apex-prediction', selectedSport, selectedDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedSport !== 'All') params.set('sport', selectedSport);
      params.set('date', selectedDate);
      const queryString = params.toString();
      const response = await fetch(`/api/apex-prediction${queryString ? `?${queryString}` : ''}`);
      if (!response.ok) throw new Error('Failed to fetch prediction');
      return response.json();
    },
  });

  const { data: groupedGames, isLoading: gamesLoading, refetch: refetchGames } = useQuery<GroupedGamesResponse>({
    queryKey: ['/api/games/grouped', selectedSport, selectedDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedSport !== 'All') params.set('sport', selectedSport);
      params.set('date', selectedDate);
      const queryString = params.toString();
      const response = await fetch(`/api/games/grouped${queryString ? `?${queryString}` : ''}`);
      if (!response.ok) throw new Error('Failed to fetch games');
      return response.json();
    },
  });

  const isLoading = apexLoading || gamesLoading;
  const refetch = () => {
    refetchApex();
    refetchGames();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="w-full px-4 md:px-6">
          <div className="flex items-center justify-between h-14 md:h-16">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-md bg-primary text-primary-foreground">
                <span className="font-mono font-bold text-base md:text-lg">Δ</span>
              </div>
              <div>
                <h1 className="text-lg md:text-xl font-bold tracking-tight">Apex AI</h1>
                <p className="text-[10px] md:text-xs text-muted-foreground">Prediction Engine</p>
              </div>
            </div>
            <div className="flex items-center gap-1 md:gap-2">
              <ThemeToggle />
              <Button
                size="sm"
                variant="outline"
                onClick={() => refetch()}
                data-testid="button-refresh"
                className="gap-1 md:gap-2"
              >
                <RefreshCw className="h-3.5 w-3.5 md:h-4 md:w-4" />
                <span className="hidden sm:inline text-xs md:text-sm">Refresh</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Filters - Compact Mobile Design */}
      <div className="border-b border-border bg-card/50">
        <div className="w-full px-4 md:px-6 py-3 md:py-4">
          <div className="space-y-3">
            <SportFilter
              selectedSport={selectedSport}
              onSelectSport={setSelectedSport}
            />
            
            {/* Date Filter - Horizontal Scroll on Mobile */}
            <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
              <Tabs value={selectedDate} onValueChange={(value) => setSelectedDate(value as typeof selectedDate)} data-testid="filter-date">
                <TabsList className="inline-flex w-auto min-w-full md:grid md:w-full md:max-w-2xl md:grid-cols-4">
                  <TabsTrigger value="today" data-testid="button-date-today" className="flex-shrink-0">
                    <Calendar className="mr-1.5 md:mr-2 h-3.5 w-3.5 md:h-4 md:w-4" />
                    <span className="text-xs md:text-sm">Today</span>
                  </TabsTrigger>
                  <TabsTrigger value="tomorrow" data-testid="button-date-tomorrow" className="flex-shrink-0">
                    <Clock className="mr-1.5 md:mr-2 h-3.5 w-3.5 md:h-4 md:w-4" />
                    <span className="text-xs md:text-sm">Tomorrow</span>
                  </TabsTrigger>
                  <TabsTrigger value="upcoming" data-testid="button-date-upcoming" className="flex-shrink-0">
                    <TrendingUp className="mr-1.5 md:mr-2 h-3.5 w-3.5 md:h-4 md:w-4" />
                    <span className="text-xs md:text-sm">Upcoming</span>
                  </TabsTrigger>
                  <TabsTrigger value="past" data-testid="button-date-past" className="flex-shrink-0">
                    <List className="mr-1.5 md:mr-2 h-3.5 w-3.5 md:h-4 md:w-4" />
                    <span className="text-xs md:text-sm">Past</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Simplified and Clean */}
      <main className="w-full px-4 md:px-6 py-4 md:py-6 max-w-7xl mx-auto">
        {/* Data Source Status - Compact */}
        {dataSourceStatus && (
          <div className="mb-4">
            <ConfigStatusBanner status={dataSourceStatus} />
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4">
            <div className="h-48 md:h-64 rounded-lg bg-card/50 animate-pulse" />
            <div className="h-96 rounded-lg bg-card/50 animate-pulse" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Apex Pick - Compact Version */}
            {apexPrediction && (
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Trophy className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                      <span className="text-xs md:text-sm font-medium text-primary uppercase">Top Pick</span>
                    </div>
                    <h2 className="text-base md:text-lg lg:text-xl font-bold mb-1" data-testid="text-match">
                      {apexPrediction.teams.home} vs {apexPrediction.teams.away}
                    </h2>
                    <p className="text-xs md:text-sm text-muted-foreground mb-3">{apexPrediction.league}</p>
                    <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm">
                      <div className="flex items-center gap-1.5">
                        <span className="text-muted-foreground">Bet:</span>
                        <span className="font-semibold" data-testid="text-bet-type">{apexPrediction.betType}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-muted-foreground">Odds:</span>
                        <span className="font-bold text-primary" data-testid="text-odds">{apexPrediction.bestOdds.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-muted-foreground">Confidence:</span>
                        <span className="font-semibold" data-testid="text-confidence">{Math.round(apexPrediction.confidenceScore)}%</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="default"
                    size="sm"
                    className="w-full md:w-auto"
                    data-testid="button-view-details"
                    onClick={() => navigate(`/match/${apexPrediction.id}`)}
                  >
                    View Full Analysis
                  </Button>
                </div>
              </div>
            )}

            {/* All Games - Clean List */}
            {groupedGames && groupedGames.leagues.length > 0 ? (
              <AllGamesList 
                groupedGames={groupedGames} 
                onGameClick={(game) => navigate(`/match/${game.id}`)}
              />
            ) : gamesLoading ? (
              <div className="text-center py-12 md:py-20">
                <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-b-2 border-primary mx-auto mb-3 md:mb-4"></div>
                <p className="text-sm md:text-base text-muted-foreground">Loading games...</p>
              </div>
            ) : (
              <div className="text-center py-12 md:py-20">
                <Trophy className="mx-auto h-10 w-10 md:h-12 md:w-12 text-muted-foreground/50 mb-3 md:mb-4" />
                <h3 className="text-base md:text-lg font-medium mb-2">No Games Available</h3>
                <p className="text-xs md:text-sm text-muted-foreground max-w-md mx-auto px-4">
                  No games found for the selected filters. Try changing your sport or date selection.
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-20">
        <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <p>© 2025 Apex AI Sports Prediction Engine. For informational purposes only.</p>
            <p className="font-mono">
              Last Updated: {apexPrediction ? new Date(apexPrediction.timestamp).toLocaleString() : 'N/A'}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
