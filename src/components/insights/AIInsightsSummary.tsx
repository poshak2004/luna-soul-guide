import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, RefreshCw, Lightbulb, TrendingUp, Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';

interface Insight {
  type: 'pattern' | 'recommendation' | 'celebration';
  message: string;
  icon: React.ElementType;
}

export const AIInsightsSummary = () => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(false);
  const [nextAction, setNextAction] = useState<string | null>(null);

  const generateInsights = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch user data for analysis
      const [moodResult, activitiesResult, profileResult] = await Promise.all([
        supabase
          .from('mood_calendar')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .limit(14),
        supabase
          .from('user_activities')
          .select('*')
          .eq('user_id', user.id)
          .order('completed_at', { ascending: false })
          .limit(50),
        supabase
          .from('user_profiles')
          .select('current_streak, total_points')
          .eq('user_id', user.id)
          .single(),
      ]);

      const moods = moodResult.data || [];
      const activities = activitiesResult.data || [];
      const profile = profileResult.data;

      const generatedInsights: Insight[] = [];

      // Analyze mood patterns
      if (moods.length >= 3) {
        const avgMood = moods.reduce((sum, m) => sum + m.mood_score, 0) / moods.length;
        if (avgMood >= 7) {
          generatedInsights.push({
            type: 'celebration',
            message: `Your mood has been great lately! Average of ${avgMood.toFixed(1)}/10 over the past ${moods.length} days. Keep it up! 🌟`,
            icon: Heart,
          });
        } else if (avgMood < 5) {
          generatedInsights.push({
            type: 'pattern',
            message: `I notice your mood has been lower recently. Remember, it's okay to have tough days. Consider trying a breathing exercise or talking to Luna.`,
            icon: Lightbulb,
          });
        }
      }

      // Analyze activity patterns
      const activityTypes = activities.reduce((acc: Record<string, number>, a) => {
        acc[a.activity_type] = (acc[a.activity_type] || 0) + 1;
        return acc;
      }, {});

      const favoriteActivity = Object.entries(activityTypes).sort((a, b) => b[1] - a[1])[0];
      if (favoriteActivity) {
        const labels: Record<string, string> = {
          breathing_exercise: 'breathing exercises',
          meditation_exercise: 'meditation',
          journal_entry: 'journaling',
          sound_session: 'sound therapy',
        };
        generatedInsights.push({
          type: 'pattern',
          message: `You seem to enjoy ${labels[favoriteActivity[0]] || favoriteActivity[0]} the most! You've done it ${favoriteActivity[1]} times.`,
          icon: TrendingUp,
        });
      }

      // Streak celebration
      if (profile?.current_streak && profile.current_streak >= 3) {
        generatedInsights.push({
          type: 'celebration',
          message: `Amazing ${profile.current_streak}-day streak! Consistency is key to emotional well-being. 🔥`,
          icon: Heart,
        });
      }

      // Generate next action recommendation
      const hasJournaledToday = activities.some(
        (a) => a.activity_type === 'journal_entry' && 
        new Date(a.completed_at).toDateString() === new Date().toDateString()
      );

      if (!hasJournaledToday) {
        setNextAction('Write a quick journal entry to reflect on your day');
      } else if (!activities.some((a) => a.activity_type.includes('exercise'))) {
        setNextAction('Try a 2-minute breathing exercise for quick relaxation');
      } else {
        setNextAction('Take a moment to appreciate your progress today');
      }

      setInsights(generatedInsights.slice(0, 3));
    } catch (error) {
      console.error('Failed to generate insights:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateInsights();
  }, []);

  return (
    <Card className="glass border-accent/20">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            Luna's Insights
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={generateInsights}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : insights.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Complete more activities to get personalized insights!
          </p>
        ) : (
          <>
            {insights.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-3 rounded-lg flex items-start gap-3 ${
                  insight.type === 'celebration'
                    ? 'bg-primary/10 border border-primary/20'
                    : insight.type === 'recommendation'
                    ? 'bg-accent/10 border border-accent/20'
                    : 'bg-muted/50'
                }`}
              >
                <insight.icon className={`w-5 h-5 mt-0.5 ${
                  insight.type === 'celebration' ? 'text-primary' : 'text-accent'
                }`} />
                <p className="text-sm leading-relaxed">{insight.message}</p>
              </motion.div>
            ))}

            {nextAction && (
              <div className="mt-4 p-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20">
                <p className="text-xs text-muted-foreground mb-1">Suggested next action:</p>
                <p className="text-sm font-medium">{nextAction}</p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
