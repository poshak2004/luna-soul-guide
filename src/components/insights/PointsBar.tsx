import { motion } from 'framer-motion';
import { TrendingUp, Star, Trophy } from 'lucide-react';
import { usePoints } from '@/hooks/usePoints';
import { useGamification } from '@/hooks/useGamification';

const levelThresholds = [0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 11000, 15000];

export const PointsBar = () => {
  const { totalPoints, loading } = usePoints();
  const { profile } = useGamification();

  const currentLevel = profile?.current_level || 1;
  const xpTotal = profile?.xp_total || 0;
  const currentThreshold = levelThresholds[currentLevel - 1] || 0;
  const nextThreshold = levelThresholds[currentLevel] || levelThresholds[levelThresholds.length - 1];
  const progress = nextThreshold > currentThreshold 
    ? ((xpTotal - currentThreshold) / (nextThreshold - currentThreshold)) * 100 
    : 100;

  if (loading) return <div className="h-24 bg-muted/50 animate-pulse rounded-lg" />;

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="glass p-4 rounded-lg"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/20">
            <Trophy className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Level {currentLevel}</p>
            <p className="text-xs text-muted-foreground">{xpTotal} XP</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-400" />
          <motion.span
            key={totalPoints}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="text-2xl font-bold text-primary"
          >
            {totalPoints}
          </motion.span>
          <span className="text-sm text-muted-foreground">pts</span>
        </div>
      </div>

      <div className="space-y-1">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-accent"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progress, 100)}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
        <p className="text-xs text-center text-muted-foreground">
          {Math.max(0, nextThreshold - xpTotal)} XP to Level {currentLevel + 1}
        </p>
      </div>
    </motion.div>
  );
};
