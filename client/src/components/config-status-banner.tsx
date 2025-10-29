import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle2, Info, Zap, Globe } from 'lucide-react';

interface DataSourceStatus {
  isRealData: boolean;
  apis: {
    oddsApi: boolean;
    sportsApi: boolean;
  };
  scrapingSources: string[];
  totalSources: number;
}

interface ConfigStatusBannerProps {
  status: DataSourceStatus;
}

export function ConfigStatusBanner({ status }: ConfigStatusBannerProps) {
  const { isRealData, apis, scrapingSources, totalSources } = status;
  
  if (isRealData) {
    return (
      <Alert className="border-green-500/50 bg-green-500/10" data-testid="banner-real-data">
        <CheckCircle2 className="h-5 w-5 text-green-500" />
        <AlertTitle className="text-green-700 dark:text-green-400">Live Data Active</AlertTitle>
        <AlertDescription className="space-y-2 text-sm">
          <p className="text-muted-foreground">
            Using real odds and game data from {totalSources}+ sources. All 490+ advanced factors are being analyzed.
          </p>
          <div className="flex flex-wrap gap-2 items-center text-xs">
            <Globe className="h-4 w-4 text-green-600" />
            <span className="font-semibold text-foreground">Active Sources:</span>
            {scrapingSources.slice(0, 3).map((source) => (
              <Badge key={source} variant="outline" className="font-mono text-xs">
                {source}
              </Badge>
            ))}
            {scrapingSources.length > 3 && (
              <Badge variant="outline" className="font-mono text-xs">
                +{scrapingSources.length - 3} more
              </Badge>
            )}
          </div>
          {apis.oddsApi && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3 w-3 text-green-500" />
              <span>Odds API configured</span>
            </div>
          )}
          {apis.sportsApi && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3 w-3 text-green-500" />
              <span>API-Football configured</span>
            </div>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="border-blue-500/50 bg-blue-500/10" data-testid="banner-scraping-mode">
      <Info className="h-5 w-5 text-blue-600" />
      <AlertTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
        Web Scraping Mode
        <Badge variant="outline" className="font-mono text-xs">
          Active
        </Badge>
      </AlertTitle>
      <AlertDescription className="space-y-3 text-sm">
        <div className="flex items-start gap-3">
          <Globe className="h-4 w-4 mt-0.5 text-blue-600 shrink-0" />
          <div className="space-y-2">
            <p className="text-muted-foreground">
              <strong>Current Status:</strong> Using web scraping from {scrapingSources.length} sources including {scrapingSources.slice(0, 2).join(', ')}. All 490+ APEX advanced factors are being analyzed with real scraped data.
            </p>
            <div className="flex flex-wrap gap-2 items-center">
              <Zap className="h-4 w-4 text-blue-600" />
              <span className="font-semibold text-foreground">Optional Enhancement:</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Add API keys for even more data sources (optional - scraping already provides comprehensive data):
            </p>
            <div className="flex flex-wrap gap-2">
              <code className="px-2 py-1 bg-muted rounded text-xs">
                ODDS_API_KEY=your_key
              </code>
              <code className="px-2 py-1 bg-muted rounded text-xs">
                API_FOOTBALL_KEY=your_key
              </code>
            </div>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}
