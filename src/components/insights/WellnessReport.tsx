import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { FileText, Download, Loader2, RefreshCw } from 'lucide-react';

export const WellnessReport = () => {
  const [data, setData] = useState<any[]>([]);
  const [activityData, setActivityData] = useState<any[]>([]);
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [streakDays, setStreakDays] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);

  const fetchReport = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [moodResult, activityResult, profileResult] = await Promise.all([
      supabase
        .from('mood_calendar')
        .select('date, mood_score, mood_label')
        .eq('user_id', user.id)
        .order('date', { ascending: true })
        .limit(30),
      supabase
        .from('user_activities')
        .select('activity_type, completed_at, points_earned')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(50),
      supabase
        .from('user_profiles')
        .select('current_streak, total_points')
        .eq('user_id', user.id)
        .single()
    ]);

    setData(moodResult.data || []);
    setActivityData(activityResult.data || []);
    setStreakDays(profileResult.data?.current_streak || 0);
    setTotalPoints(profileResult.data?.total_points || 0);
    setLoading(false);
  };

  const generateSummary = async () => {
    setSummaryLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('generate-weekly-summary', {
        body: { moodData: data, activityData, streakDays, totalPoints },
      });

      if (error) throw error;
      setSummary(result?.summary || 'Keep up the great work on your wellness journey!');
    } catch (error) {
      console.error('Summary generation error:', error);
      setSummary('Your dedication to wellness is inspiring. Keep going! 🌸');
    } finally {
      setSummaryLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  useEffect(() => {
    if (!loading && (data.length > 0 || activityData.length > 0)) {
      generateSummary();
    }
  }, [loading]);

  const handleExport = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      summary,
      stats: { totalPoints, streakDays, moodEntries: data.length, activities: activityData.length },
      moodData: data,
      activityData,
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wellness-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <Card className="glass"><CardContent className="pt-6">Loading...</CardContent></Card>;

  return (
    <Card className="glass">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-secondary" />
          Weekly Wellness Report
        </CardTitle>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="w-4 h-4 mr-2" /> Export
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* AI Summary */}
        <div className="bg-muted/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Luna's Summary</span>
            <Button variant="ghost" size="sm" onClick={generateSummary} disabled={summaryLoading}>
              {summaryLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            </Button>
          </div>
          {summaryLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Luna is analyzing your week...
            </div>
          ) : (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{summary}</p>
          )}
        </div>

        {/* Chart */}
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={10} />
            <YAxis stroke="hsl(var(--muted-foreground))" domain={[1, 10]} />
            <Tooltip />
            <Line type="monotone" dataKey="mood_score" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
