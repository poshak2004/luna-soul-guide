import { motion } from 'framer-motion';
import { Heart, Cloud, Flame, Moon, Sun } from 'lucide-react';

interface EmotionIndicatorProps {
  emotion: string;
  intensity: string;
}

const emotionConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  anxious: { icon: Cloud, color: 'text-amber-500', label: 'Anxious' },
  sad: { icon: Moon, color: 'text-blue-400', label: 'Sad' },
  angry: { icon: Flame, color: 'text-red-400', label: 'Frustrated' },
  numb: { icon: Heart, color: 'text-gray-400', label: 'Numb' },
  calm: { icon: Sun, color: 'text-green-400', label: 'Calm' },
  happy: { icon: Sun, color: 'text-yellow-400', label: 'Happy' },
};

export const EmotionIndicator = ({ emotion, intensity }: EmotionIndicatorProps) => {
  const config = emotionConfig[emotion] || emotionConfig.calm;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 text-xs"
    >
      <Icon className={`w-3 h-3 ${config.color}`} />
      <span className="text-muted-foreground">
        {config.label} ({intensity})
      </span>
    </motion.div>
  );
};
