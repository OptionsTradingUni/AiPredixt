import { ContingencyPick } from '@shared/schema';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ContingencyPickCardProps {
  contingency: ContingencyPick;
}

export function ContingencyPickCard({ contingency }: ContingencyPickCardProps) {
  return (
    <Card className="p-6" data-testid="card-contingency">
      <div className="flex items-center gap-2 mb-4">
        <ArrowRight className="h-5 w-5 text-chart-2" />
        <h3 className="text-lg font-semibold">Contingency Pick</h3>
      </div>

      <div className="space-y-4">
        <div>
          <Badge variant="outline" className="mb-2">
            {contingency.sport}
          </Badge>
          <h4 className="font-semibold text-sm mb-1" data-testid="text-contingency-match">
            {contingency.match}
          </h4>
          <p className="text-sm text-muted-foreground" data-testid="text-contingency-bet">
            {contingency.betType}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Odds</p>
            <p className="text-xl font-bold font-mono" data-testid="text-contingency-odds">
              {contingency.odds.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Confidence</p>
            <p className="text-xl font-bold font-mono" data-testid="text-contingency-confidence">
              {Math.round(contingency.confidenceScore)}
            </p>
          </div>
        </div>

        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Confidence Level</p>
          <Progress value={contingency.confidenceScore} className="h-2" />
        </div>

        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Stake Size</p>
          <p className="text-sm font-mono font-semibold" data-testid="text-contingency-stake">
            {contingency.stakeSize}
          </p>
        </div>

        <div className="pt-4 border-t border-border">
          <div className="flex items-start gap-2 mb-3">
            <AlertCircle className="h-4 w-4 text-chart-4 mt-0.5 flex-shrink-0" />
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Trigger Conditions
            </p>
          </div>
          <ul className="space-y-2">
            {contingency.triggerConditions.map((condition, index) => (
              <li key={index} className="text-xs leading-relaxed pl-6 relative before:content-['•'] before:absolute before:left-2">
                {condition}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}
