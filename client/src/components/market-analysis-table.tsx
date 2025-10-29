import { ApexPrediction } from '@shared/schema';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, DollarSign } from 'lucide-react';

interface MarketAnalysisTableProps {
  prediction: ApexPrediction;
}

export function MarketAnalysisTable({ prediction }: MarketAnalysisTableProps) {
  const getLiquidityBadge = (liquidity: string) => {
    switch (liquidity) {
      case 'High':
        return <Badge className="bg-chart-3 text-white">High</Badge>;
      case 'Medium':
        return <Badge className="bg-chart-4 text-white">Medium</Badge>;
      case 'Low':
        return <Badge className="bg-destructive text-destructive-foreground">Low</Badge>;
      default:
        return <Badge variant="outline">{liquidity}</Badge>;
    }
  };

  return (
    <Card className="p-8" data-testid="card-market-analysis">
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="h-6 w-6 text-chart-1" />
        <h3 className="text-2xl font-semibold tracking-tight">Market Analysis & Stake Recommendation</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-border">
              <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Metric
              </th>
              <th className="text-right py-4 px-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Value
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            <tr className="hover-elevate">
              <td className="py-4 px-4 text-sm font-medium">Market Liquidity</td>
              <td className="py-4 px-4 text-right">
                {getLiquidityBadge(prediction.marketLiquidity)}
              </td>
            </tr>
            <tr className="hover-elevate">
              <td className="py-4 px-4 text-sm font-medium">Bookmaker</td>
              <td className="py-4 px-4 text-right font-mono text-sm">
                {prediction.bookmaker}
              </td>
            </tr>
            <tr className="hover-elevate">
              <td className="py-4 px-4 text-sm font-medium">Best Available Odds</td>
              <td className="py-4 px-4 text-right font-mono text-lg font-semibold text-primary">
                {prediction.bestOdds.toFixed(2)}
              </td>
            </tr>
            <tr className="hover-elevate bg-muted/30">
              <td className="py-4 px-4 text-sm font-semibold">Kelly Fraction</td>
              <td className="py-4 px-4 text-right font-mono text-lg font-bold">
                {prediction.recommendedStake.kellyFraction}
              </td>
            </tr>
            <tr className="hover-elevate bg-muted/30">
              <td className="py-4 px-4 text-sm font-semibold">Recommended Stake Size</td>
              <td className="py-4 px-4 text-right font-mono text-lg font-bold text-chart-3">
                {prediction.recommendedStake.percentageOfBankroll.toFixed(2)}% of bankroll
              </td>
            </tr>
            <tr className="hover-elevate">
              <td className="py-4 px-4 text-sm font-medium" colSpan={2}>
                <div className="flex items-start gap-3">
                  <DollarSign className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-muted-foreground">
                    <span className="font-semibold">Unit Description: </span>
                    {prediction.recommendedStake.unitDescription}
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-6 p-4 rounded-lg bg-chart-1/10 border border-chart-1/20">
        <p className="text-xs text-muted-foreground leading-relaxed">
          <span className="font-semibold">Note:</span> Stake sizes are calculated using fractional Kelly Criterion 
          adjusted for confidence score and risk assessment. User should define actual unit value based on their 
          personal bankroll and risk tolerance.
        </p>
      </div>
    </Card>
  );
}
