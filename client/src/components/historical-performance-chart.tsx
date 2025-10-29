import { useQuery } from '@tanstack/react-query';
import { SportType, HistoricalPerformance } from '@shared/schema';
import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface HistoricalPerformanceChartProps {
  sport?: SportType;
}

export function HistoricalPerformanceChart({ sport }: HistoricalPerformanceChartProps) {
  const { data: performance, isLoading } = useQuery<HistoricalPerformance[]>({
    queryKey: ['/api/historical-performance', sport],
    queryFn: async () => {
      const sportParam = sport ? `?sport=${sport}` : '';
      const response = await fetch(`/api/historical-performance${sportParam}`);
      if (!response.ok) throw new Error('Failed to fetch performance');
      return response.json();
    },
  });

  return (
    <Card className="p-6" data-testid="card-historical-performance">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="h-5 w-5 text-chart-1" />
        <h3 className="text-lg font-semibold">Historical Performance</h3>
      </div>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="text-sm text-muted-foreground">Loading performance data...</div>
        </div>
      ) : performance && performance.length > 0 ? (
        <div className="space-y-6">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={performance}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="accuracy" 
                stroke="hsl(var(--chart-1))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--chart-1))' }}
                name="Accuracy %"
              />
              <Line 
                type="monotone" 
                dataKey="roi" 
                stroke="hsl(var(--chart-3))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--chart-3))' }}
                name="ROI %"
              />
            </LineChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-muted/30 border border-border">
              <p className="text-xs text-muted-foreground mb-1">Avg Accuracy</p>
              <p className="text-lg font-bold font-mono">
                {(performance.reduce((acc, p) => acc + p.accuracy, 0) / performance.length).toFixed(1)}%
              </p>
            </div>
            <div className="p-3 rounded-lg bg-muted/30 border border-border">
              <p className="text-xs text-muted-foreground mb-1">Avg ROI</p>
              <p className="text-lg font-bold font-mono text-chart-3">
                {(performance.reduce((acc, p) => acc + p.roi, 0) / performance.length).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">No historical data available</p>
          </div>
        </div>
      )}
    </Card>
  );
}
