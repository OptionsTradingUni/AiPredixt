import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SportType, ApexPrediction } from '@shared/schema';
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
import { LeagueGroupedGames } from '@/components/league-grouped-games';
import { RefreshCw, List, Calendar, Clock, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'wouter';

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

  const { data: allPredictions, isLoading: allLoading, refetch: refetchAll } = useQuery<ApexPrediction[]>({
    queryKey: ['/api/all-predictions', selectedSport, selectedDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedSport !== 'All') params.set('sport', selectedSport);
      params.set('date', selectedDate);
      const queryString = params.toString();
      const response = await fetch(`/api/all-predictions${queryString ? `?${queryString}` : ''}`);
      if (!response.ok) throw new Error('Failed to fetch predictions');
      return response.json();
    },
  });

  const isLoading = apexLoading || allLoading;
  const refetch = () => {
    refetchApex();
    refetchAll();
  };

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
                <p className="text-xs text-muted-foreground">Prediction Engine</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Link href="/all-games">
                <Button
                  size="sm"
                  variant="ghost"
                  data-testid="link-all-games"
                  className="gap-2"
                >
                  <List className="h-4 w-4" />
                  <span className="hidden sm:inline">All Games</span>
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
        <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 py-6 space-y-6">
          <SportFilter
            selectedSport={selectedSport}
            onSelectSport={setSelectedSport}
          />
          
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
                <List className="mr-2 h-4 w-4" />
                Past Results
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 py-8">
        {/* Configuration Status Banner */}
        {dataSourceStatus && (
          <div className="mb-8">
            <ConfigStatusBanner status={dataSourceStatus} />
          </div>
        )}

        {isLoading ? (
          <div className="space-y-8">
            <div className="h-96 rounded-lg bg-card animate-pulse" />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-8">
                <div className="h-64 rounded-lg bg-card animate-pulse" />
                <div className="h-96 rounded-lg bg-card animate-pulse" />
              </div>
              <div className="lg:col-span-4 space-y-8">
                <div className="h-80 rounded-lg bg-card animate-pulse" />
              </div>
            </div>
          </div>
        ) : apexPrediction ? (
          <div className="space-y-8">
            {/* Apex Pick Hero Card */}
            <ApexPickCard prediction={apexPrediction} />

            {/* All Games Grouped by League */}
            {allPredictions && allPredictions.length > 0 && (
              <LeagueGroupedGames predictions={allPredictions} />
            )}

            {/* Main Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column - Primary Content */}
              <div className="lg:col-span-8 space-y-8">
                {/* Metrics Grid */}
                <MetricsGrid prediction={apexPrediction} />

                {/* All Betting Markets */}
                {apexPrediction.markets && apexPrediction.markets.length > 0 && (
                  <AllMarketsPanel markets={apexPrediction.markets} />
                )}

                {/* Risk Assessment */}
                <RiskAssessmentPanel riskAssessment={apexPrediction.riskAssessment} />

                {/* Justification */}
                <JustificationSection justification={apexPrediction.justification} />

                {/* Market Analysis */}
                <MarketAnalysisTable prediction={apexPrediction} />
              </div>

              {/* Right Column - Sidebar */}
              <div className="lg:col-span-4 space-y-8">
                {/* Contingency Pick */}
                <ContingencyPickCard contingency={apexPrediction.contingencyPick} />

                {/* Historical Performance */}
                <HistoricalPerformanceChart sport={selectedSport === 'All' ? undefined : selectedSport} />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <RefreshCw className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Prediction Available</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Click refresh to fetch the latest Apex prediction
              </p>
              <Button onClick={() => refetch()} data-testid="button-refresh-empty">
                Fetch Prediction
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
              Last Updated: {apexPrediction ? new Date(apexPrediction.timestamp).toLocaleString() : 'N/A'}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
