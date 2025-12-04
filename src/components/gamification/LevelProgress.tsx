import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { Star, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const levelThresholds = [0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 12000, 20000];

const levelNames = [
  'Seedling',
  'Sprout',
  'Bloom',
  'Garden',
  'Grove',
  'Forest',
  'Sanctuary',
  'Haven',
  'Paradise',
  'Enlightened',
  'Transcendent',
];

const levelColors = [
  'from-green-400 to-green-600',
  'from-teal-400 to-teal-600',
  'from-cyan-400 to-cyan-600',
  'from-blue-400 to-blue-600',
  'from-indigo-400 to-indigo-600',
  'from-purple-400 to-purple-600',
  'from-pink-400 to-pink-600',
  'from-rose-400 to-rose-600',
  'from-orange-400 to-orange-600',
  'from-amber-400 to-amber-600',
  'from-yellow-400 to-yellow-600',
];

export const LevelProgress = () => {
  const [totalPoints, setTotalPoints] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('user_profiles')
        .select('total_points')
        .eq('user_id', user.id)
        .single();

      if (data) {
        const points = data.total_points || 0;
        setTotalPoints(points);

        // Calculate level
        let level = 1;
        for (let i = levelThresholds.length - 1; i >= 0; i--) {
          if (points >= levelThresholds[i]) {
            level = i + 1;
            break;
          }
        }
        setCurrentLevel(Math.min(level, levelThresholds.length));
      }
      setLoading(false);
    };

    fetchProgress();

    // Real-time subscription
    const channel = supabase
      .channel('level_updates')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'user_profiles' }, (payload) => {
        if (payload.new.total_points !== undefined) {
          const points = payload.new.total_points;
          setTotalPoints(points);
          let level = 1;
          for (let i = levelThresholds.length - 1; i >= 0; i--) {
            if (points >= levelThresholds[i]) {
              level = i + 1;
              break;
            }
          }
          setCurrentLevel(Math.min(level, levelThresholds.length));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const currentThreshold = levelThresholds[currentLevel - 1] || 0;
  const nextThreshold = levelThresholds[currentLevel] || levelThresholds[levelThresholds.length - 1];
  const progressToNext = ((totalPoints - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
  const pointsToNextLevel = nextThreshold - totalPoints;

  if (loading) {
    return (
      <Card className="glass">
        <CardContent className="p-4">
          <div className="animate-pulse h-20 bg-muted/50 rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <motion.div
            className={`relative w-16 h-16 rounded-full bg-gradient-to-br ${levelColors[currentLevel - 1]} flex items-center justify-center`}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-2xl font-bold text-white">{currentLevel}</span>
            <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-yellow-300 animate-pulse" />
          </motion.div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <div>
                <h3 className="font-semibold">{levelNames[currentLevel - 1]}</h3>
                <p className="text-xs text-muted-foreground">Level {currentLevel}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-primary">{totalPoints.toLocaleString()} XP</p>
                {currentLevel < levelThresholds.length && (
                  <p className="text-xs text-muted-foreground">{pointsToNextLevel} to next</p>
                )}
              </div>
            </div>

            <div className="relative">
              <Progress value={Math.min(progressToNext, 100)} className="h-2" />
              {currentLevel < levelThresholds.length && (
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{currentThreshold}</span>
                  <span>{nextThreshold}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {currentLevel < levelThresholds.length && (
          <p className="text-xs text-center text-muted-foreground mt-3">
            Next: <span className="text-primary font-medium">{levelNames[currentLevel]}</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
};
