import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle2, Info, Zap } from 'lucide-react';

interface ConfigStatusBannerProps {
  isRealData?: boolean;
}

export function ConfigStatusBanner({ isRealData = false }: ConfigStatusBannerProps) {
  if (isRealData) {
    return (
      <Alert className="border-green-500/50 bg-green-500/10" data-testid="banner-real-data">
        <CheckCircle2 className="h-5 w-5 text-green-500" />
        <AlertTitle className="text-green-700 dark:text-green-400">Live Data Active</AlertTitle>
        <AlertDescription className="text-sm text-muted-foreground">
          Using real odds and game data from API sources. All 406+ advanced factors are being analyzed.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="border-yellow-500/50 bg-yellow-500/10" data-testid="banner-mock-data">
      <AlertTriangle className="h-5 w-5 text-yellow-600" />
      <AlertTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
        Mock Data Mode
        <Badge variant="outline" className="font-mono text-xs">
          Development
        </Badge>
      </AlertTitle>
      <AlertDescription className="space-y-3 text-sm">
        <div className="flex items-start gap-3">
          <Info className="h-4 w-4 mt-0.5 text-yellow-600 shrink-0" />
          <div className="space-y-2">
            <p className="text-muted-foreground">
              <strong>Current Status:</strong> Showing simulated games with fake odds. The 406+ APEX advanced factors <strong>ARE being analyzed</strong>, but predictions won't be accurate until you configure real data sources.
            </p>
            <div className="flex flex-wrap gap-2 items-center">
              <Zap className="h-4 w-4 text-yellow-600" />
              <span className="font-semibold text-foreground">Quick Setup:</span>
              <code className="px-2 py-1 bg-muted rounded text-xs">
                API_FOOTBALL_KEY=your_key
              </code>
              <code className="px-2 py-1 bg-muted rounded text-xs">
                ODDS_API_KEY=your_key
              </code>
            </div>
            <p className="text-xs text-muted-foreground">
              Get keys from{' '}
              <a
                href="https://www.api-football.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-primary"
              >
                API-Football
              </a>{' '}
              and{' '}
              <a
                href="https://the-odds-api.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-primary"
              >
                The Odds API
              </a>
            </p>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}
