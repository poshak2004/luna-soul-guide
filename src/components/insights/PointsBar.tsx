import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { usePoints } from '@/hooks/usePoints';

export const PointsBar = () => {
  const { totalPoints, loading } = usePoints();

  if (loading) return <div className="h-16 bg-muted/50 animate-pulse rounded-lg" />;

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="glass p-4 rounded-lg flex items-center justify-between"
    >
      <div className="flex items-center gap-3">
        <TrendingUp className="w-6 h-6 text-primary" />
        <div>
          <p className="text-sm text-muted-foreground">Wellness Points</p>
          <motion.p
            key={totalPoints}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="text-2xl font-bold text-primary"
          >
            {totalPoints}
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
};
