import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { FileText } from 'lucide-react';

export const WellnessReport = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: moodData } = await supabase
        .from('mood_calendar')
        .select('date, mood_score')
        .eq('user_id', user.id)
        .order('date', { ascending: true })
        .limit(30);

      setData(moodData || []);
      setLoading(false);
    };

    fetchReport();
  }, []);

  if (loading) return <Card className="glass"><CardContent className="pt-6">Loading...</CardContent></Card>;

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-secondary" />
          30-Day Wellness Trend
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
            <YAxis stroke="hsl(var(--muted-foreground))" />
            <Tooltip />
            <Line type="monotone" dataKey="mood_score" stroke="hsl(var(--primary))" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
