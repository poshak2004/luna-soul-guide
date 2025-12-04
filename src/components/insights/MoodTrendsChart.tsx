import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, Calendar } from 'lucide-react';
import { format, subDays, startOfWeek, startOfMonth } from 'date-fns';

type TimeRange = 'week' | 'month' | 'all';

interface MoodDataPoint {
  date: string;
  mood: number;
  energy?: number;
}

export const MoodTrendsChart = () => {
  const [data, setData] = useState<MoodDataPoint[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMoodData = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let startDate: Date;
      switch (timeRange) {
        case 'week':
          startDate = subDays(new Date(), 7);
          break;
        case 'month':
          startDate = subDays(new Date(), 30);
          break;
        default:
          startDate = subDays(new Date(), 90);
      }

      const { data: moodData } = await supabase
        .from('mood_calendar')
        .select('date, mood_score, energy_level')
        .eq('user_id', user.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (moodData) {
        setData(
          moodData.map((d) => ({
            date: format(new Date(d.date), 'MMM d'),
            mood: d.mood_score,
            energy: d.energy_level || undefined,
          }))
        );
      }
      setLoading(false);
    };

    fetchMoodData();
  }, [timeRange]);

  const avgMood = data.length > 0
    ? (data.reduce((sum, d) => sum + d.mood, 0) / data.length).toFixed(1)
    : '–';

  return (
    <Card className="glass">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Mood Trends
          </CardTitle>
          <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
            <TabsList className="h-8">
              <TabsTrigger value="week" className="text-xs px-3">Week</TabsTrigger>
              <TabsTrigger value="month" className="text-xs px-3">Month</TabsTrigger>
              <TabsTrigger value="all" className="text-xs px-3">90 Days</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <p className="text-sm text-muted-foreground">
          Average mood: <span className="font-semibold text-primary">{avgMood}/10</span>
        </p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[200px] flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading...</div>
          </div>
        ) : data.length === 0 ? (
          <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground">
            <Calendar className="w-10 h-10 mb-2 opacity-50" />
            <p>No mood data yet</p>
            <p className="text-xs">Complete daily check-ins to see trends</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis domain={[0, 10]} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Area
                type="monotone"
                dataKey="mood"
                stroke="hsl(var(--primary))"
                fill="url(#moodGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
