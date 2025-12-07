import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart, Zap, Moon, Star, Crown, Gem, Shield, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type LunaEmotion = 'calm' | 'happy' | 'proud' | 'worried' | 'sleepy';

interface LunaCompanionProps {
  emotion?: LunaEmotion;
  message?: string;
  onDismiss?: () => void;
  showMessage?: boolean;
  position?: 'fixed' | 'relative';
  level?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Level-based cosmetic upgrades
const levelCosmetics = {
  1: { ring: 'ring-0', accessory: null, size: 'w-20 h-20', iconSize: 'w-10 h-10' },
  2: { ring: 'ring-2 ring-primary/30', accessory: null, size: 'w-20 h-20', iconSize: 'w-10 h-10' },
  3: { ring: 'ring-2 ring-primary/50', accessory: 'sparkle', size: 'w-20 h-20', iconSize: 'w-10 h-10' },
  4: { ring: 'ring-2 ring-amber-400/50', accessory: 'sparkle', size: 'w-22 h-22', iconSize: 'w-11 h-11' },
  5: { ring: 'ring-4 ring-amber-400/60', accessory: 'crown', size: 'w-22 h-22', iconSize: 'w-11 h-11' },
  6: { ring: 'ring-4 ring-purple-400/60', accessory: 'crown', size: 'w-24 h-24', iconSize: 'w-12 h-12' },
  7: { ring: 'ring-4 ring-purple-500/70', accessory: 'gem', size: 'w-24 h-24', iconSize: 'w-12 h-12' },
  8: { ring: 'ring-4 ring-pink-500/70', accessory: 'gem', size: 'w-26 h-26', iconSize: 'w-13 h-13' },
  9: { ring: 'ring-4 ring-gradient', accessory: 'shield', size: 'w-26 h-26', iconSize: 'w-13 h-13' },
  10: { ring: 'ring-4 ring-gradient animate-pulse', accessory: 'all', size: 'w-28 h-28', iconSize: 'w-14 h-14' },
};

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
  level = 1,
  size = 'md',
  className,
}: LunaCompanionProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const config = emotionConfig[emotion];
  const cosmetic = levelCosmetics[Math.min(level, 10) as keyof typeof levelCosmetics] || levelCosmetics[1];
  const Icon = config.icon;

  // Size variants for responsive design
  const sizeClasses = {
    sm: { body: 'w-14 h-14', icon: 'w-7 h-7', message: 'max-w-[200px] text-xs' },
    md: { body: 'w-20 h-20', icon: 'w-10 h-10', message: 'max-w-xs text-sm' },
    lg: { body: 'w-24 h-24', icon: 'w-12 h-12', message: 'max-w-sm text-base' },
  };

  const currentSize = sizeClasses[size];

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const renderAccessory = () => {
    if (!cosmetic.accessory) return null;
    
    const accessoryClass = "absolute -top-3 left-1/2 -translate-x-1/2 text-amber-400 drop-shadow-lg";
    
    if (cosmetic.accessory === 'crown' || cosmetic.accessory === 'all') {
      return (
        <motion.div
          animate={{ y: [0, -2, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className={accessoryClass}
        >
          <Crown className="w-6 h-6" />
        </motion.div>
      );
    }
    if (cosmetic.accessory === 'gem') {
      return (
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className={accessoryClass}
        >
          <Gem className="w-5 h-5 text-purple-400" />
        </motion.div>
      );
    }
    if (cosmetic.accessory === 'shield') {
      return (
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className={accessoryClass}
        >
          <Shield className="w-5 h-5 text-emerald-400" />
        </motion.div>
      );
    }
    if (cosmetic.accessory === 'sparkle') {
      return (
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5], rotate: [0, 180, 360] }}
          transition={{ duration: 4, repeat: Infinity }}
          className={accessoryClass}
        >
          <Sparkles className="w-4 h-4 text-yellow-300" />
        </motion.div>
      );
    }
    return null;
  };

  // Collapsed mini-indicator
  if (isCollapsed && position === 'fixed') {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        onClick={toggleCollapse}
        className="fixed bottom-6 right-6 z-50 w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent shadow-lg flex items-center justify-center"
      >
        <Moon className="w-5 h-5 text-white" />
      </motion.button>
    );
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className={cn(
            position === 'fixed' && 'fixed bottom-6 right-6 z-50',
            position === 'fixed' && 'md:bottom-6 md:right-6 bottom-20 right-4',
            'flex flex-col items-end gap-3',
            className
          )}
        >
          {/* Message Bubble */}
          {showMessage && message && !isCollapsed && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className={cn(
                "glass p-4 rounded-2xl relative shadow-lg border border-primary/20",
                currentSize.message
              )}
            >
              <p className={cn("text-foreground", currentSize.message)}>{message}</p>
              {level > 1 && (
                <span className="text-xs text-muted-foreground mt-1 block">Luna Lvl {level}</span>
              )}
              <button
                onClick={handleDismiss}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
              {/* Tail */}
              <div className="absolute -bottom-2 right-8 w-4 h-4 bg-background/80 backdrop-blur-lg rotate-45 border-r border-b border-border/50" />
            </motion.div>
          )}

          {/* Luna Body */}
          <motion.div
            animate={{
              y: [0, -8, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="relative"
            onClick={position === 'fixed' ? toggleCollapse : undefined}
          >
            {/* Level Accessory */}
            {renderAccessory()}

            {/* Particles */}
            {[...Array(config.particles + Math.floor(level / 2))].map((_, i) => (
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
              whileTap={{ scale: 0.95 }}
              className={cn(
                'rounded-full bg-gradient-to-br flex items-center justify-center shadow-2xl cursor-pointer transition-shadow hover:shadow-primary/30',
                size === 'sm' ? 'w-14 h-14' : size === 'lg' ? 'w-24 h-24' : cosmetic.size,
                cosmetic.ring,
                config.color,
                config.glow
              )}
            >
              <Icon className={cn(
                'text-white drop-shadow-lg',
                size === 'sm' ? 'w-7 h-7' : size === 'lg' ? 'w-12 h-12' : cosmetic.iconSize
              )} />
            </motion.div>

            {/* Glow Effect */}
            <div
              className={cn(
                'absolute inset-0 rounded-full blur-xl bg-gradient-to-br pointer-events-none',
                config.color,
                level >= 5 ? 'opacity-70' : 'opacity-50'
              )}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
