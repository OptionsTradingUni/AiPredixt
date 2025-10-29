import { ApexPrediction } from '@shared/schema';
import { Card } from '@/components/ui/card';
import { Percent, Calculator, TrendingUp, Gauge, HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface MetricsGridProps {
  prediction: ApexPrediction;
}

export function MetricsGrid({ prediction }: MetricsGridProps) {
  const metrics = [
    {
      icon: Calculator,
      label: 'Calculated True Probability',
      value: `${prediction.calculatedProbability.ensembleAverage.toFixed(2)}%`,
      sublabel: `Range: ${prediction.calculatedProbability.calibratedRange.lower.toFixed(1)}% - ${prediction.calculatedProbability.calibratedRange.upper.toFixed(1)}%`,
      testId: 'text-calculated-probability',
    },
    {
      icon: Percent,
      label: 'Implied Probability',
      value: `${prediction.impliedProbability.toFixed(2)}%`,
      sublabel: 'From market odds',
      testId: 'text-implied-probability',
    },
    {
      icon: TrendingUp,
      label: 'Recommended Stake',
      value: prediction.recommendedStake.kellyFraction,
      sublabel: `${prediction.recommendedStake.percentageOfBankroll.toFixed(1)}% of bankroll`,
      testId: 'text-stake',
    },
    {
      icon: Gauge,
      label: 'Prediction Stability Score',
      value: prediction.predictionStability,
      sublabel: 'Robustness to data changes',
      testId: 'text-stability-score',
    },
  ];

  return (
    <TooltipProvider>
      <Card className="p-8" data-testid="card-metrics">
        <div className="flex items-center gap-3 mb-6">
          <h3 className="text-2xl font-semibold tracking-tight">Key Metrics</h3>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-5 w-5 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-sm">
              <p className="font-semibold mb-1">Understanding Probabilities</p>
              <p className="text-sm mb-2"><strong>Calculated Probability:</strong> Our true estimate based on 20+ data sources and 490+ factors. Example: 58% home win means we think they have a 58% chance to win.</p>
              <p className="text-sm"><strong>Implied Probability:</strong> What the bookmaker's odds suggest. The difference between these two creates your edge!</p>
            </TooltipContent>
          </Tooltip>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <div
                key={index}
                className="flex items-start gap-4 p-4 rounded-lg bg-muted/30 border border-border"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary/10 text-primary flex-shrink-0">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                    {metric.label}
                  </p>
                  <p className="text-2xl font-bold font-mono mb-1" data-testid={metric.testId}>
                    {metric.value}
                  </p>
                  {metric.sublabel && (
                    <p className="text-xs text-muted-foreground">
                      {metric.sublabel}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </TooltipProvider>
  );
}
