import { RiskAssessment } from '@shared/schema';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Activity, Zap, Shield } from 'lucide-react';

interface RiskAssessmentPanelProps {
  riskAssessment: RiskAssessment;
}

export function RiskAssessmentPanel({ riskAssessment }: RiskAssessmentPanelProps) {
  return (
    <Card className="p-8" data-testid="card-risk-assessment">
      <div className="flex items-center gap-3 mb-6">
        <AlertTriangle className="h-6 w-6 text-chart-4" />
        <h3 className="text-2xl font-semibold tracking-tight">Risk Assessment</h3>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6">
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="sensitivity" data-testid="tab-sensitivity">Sensitivity</TabsTrigger>
          <TabsTrigger value="adversarial" data-testid="tab-adversarial">Adversarial</TabsTrigger>
          <TabsTrigger value="blackswan" data-testid="tab-blackswan">Black Swan</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Value at Risk (VaR)
                </span>
              </div>
              <p className="text-3xl font-bold font-mono" data-testid="text-var">
                {riskAssessment.var.toFixed(2)}%
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Conditional VaR (CVaR)
                </span>
              </div>
              <p className="text-3xl font-bold font-mono" data-testid="text-cvar">
                {riskAssessment.cvar.toFixed(2)}%
              </p>
            </div>
          </div>

          <div className="space-y-4 mt-6">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Key Risk Factors
            </h4>
            <div className="space-y-2">
              {riskAssessment.keyRisks.map((risk, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border">
                  <AlertTriangle className="h-4 w-4 text-chart-4 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{risk}</p>
                </div>
              ))}
            </div>
          </div>

          {riskAssessment.potentialFailures.length > 0 && (
            <div className="space-y-4 mt-6">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Potential Failure Modes
              </h4>
              <div className="space-y-2">
                {riskAssessment.potentialFailures.map((failure, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <Shield className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                    <p className="text-sm">{failure}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="sensitivity" className="space-y-4">
          <div className="p-6 rounded-lg bg-muted/30 border border-border">
            <h4 className="text-sm font-semibold mb-3">Sensitivity Analysis</h4>
            <p className="text-sm leading-relaxed" data-testid="text-sensitivity">
              {riskAssessment.sensitivityAnalysis}
            </p>
          </div>
        </TabsContent>

        <TabsContent value="adversarial" className="space-y-4">
          <div className="p-6 rounded-lg bg-muted/30 border border-border">
            <h4 className="text-sm font-semibold mb-3">Adversarial Simulation Results</h4>
            <p className="text-sm leading-relaxed" data-testid="text-adversarial">
              {riskAssessment.adversarialSimulation}
            </p>
          </div>
        </TabsContent>

        <TabsContent value="blackswan" className="space-y-4">
          <div className="p-6 rounded-lg bg-muted/30 border border-border">
            <h4 className="text-sm font-semibold mb-3">Black Swan Resilience Assessment</h4>
            <p className="text-sm leading-relaxed" data-testid="text-blackswan">
              {riskAssessment.blackSwanResilience}
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
