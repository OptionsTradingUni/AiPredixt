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
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const [selectedSport, setSelectedSport] = useState<SportType | 'All'>('All');

  const { data: apexPrediction, isLoading, refetch } = useQuery<ApexPrediction>({
    queryKey: ['/api/apex-prediction', selectedSport],
    queryFn: async () => {
      const sportParam = selectedSport !== 'All' ? `?sport=${selectedSport}` : '';
      const response = await fetch(`/api/apex-prediction${sportParam}`);
      if (!response.ok) throw new Error('Failed to fetch prediction');
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
                <p className="text-xs text-muted-foreground">Prediction Engine</p>
              </div>
            </div>
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

            {/* Main Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column - Primary Content */}
              <div className="lg:col-span-8 space-y-8">
                {/* Metrics Grid */}
                <MetricsGrid prediction={apexPrediction} />

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
