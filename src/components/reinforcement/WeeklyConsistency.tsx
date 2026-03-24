import { motion } from 'framer-motion';
import { CalendarCheck } from 'lucide-react';

interface WeeklyConsistencyProps {
  count: number;
}

export const WeeklyConsistency = ({ count }: WeeklyConsistencyProps) => {
  const dots = Array.from({ length: 7 }, (_, i) => i < count);

  return (
    <div className="flex items-center gap-2">
      <CalendarCheck className="w-4 h-4 text-muted-foreground" />
      <div className="flex gap-1">
        {dots.map((filled, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className={`w-2.5 h-2.5 rounded-full ${filled ? 'bg-primary' : 'bg-muted'}`}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">{count}/7 days</span>
    </div>
  );
};
