import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface MicroInterventionProps {
  type: 'breathing' | 'grounding' | 'affirmation';
  onComplete: () => void;
  onDismiss: () => void;
}

export const MicroIntervention = ({ type, onComplete, onDismiss }: MicroInterventionProps) => {
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [cycles, setCycles] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const totalCycles = 3;

  useEffect(() => {
    if (type !== 'breathing' || !isActive) return;

    const sequence = async () => {
      setPhase('inhale');
      await new Promise(r => setTimeout(r, 4000));
      setPhase('hold');
      await new Promise(r => setTimeout(r, 4000));
      setPhase('exhale');
      await new Promise(r => setTimeout(r, 4000));
      setCycles(c => c + 1);
    };

    if (cycles < totalCycles) {
      sequence();
    } else {
      onComplete();
    }
  }, [cycles, isActive, type, onComplete]);

  const groundingSteps = [
    "5 things you can see",
    "4 things you can touch",
    "3 things you can hear",
    "2 things you can smell",
    "1 thing you can taste"
  ];

  const affirmations = [
    "I am safe in this moment",
    "This feeling will pass",
    "I am doing my best",
    "I deserve kindness"
  ];

  if (type === 'breathing') {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <Card className="p-4 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 border-teal-500/20">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <Wind className="w-4 h-4 text-teal-400" />
                <span className="text-sm font-medium">Quick Breathing</span>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onDismiss}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex flex-col items-center py-4">
              <motion.div
                className="w-20 h-20 rounded-full bg-teal-500/20 flex items-center justify-center"
                animate={{
                  scale: phase === 'inhale' ? 1.3 : phase === 'hold' ? 1.3 : 1,
                }}
                transition={{ duration: 4, ease: 'easeInOut' }}
              >
                <span className="text-sm font-medium text-teal-300 capitalize">{phase}</span>
              </motion.div>
              <p className="text-xs text-muted-foreground mt-3">
                Cycle {cycles + 1} of {totalCycles}
              </p>
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>
    );
  }

  if (type === 'grounding') {
    return (
      <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
        <div className="flex justify-between items-start mb-3">
          <span className="text-sm font-medium">5-4-3-2-1 Grounding</span>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onDismiss}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {groundingSteps.map((step, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">
                {5 - i}
              </span>
              {step}
            </li>
          ))}
        </ul>
        <Button size="sm" className="w-full mt-3" onClick={onComplete}>
          <Check className="w-4 h-4 mr-2" /> Done
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
      <div className="flex justify-between items-start mb-3">
        <span className="text-sm font-medium">Affirmation</span>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onDismiss}>
          <X className="w-4 h-4" />
        </Button>
      </div>
      <p className="text-center text-lg font-medium py-4">
        "{affirmations[Math.floor(Math.random() * affirmations.length)]}"
      </p>
      <Button size="sm" className="w-full" onClick={onComplete}>
        <Check className="w-4 h-4 mr-2" /> I believe this
      </Button>
    </Card>
  );
};
