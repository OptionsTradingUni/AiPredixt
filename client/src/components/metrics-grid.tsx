import { ApexPrediction } from '@shared/schema';
import { Card } from '@/components/ui/card';
import { Percent, Calculator, TrendingUp, Gauge } from 'lucide-react';

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
    <Card className="p-8" data-testid="card-metrics">
      <h3 className="text-2xl font-semibold tracking-tight mb-6">Key Metrics</h3>
      
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
  );
}
