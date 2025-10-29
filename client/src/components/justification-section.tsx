import { Justification, NewsItem } from '@shared/schema';
import { Card } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, TrendingUp, AlertCircle, Award, ChevronRight, Newspaper, Activity, UserPlus, Target, Info } from 'lucide-react';
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
                      Weight: {feature.weight.toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={feature.weight} className="h-2" />
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

        {/* News Intelligence */}
        {justification.detailedNews && (
          <AccordionItem value="news" className="border rounded-lg px-6">
            <AccordionTrigger className="hover:no-underline" data-testid="accordion-news">
              <div className="flex items-center gap-3">
                <Newspaper className="h-5 w-5 text-chart-2" />
                <span className="font-semibold">News Intelligence</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 pb-6">
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="injury">Injury</TabsTrigger>
                  <TabsTrigger value="form">Form</TabsTrigger>
                  <TabsTrigger value="transfer">Transfer</TabsTrigger>
                  <TabsTrigger value="tactical">Tactical</TabsTrigger>
                  <TabsTrigger value="general">General</TabsTrigger>
                </TabsList>
                
                {/* All News Tab */}
                <TabsContent value="all" className="mt-4">
                  <div className="space-y-4">
                    {justification.detailedNews.homeTeam.length > 0 && (
                      <div>
                        <h5 className="text-sm font-semibold text-muted-foreground mb-2">Home Team News</h5>
                        {justification.detailedNews.homeTeam.map((news: NewsItem, index: number) => (
                          <NewsCard key={index} news={news} />
                        ))}
                      </div>
                    )}
                    {justification.detailedNews.awayTeam.length > 0 && (
                      <div>
                        <h5 className="text-sm font-semibold text-muted-foreground mb-2">Away Team News</h5>
                        {justification.detailedNews.awayTeam.map((news: NewsItem, index: number) => (
                          <NewsCard key={index} news={news} />
                        ))}
                      </div>
                    )}
                    {justification.detailedNews.general.length > 0 && (
                      <div>
                        <h5 className="text-sm font-semibold text-muted-foreground mb-2">General News</h5>
                        {justification.detailedNews.general.map((news: NewsItem, index: number) => (
                          <NewsCard key={index} news={news} />
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Category-specific tabs */}
                {(['injury', 'form', 'transfer', 'tactical', 'general'] as const).map((category) => {
                  const allNews = justification.detailedNews ? [
                    ...justification.detailedNews.homeTeam,
                    ...justification.detailedNews.awayTeam,
                    ...justification.detailedNews.general
                  ] : [];
                  const categoryNews = allNews.filter((news: NewsItem) => news.category === category);
                  
                  return (
                    <TabsContent key={category} value={category} className="mt-4">
                      <div className="space-y-4">
                        {categoryNews.map((news: NewsItem, index: number) => (
                          <NewsCard key={index} news={news} />
                        ))}
                        {categoryNews.length === 0 && (
                          <p className="text-sm text-muted-foreground text-center py-8">No {category} news available</p>
                        )}
                      </div>
                    </TabsContent>
                  );
                })}
              </Tabs>
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
    </Card>
  );
}

function NewsCard({ news }: { news: NewsItem }) {
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-500/10 text-green-700 border-green-500/20';
      case 'negative': return 'bg-red-500/10 text-red-700 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
    }
  };

  const getRelevanceBadge = (relevance: string) => {
    switch (relevance) {
      case 'high': return <Badge className="bg-chart-1 text-white">High</Badge>;
      case 'medium': return <Badge className="bg-chart-4 text-white">Medium</Badge>;
      default: return <Badge variant="outline">Low</Badge>;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'injury': return <AlertCircle className="h-4 w-4" />;
      case 'form': return <Activity className="h-4 w-4" />;
      case 'transfer': return <UserPlus className="h-4 w-4" />;
      case 'tactical': return <Target className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  return (
    <div className={`p-4 rounded-lg border ${getSentimentColor(news.sentiment)} mb-3`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          {getCategoryIcon(news.category)}
          <h6 className="font-semibold text-sm">{news.headline}</h6>
        </div>
        <div className="flex items-center gap-2">
          {getRelevanceBadge(news.relevance)}
          <Badge variant="outline" className="text-xs">{news.sentiment}</Badge>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mb-2">{news.summary}</p>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="font-medium">{news.source}</span>
        {news.author && <span>• {news.author}</span>}
        <span>• {new Date(news.timestamp).toLocaleDateString()}</span>
      </div>
      {news.keywords && news.keywords.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {news.keywords.slice(0, 5).map((keyword: string, i: number) => (
            <Badge key={i} variant="secondary" className="text-xs">{keyword}</Badge>
          ))}
        </div>
      )}
    </div>
  );
}
