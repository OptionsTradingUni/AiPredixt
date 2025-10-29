import { Justification } from '@shared/schema';
import { Card } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CheckCircle2, TrendingUp, AlertCircle, Award, ChevronRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface JustificationSectionProps {
  justification: Justification;
}

export function JustificationSection({ justification }: JustificationSectionProps) {
  return (
    <Card className="p-8" data-testid="card-justification">
      <div className="flex items-center gap-3 mb-6">
        <Award className="h-6 w-6 text-primary" />
        <h3 className="text-2xl font-semibold tracking-tight">Comprehensive Justification</h3>
      </div>

      {/* Summary */}
      <div className="p-6 rounded-lg bg-primary/5 border border-primary/20 mb-6">
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Executive Summary
        </h4>
        <p className="text-lg leading-relaxed" data-testid="text-summary">
          {justification.summary}
        </p>
      </div>

      {/* Expandable Sections */}
      <Accordion type="multiple" className="space-y-4">
        {/* Deep Dive */}
        <AccordionItem value="deepdive" className="border rounded-lg px-6">
          <AccordionTrigger className="hover:no-underline" data-testid="accordion-deepdive">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-chart-3" />
              <span className="font-semibold">Deep Dive Analysis</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-6">
            <ul className="space-y-3">
              {justification.deepDive.map((point, index) => (
                <li key={index} className="flex items-start gap-3 text-sm leading-relaxed">
                  <ChevronRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>

        {/* Competitive Edge */}
        <AccordionItem value="edge" className="border rounded-lg px-6">
          <AccordionTrigger className="hover:no-underline" data-testid="accordion-edge">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-chart-1" />
              <span className="font-semibold">Competitive Edge</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-6">
            <ul className="space-y-3">
              {justification.competitiveEdge.map((point, index) => (
                <li key={index} className="flex items-start gap-3 p-3 rounded-lg bg-chart-1/10 border border-chart-1/20">
                  <TrendingUp className="h-4 w-4 text-chart-1 mt-0.5 flex-shrink-0" />
                  <span className="text-sm leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>

        {/* Narrative Debunking */}
        {justification.narrativeDebunking && (
          <AccordionItem value="narrative" className="border rounded-lg px-6">
            <AccordionTrigger className="hover:no-underline" data-testid="accordion-narrative">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-chart-4" />
                <span className="font-semibold">Narrative Debunking</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 pb-6">
              <p className="text-sm leading-relaxed" data-testid="text-narrative">
                {justification.narrativeDebunking}
              </p>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Explainability */}
        <AccordionItem value="explainability" className="border rounded-lg px-6">
          <AccordionTrigger className="hover:no-underline" data-testid="accordion-explainability">
            <div className="flex items-center gap-3">
              <Award className="h-5 w-5 text-primary" />
              <span className="font-semibold">Key Features & Causal Links</span>
              <span className="ml-auto mr-4 text-sm font-mono text-muted-foreground">
                Explainability: {justification.explainabilityScore}/10
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-6">
            <div className="space-y-4">
              {justification.keyFeatures.map((feature, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">{feature.feature}</span>
                    <span className="text-sm font-mono text-muted-foreground">
                      Weight: {(feature.weight * 100).toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={feature.weight * 100} className="h-2" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    <div className="text-xs">
                      <span className="font-medium text-muted-foreground">Impact: </span>
                      <span>{feature.impact}</span>
                    </div>
                    <div className="text-xs">
                      <span className="font-medium text-muted-foreground">Causal Link: </span>
                      <span>{feature.causalLink}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}
