import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { scaleIn } from '@/lib/motion';

interface TourStep {
  title: string;
  description: string;
  route: string;
  emoji: string;
}

const tourSteps: TourStep[] = [
  {
    title: 'Your Dashboard',
    description: "Here's your home base! See your streaks, points, and quick access to all features.",
    route: '/dashboard',
    emoji: '🏠'
  },
  {
    title: 'Journal Your Thoughts',
    description: "Express yourself freely. Track your moods and earn points for reflection.",
    route: '/journal',
    emoji: '📝'
  },
  {
    title: 'Guided Exercises',
    description: "Try breathing, meditation, or grounding exercises whenever you need calm.",
    route: '/exercises',
    emoji: '🧘‍♀️'
  },
  {
    title: 'Sensory Healing',
    description: "Immerse yourself in therapeutic soundscapes with beautiful audio-reactive visuals.",
    route: '/sensory-healing',
    emoji: '🎧'
  },
  {
    title: 'Your Insights',
    description: "Discover patterns in your wellness journey with charts and analytics.",
    route: '/insights',
    emoji: '📊'
  },
  {
    title: 'Badges & Achievements',
    description: "Unlock badges as you progress! Every milestone matters.",
    route: '/leaderboard',
    emoji: '🏆'
  },
  {
    title: 'Settings & Preferences',
    description: "Customize your Luna experience to fit your needs perfectly.",
    route: '/settings',
    emoji: '⚙️'
  }
];

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingTour = ({ isOpen, onClose }: OnboardingTourProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && tourSteps[currentStep]) {
      navigate(tourSteps[currentStep].route);
    }
  }, [currentStep, isOpen, navigate]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.auth.updateUser({
          data: { onboarding_completed: true }
        });
      }
    } catch (error) {
      console.error('Error updating onboarding status:', error);
    }
    onClose();
  };

  if (!isOpen) return null;

  const step = tourSteps[currentStep];
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Tour Card */}
          <motion.div
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4"
            {...scaleIn}
          >
            <Card className="p-6 glass border-primary/30 shadow-2xl">
              {/* Progress Bar */}
              <div className="mb-4">
                <div className="h-1 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary to-accent"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Step {currentStep + 1} of {tourSteps.length}
                </p>
              </div>

              {/* Content */}
              <div className="text-center mb-6">
                <div className="text-5xl mb-3">{step.emoji}</div>
                <h3 className="font-display text-2xl font-bold mb-2">
                  {step.title}
                </h3>
                <p className="text-muted-foreground">
                  {step.description}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-muted-foreground"
                >
                  <X className="w-4 h-4 mr-1" />
                  Skip Tour
                </Button>

                <div className="flex gap-2">
                  {currentStep > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrev}
                    >
                      <ArrowLeft className="w-4 h-4 mr-1" />
                      Back
                    </Button>
                  )}
                  <Button
                    onClick={handleNext}
                    className="bg-gradient-to-r from-primary to-accent text-white"
                  >
                    {currentStep === tourSteps.length - 1 ? (
                      <>
                        <Sparkles className="w-4 h-4 mr-1" />
                        Finish
                      </>
                    ) : (
                      <>
                        Next
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Luna's Message */}
              <p className="text-xs text-center text-primary/70 mt-4 italic">
                "You're doing great 🌸, let's explore together!"
              </p>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
