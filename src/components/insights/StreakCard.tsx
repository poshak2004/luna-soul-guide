import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame } from 'lucide-react';
import { useStreak } from '@/hooks/useStreak';
import { motion } from 'framer-motion';

export const StreakCard = () => {
  const { streak, loading } = useStreak();

  if (loading) return <Card className="glass"><CardContent className="pt-6">Loading...</CardContent></Card>;

  return (
    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }}>
      <Card className="glass hover-lift">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-destructive" />
            Daily Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-primary">{streak}</span>
            <span className="text-muted-foreground">days</span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">Keep the momentum going!</p>
        </CardContent>
      </Card>
    </motion.div>
  );
};
