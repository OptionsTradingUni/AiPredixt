import { ApexPrediction } from '@shared/schema';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, TrendingUp, Target, Activity, HelpCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ApexPickCardProps {
  prediction: ApexPrediction;
}

export function ApexPickCard({ prediction }: ApexPickCardProps) {
  const getLiquidityColor = (liquidity: string) => {
    switch (liquidity) {
      case 'High': return 'bg-chart-3 text-white';
      case 'Medium': return 'bg-chart-4 text-white';
      case 'Low': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="p-8 border-2" data-testid="card-apex-pick">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Badge variant="outline" className="text-sm font-medium">
              {prediction.sport}
            </Badge>
            <Badge className={`${getLiquidityColor(prediction.marketLiquidity)} text-xs`}>
              {prediction.marketLiquidity} Liquidity
            </Badge>
          </div>
          <h2 className="text-3xl font-bold tracking-tight mb-2" data-testid="text-match">
            {prediction.teams.home} vs {prediction.teams.away}
          </h2>
          <p className="text-muted-foreground">{prediction.league}</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span className="font-mono">{new Date(prediction.timestamp).toLocaleString()}</span>
        </div>
      </div>

      {/* Bet Type Banner */}
      <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Target className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Apex Bet Recommendation
          </span>
        </div>
        <p className="text-2xl font-semibold" data-testid="text-bet-type">
          {prediction.betType}
        </p>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {/* Best Odds */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Best Odds
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold font-mono text-primary" data-testid="text-odds">
              {prediction.bestOdds.toFixed(2)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">{prediction.bookmaker}</p>
        </div>

        {/* Edge (EV%) */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-3 w-3 text-chart-3" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Edge (EV%)
            </span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="font-semibold mb-1">What is Edge/EV?</p>
                  <p className="text-sm">Edge (Expected Value) is your profit advantage. If our calculated probability is 58% but bookmaker odds imply 55%, you have a +3% edge. Over many bets, this translates to consistent profit. Positive edge = good bet, negative edge = bad bet.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold font-mono text-chart-3" data-testid="text-edge">
              +{prediction.edge.toFixed(2)}%
            </span>
          </div>
          <p className="text-xs text-muted-foreground">Expected Value</p>
        </div>

        {/* Confidence Score */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Activity className="h-3 w-3 text-chart-1" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Confidence
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold font-mono" data-testid="text-confidence">
              {Math.round(prediction.confidenceScore)}
            </span>
            <span className="text-xl font-semibold text-muted-foreground">/100</span>
          </div>
          <Progress value={prediction.confidenceScore} className="h-2" />
        </div>

        {/* Prediction Stability */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide block">
            Stability
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-semibold" data-testid="text-stability">
              {prediction.predictionStability}
            </span>
          </div>
          <Progress 
            value={prediction.predictionStability === 'High' ? 90 : prediction.predictionStability === 'Medium' ? 60 : 30} 
            className="h-2"
          />
        </div>
      </div>
    </Card>
  );
}
