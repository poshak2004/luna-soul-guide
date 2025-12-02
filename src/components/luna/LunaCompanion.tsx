import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart, Zap, Moon, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export type LunaEmotion = 'calm' | 'happy' | 'proud' | 'worried' | 'sleepy';

interface LunaCompanionProps {
  emotion?: LunaEmotion;
  message?: string;
  onDismiss?: () => void;
  showMessage?: boolean;
  position?: 'fixed' | 'relative';
}

const emotionConfig = {
  calm: {
    color: 'from-blue-400 to-cyan-400',
    icon: Moon,
    glow: 'shadow-blue-500/50',
    particles: 3,
  },
  happy: {
    color: 'from-yellow-400 to-orange-400',
    icon: Star,
    glow: 'shadow-yellow-500/50',
    particles: 5,
  },
  proud: {
    color: 'from-purple-400 to-pink-400',
    icon: Sparkles,
    glow: 'shadow-purple-500/50',
    particles: 6,
  },
  worried: {
    color: 'from-red-400 to-orange-400',
    icon: Heart,
    glow: 'shadow-red-500/50',
    particles: 2,
  },
  sleepy: {
    color: 'from-indigo-400 to-blue-400',
    icon: Zap,
    glow: 'shadow-indigo-500/50',
    particles: 1,
  },
};

export const LunaCompanion = ({
  emotion = 'calm',
  message,
  onDismiss,
  showMessage = true,
  position = 'fixed',
}: LunaCompanionProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const config = emotionConfig[emotion];
  const Icon = config.icon;

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className={cn(
            position === 'fixed' && 'fixed bottom-6 right-6 z-50',
            'flex flex-col items-end gap-3'
          )}
        >
          {/* Message Bubble */}
          {showMessage && message && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="glass max-w-xs p-4 rounded-2xl relative"
            >
              <p className="text-sm text-foreground">{message}</p>
              {onDismiss && (
                <button
                  onClick={handleDismiss}
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center text-xs"
                >
                  ×
                </button>
              )}
              {/* Tail */}
              <div className="absolute -bottom-2 right-8 w-4 h-4 bg-background/80 backdrop-blur-lg rotate-45 border-r border-b border-border/50" />
            </motion.div>
          )}

          {/* Luna Body */}
          <motion.div
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="relative"
          >
            {/* Particles */}
            {[...Array(config.particles)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  x: [0, Math.random() * 40 - 20],
                  y: [0, -Math.random() * 40 - 20],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
                className={cn(
                  'absolute w-2 h-2 rounded-full bg-gradient-to-br',
                  config.color
                )}
                style={{
                  left: '50%',
                  top: '50%',
                }}
              />
            ))}

            {/* Main Body */}
            <motion.div
              whileHover={{ scale: 1.1 }}
              className={cn(
                'w-20 h-20 rounded-full bg-gradient-to-br flex items-center justify-center shadow-2xl cursor-pointer',
                config.color,
                config.glow
              )}
            >
              <Icon className="w-10 h-10 text-white drop-shadow-lg" />
            </motion.div>

            {/* Glow Effect */}
            <div
              className={cn(
                'absolute inset-0 rounded-full blur-xl opacity-50 bg-gradient-to-br',
                config.color
              )}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
