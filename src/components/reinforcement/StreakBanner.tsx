import { Flame } from 'lucide-react';
import { WeeklyConsistency } from './WeeklyConsistency';

interface StreakBannerProps {
  streak: number;
  weeklyCount: number;
}

export const StreakBanner = ({ streak, weeklyCount }: StreakBannerProps) => {
  return (
    <div className="flex items-center justify-between p-3 bg-muted/20 rounded-xl border border-border/50">
      <div className="flex items-center gap-2">
        <Flame className="w-5 h-5 text-destructive" />
        <span className="text-sm font-medium text-foreground">
          Current Streak: <span className="text-primary font-bold">{streak} {streak === 1 ? 'day' : 'days'}</span>
        </span>
      </div>
      <WeeklyConsistency count={weeklyCount} />
    </div>
  );
};
