import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { Activity } from 'lucide-react';

interface ActivityData {
  name: string;
  value: number;
  color: string;
}

const activityColors: Record<string, string> = {
  breathing_exercise: 'hsl(180, 70%, 50%)',
  meditation_exercise: 'hsl(260, 70%, 60%)',
  grounding_exercise: 'hsl(140, 60%, 50%)',
  progressive_exercise: 'hsl(30, 80%, 55%)',
  journal_entry: 'hsl(340, 70%, 60%)',
  sound_session: 'hsl(210, 70%, 55%)',
  chat: 'hsl(300, 60%, 55%)',
};

const activityLabels: Record<string, string> = {
  breathing_exercise: 'Breathing',
  meditation_exercise: 'Meditation',
  grounding_exercise: 'Grounding',
  progressive_exercise: 'Progressive',
  journal_entry: 'Journal',
  sound_session: 'Sound Therapy',
  chat: 'Chat',
};

export const ActivityPieChart = () => {
  const [data, setData] = useState<ActivityData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivityData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: activities } = await supabase
        .from('user_activities')
        .select('activity_type')
        .eq('user_id', user.id);

      if (activities) {
        const counts: Record<string, number> = {};
        activities.forEach((a) => {
          counts[a.activity_type] = (counts[a.activity_type] || 0) + 1;
        });

        const chartData = Object.entries(counts).map(([type, count]) => ({
          name: activityLabels[type] || type,
          value: count,
          color: activityColors[type] || 'hsl(var(--muted))',
        }));

        setData(chartData);
      }
      setLoading(false);
    };

    fetchActivityData();
  }, []);

  const totalActivities = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <Card className="glass">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-accent" />
          Activity Breakdown
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Total activities: <span className="font-semibold text-accent">{totalActivities}</span>
        </p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[200px] flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading...</div>
          </div>
        ) : data.length === 0 ? (
          <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground">
            <Activity className="w-10 h-10 mb-2 opacity-50" />
            <p>No activities yet</p>
            <p className="text-xs">Start exercises to see breakdown</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend
                layout="vertical"
                align="right"
                verticalAlign="middle"
                formatter={(value) => <span className="text-xs">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
