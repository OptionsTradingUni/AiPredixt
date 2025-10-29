import { useState } from 'react';
import { LeagueInfo } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Globe, Trophy } from 'lucide-react';

interface LeagueCategorizationProps {
  leagues: LeagueInfo[];
  onLeagueSelect?: (league: LeagueInfo) => void;
  selectedLeague?: string;
}

export function LeagueCategorization({ leagues, onLeagueSelect, selectedLeague }: LeagueCategorizationProps) {
  const [expandedRegions, setExpandedRegions] = useState<Set<string>>(new Set(['Europe']));

  // Group leagues by region, then by country
  const leaguesByRegion = leagues.reduce((acc, league) => {
    if (!acc[league.region]) {
      acc[league.region] = {};
    }
    if (!acc[league.region][league.country]) {
      acc[league.region][league.country] = [];
    }
    acc[league.region][league.country].push(league);
    return acc;
  }, {} as Record<string, Record<string, LeagueInfo[]>>);

  const toggleRegion = (region: string) => {
    const newExpanded = new Set(expandedRegions);
    if (newExpanded.has(region)) {
      newExpanded.delete(region);
    } else {
      newExpanded.add(region);
    }
    setExpandedRegions(newExpanded);
  };

  const getPopularityColor = (popularity: string) => {
    switch (popularity) {
      case 'High': return 'bg-green-500/10 text-green-700 dark:text-green-400';
      case 'Medium': return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400';
      case 'Low': return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
      default: return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
    }
  };

  const getTierBadgeVariant = (tier: string) => {
    if (tier.includes('1st')) return 'default';
    if (tier.includes('International') || tier.includes('Champions')) return 'secondary';
    return 'outline';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          League Categories
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(leaguesByRegion)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([region, countries]) => (
            <Collapsible
              key={region}
              open={expandedRegions.has(region)}
              onOpenChange={() => toggleRegion(region)}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between font-semibold"
                  data-testid={`region-toggle-${region.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <span className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    {region}
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="font-mono text-xs">
                      {Object.values(countries).flat().length}
                    </Badge>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        expandedRegions.has(region) ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2 space-y-3 pl-6">
                {Object.entries(countries)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([country, countryLeagues]) => (
                    <div key={country} className="space-y-2">
                      <div className="text-sm font-medium text-muted-foreground">
                        {country}
                      </div>
                      <div className="space-y-1">
                        {countryLeagues.map((league) => (
                          <Button
                            key={league.name}
                            variant={selectedLeague === league.name ? 'secondary' : 'ghost'}
                            className="w-full justify-start text-left h-auto py-2"
                            onClick={() => onLeagueSelect?.(league)}
                            data-testid={`league-button-${league.name.toLowerCase().replace(/\s+/g, '-')}`}
                          >
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">
                                  {league.displayName}
                                </span>
                                <div className="flex items-center gap-1">
                                  <Badge
                                    variant={getTierBadgeVariant(league.tier)}
                                    className="text-xs"
                                  >
                                    {league.tier}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Trophy className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                  {league.type}
                                </span>
                                <Badge
                                  className={`text-xs ${getPopularityColor(league.popularity)}`}
                                  variant="outline"
                                >
                                  {league.popularity}
                                </Badge>
                              </div>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
              </CollapsibleContent>
            </Collapsible>
          ))}
      </CardContent>
    </Card>
  );
}
