import { BettingMarket } from '@shared/schema';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, ArrowUp, ArrowDown } from 'lucide-react';

interface AllMarketsPanelProps {
  markets: BettingMarket[];
}

export function AllMarketsPanel({ markets }: AllMarketsPanelProps) {
  if (!markets || markets.length === 0) {
    return null;
  }

  // Group markets by category
  const marketsByCategory = markets.reduce((acc, market) => {
    if (!acc[market.category]) {
      acc[market.category] = [];
    }
    acc[market.category].push(market);
    return acc;
  }, {} as Record<string, BettingMarket[]>);

  const categories = Object.keys(marketsByCategory);

  const getEdgeIcon = (edge: number) => {
    if (edge > 5) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (edge < -2) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getEdgeColor = (edge: number) => {
    if (edge > 8) return 'text-green-600 dark:text-green-400 font-bold';
    if (edge > 5) return 'text-green-600 dark:text-green-500';
    if (edge > 2) return 'text-yellow-600 dark:text-yellow-500';
    if (edge > 0) return 'text-muted-foreground';
    return 'text-red-600 dark:text-red-500';
  };

  const getCategoryName = (category: string) => {
    const names: Record<string, string> = {
      moneyline: 'Match Result',
      spread: 'Spread / Handicap',
      totals: 'Totals (Over/Under)',
      btts: 'Both Teams To Score',
      correct_score: 'Correct Score',
      half_full: 'Half-Time / Full-Time',
      handicap: 'Asian Handicap',
      double_chance: 'Double Chance',
      first_half: 'First Half',
      player_prop: 'Player Props',
      other: 'Other Markets',
    };
    return names[category] || category;
  };

  return (
    <Card className="border-border hover-elevate">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowUp className="h-5 w-5 text-primary" />
          All Betting Markets
        </CardTitle>
        <CardDescription>
          {markets.length} betting opportunities analyzed across {categories.length} market categories
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={categories[0]} className="w-full">
          <TabsList className="flex flex-wrap justify-start gap-1 h-auto bg-muted p-2">
            {categories.map((category) => (
              <TabsTrigger 
                key={category} 
                value={category} 
                data-testid={`tab-market-${category}`}
                className="flex-shrink-0 data-[state=active]:bg-background"
              >
                {getCategoryName(category)}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((category) => (
            <TabsContent key={category} value={category} className="space-y-3 mt-4">
              {marketsByCategory[category].map((market, index) => (
                <div
                  key={`${category}-${index}`}
                  className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                  data-testid={`market-${category}-${index}`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    {/* Selection */}
                    <div className="md:col-span-3">
                      <div className="text-sm text-muted-foreground mb-1">Selection</div>
                      <div className="font-semibold" data-testid={`text-selection-${category}-${index}`}>
                        {market.selection}
                      </div>
                      {market.line !== undefined && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Line: {market.line > 0 ? '+' : ''}{market.line}
                        </div>
                      )}
                    </div>

                    {/* Odds */}
                    <div className="md:col-span-2">
                      <div className="text-sm text-muted-foreground mb-1">Odds</div>
                      <div className="font-mono text-xl font-bold" data-testid={`text-odds-${category}-${index}`}>
                        {market.odds.toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">{market.bookmaker}</div>
                    </div>

                    {/* Probabilities */}
                    <div className="md:col-span-3">
                      <div className="text-sm text-muted-foreground mb-1">Probabilities</div>
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="text-xs text-muted-foreground">True</div>
                          <div className="font-mono font-semibold text-sm" data-testid={`text-calc-prob-${category}-${index}`}>
                            {market.calculatedProbability.ensembleAverage.toFixed(1)}%
                          </div>
                        </div>
                        <div className="text-muted-foreground">vs</div>
                        <div>
                          <div className="text-xs text-muted-foreground">Implied</div>
                          <div className="font-mono font-semibold text-sm" data-testid={`text-impl-prob-${category}-${index}`}>
                            {market.impliedProbability.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Edge & Confidence */}
                    <div className="md:col-span-2">
                      <div className="text-sm text-muted-foreground mb-1">Edge (EV)</div>
                      <div className={`flex items-center gap-1 ${getEdgeColor(market.edge)}`}>
                        {getEdgeIcon(market.edge)}
                        <span className="font-mono text-lg font-bold" data-testid={`text-edge-${category}-${index}`}>
                          {market.edge > 0 ? '+' : ''}{market.edge.toFixed(2)}%
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Confidence: <span className="font-mono">{market.confidenceScore.toFixed(0)}/100</span>
                      </div>
                    </div>

                    {/* Stake Recommendation */}
                    <div className="md:col-span-2">
                      <div className="text-sm text-muted-foreground mb-1">Stake</div>
                      <div className="font-mono font-semibold" data-testid={`text-stake-${category}-${index}`}>
                        {market.recommendedStake.kellyFraction}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {market.recommendedStake.percentageOfBankroll.toFixed(1)}% bankroll
                      </div>
                    </div>
                  </div>

                  {/* Market Metadata */}
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                    <Badge variant="outline" className="text-xs">
                      {market.marketLiquidity} Liquidity
                    </Badge>
                    {market.dataSources && market.dataSources.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        {market.dataSources.length} data sources
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
