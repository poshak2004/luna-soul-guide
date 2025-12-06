import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, Wind, Headphones, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';

export const CalmNowButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showBreathing, setShowBreathing] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathCount, setBreathCount] = useState(0);

  const quickActions = [
    {
      icon: Wind,
      label: 'Breathe Now',
      action: () => {
        setShowBreathing(true);
        setIsOpen(false);
        startBreathing();
      },
      color: 'bg-teal-500/20 text-teal-400'
    },
    {
      icon: Headphones,
      label: 'Listen',
      link: '/sensory',
      color: 'bg-purple-500/20 text-purple-400'
    },
    {
      icon: MessageCircle,
      label: 'Talk',
      link: '/chat',
      color: 'bg-pink-500/20 text-pink-400'
    }
  ];

  const startBreathing = () => {
    setBreathCount(0);
    setBreathPhase('inhale');
    
    let count = 0;
    const phases = ['inhale', 'hold', 'exhale'] as const;
    let phaseIndex = 0;
    
    const interval = setInterval(() => {
      phaseIndex = (phaseIndex + 1) % 3;
      setBreathPhase(phases[phaseIndex]);
      
      if (phaseIndex === 0) {
        count++;
        setBreathCount(count);
        if (count >= 3) {
          clearInterval(interval);
          setTimeout(() => setShowBreathing(false), 2000);
        }
      }
    }, 4000);
  };

  const phaseConfig = {
    inhale: { text: 'Breathe In', scale: 1.3 },
    hold: { text: 'Hold', scale: 1.3 },
    exhale: { text: 'Breathe Out', scale: 1 }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.div
        className="fixed bottom-6 left-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          size="lg"
          className="rounded-full w-14 h-14 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-lg shadow-pink-500/30"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Heart className="w-6 h-6" />}
        </Button>
      </motion.div>

      {/* Quick Actions Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-24 left-6 z-50"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <Card className="p-4 glass shadow-xl border-primary/20">
              <p className="text-sm font-medium mb-3 text-center">Need to calm down?</p>
              <div className="flex flex-col gap-2">
                {quickActions.map((action) =>
                  action.link ? (
                    <Link key={action.label} to={action.link} onClick={() => setIsOpen(false)}>
                      <Button
                        variant="ghost"
                        className={`w-full justify-start gap-3 ${action.color} hover:opacity-80`}
                      >
                        <action.icon className="w-5 h-5" />
                        {action.label}
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      key={action.label}
                      variant="ghost"
                      onClick={action.action}
                      className={`w-full justify-start gap-3 ${action.color} hover:opacity-80`}
                    >
                      <action.icon className="w-5 h-5" />
                      {action.label}
                    </Button>
                  )
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                You're not alone. 💜
              </p>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Breathing Exercise Overlay */}
      <AnimatePresence>
        {showBreathing && (
          <motion.div
            className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-xl flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4"
              onClick={() => setShowBreathing(false)}
            >
              <X className="w-6 h-6" />
            </Button>

            <div className="flex flex-col items-center gap-8">
              <motion.div
                className="w-40 h-40 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 shadow-2xl shadow-teal-500/40 flex items-center justify-center"
                animate={{ scale: phaseConfig[breathPhase].scale }}
                transition={{ duration: 4, ease: 'easeInOut' }}
              >
                <Wind className="w-16 h-16 text-white" />
              </motion.div>

              <motion.p
                key={breathPhase}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-medium text-foreground"
              >
                {phaseConfig[breathPhase].text}
              </motion.p>

              <p className="text-muted-foreground">
                {breathCount < 3 ? `Breath ${breathCount + 1} of 3` : 'Well done! 🌟'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
