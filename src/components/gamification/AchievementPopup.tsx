import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
}

export const AchievementPopup = () => {
  const [achievement, setAchievement] = useState<Achievement | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const channel = supabase
      .channel('badge_achievements')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'user_badges' }, async (payload) => {
        // Fetch the badge details
        const { data: badge } = await supabase
          .from('badges')
          .select('*')
          .eq('id', payload.new.badge_id)
          .single();

        if (badge) {
          setAchievement({
            id: badge.id,
            name: badge.name,
            description: badge.description || 'New badge unlocked!',
            icon: badge.icon,
            points: badge.points_required,
          });
          setShowConfetti(true);

          // Auto-dismiss after 5 seconds
          setTimeout(() => {
            setAchievement(null);
            setShowConfetti(false);
          }, 5000);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const dismiss = () => {
    setAchievement(null);
    setShowConfetti(false);
  };

  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Confetti Effect */}
          {showConfetti && (
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(30)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'][i % 6],
                    left: `${Math.random() * 100}%`,
                    top: -20,
                  }}
                  animate={{
                    y: [0, window.innerHeight + 100],
                    x: [0, (Math.random() - 0.5) * 200],
                    rotate: [0, Math.random() * 720],
                    opacity: [1, 0],
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    delay: Math.random() * 0.5,
                    ease: 'easeOut',
                  }}
                />
              ))}
            </div>
          )}

          {/* Achievement Card */}
          <motion.div
            className="bg-gradient-to-br from-card to-muted/50 border-2 border-primary/50 rounded-2xl p-6 shadow-2xl max-w-sm mx-4 pointer-events-auto"
            initial={{ scale: 0.5, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.5, y: 50, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2"
              onClick={dismiss}
            >
              <X className="w-4 h-4" />
            </Button>

            <div className="text-center">
              <motion.div
                className="relative mx-auto w-20 h-20 mb-4"
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, repeat: 2 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-full opacity-20 blur-xl" />
                <div className="relative w-full h-full bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                  <Award className="w-10 h-10 text-white" />
                </div>
                <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 animate-pulse" />
              </motion.div>

              <motion.h2
                className="text-2xl font-bold mb-1 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Badge Unlocked! 🎉
              </motion.h2>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="text-lg font-semibold">{achievement.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{achievement.description}</p>
              </motion.div>

              <motion.p
                className="text-xs text-primary mt-4 italic"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Luna is so proud of you! 💜
              </motion.p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
