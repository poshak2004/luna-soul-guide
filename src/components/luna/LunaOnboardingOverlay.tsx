import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LunaCompanion } from './LunaCompanion';
import { lunaMessages, getRandomMessage } from './LunaMessages';
import { supabase } from '@/integrations/supabase/client';

interface LunaOnboardingOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTour: () => void;
}

export const LunaOnboardingOverlay = ({ isOpen, onClose, onStartTour }: LunaOnboardingOverlayProps) => {
  const [step, setStep] = useState(0);
  
  const welcomeSteps = [
    {
      message: lunaMessages.onboarding.welcome[0],
      emotion: 'happy' as const,
    },
    {
      message: lunaMessages.onboarding.welcome[1],
      emotion: 'calm' as const,
    },
    {
      message: lunaMessages.onboarding.welcome[2],
      emotion: 'proud' as const,
    },
  ];

  const handleNext = () => {
    if (step < welcomeSteps.length - 1) {
      setStep(step + 1);
    } else {
      handleStartTour();
    }
  };

  const handleStartTour = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.auth.updateUser({
          data: { luna_introduced: true }
        });
      }
    } catch (error) {
      console.error('Error updating Luna intro status:', error);
    }
    onStartTour();
  };

  const handleSkip = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.auth.updateUser({
          data: { luna_introduced: true, onboarding_completed: true }
        });
      }
    } catch (error) {
      console.error('Error updating onboarding status:', error);
    }
    onClose();
  };

  if (!isOpen) return null;

  const currentStep = welcomeSteps[step];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gradient-to-br from-primary/20 via-background/95 to-accent/20 backdrop-blur-md z-50"
          />

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <Card className="max-w-md w-full p-8 glass border-primary/30 shadow-2xl text-center">
              {/* Luna Character */}
              <div className="flex justify-center mb-6">
                <LunaCompanion
                  emotion={currentStep.emotion}
                  showMessage={false}
                  position="relative"
                  level={1}
                />
              </div>

              {/* Message */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-xl font-display mb-6 text-foreground">
                    {currentStep.message}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Progress dots */}
              <div className="flex justify-center gap-2 mb-6">
                {welcomeSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === step
                        ? 'w-8 bg-primary'
                        : index < step
                        ? 'w-2 bg-primary/60'
                        : 'w-2 bg-muted'
                    }`}
                  />
                ))}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleNext}
                  className="w-full bg-gradient-to-r from-primary to-accent text-white"
                  size="lg"
                >
                  {step === welcomeSteps.length - 1 ? (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Start the Tour
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
                
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  className="text-muted-foreground"
                >
                  Skip for now
                </Button>
              </div>

              {/* Decorative hearts */}
              <div className="absolute -top-4 -right-4">
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Heart className="w-8 h-8 text-primary/30 fill-primary/20" />
                </motion.div>
              </div>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
