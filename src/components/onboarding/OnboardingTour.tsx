import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { scaleIn } from '@/lib/motion';
import { Logo } from '@/components/Logo';

interface TourStep {
  title: string;
  description: string;
  lunaMessage: string;
  lunaEmotion: 'calm' | 'happy' | 'proud';
  route: string;
  emoji: string;
}

const tourSteps: TourStep[] = [
  {
    title: 'Your Dashboard',
    description: "Here's your home base! See your streaks, points, and quick access to all features.",
    lunaMessage: "This is where I'll pop up to cheer you on! 🏠",
    lunaEmotion: 'happy',
    route: '/dashboard',
    emoji: '🏠'
  },
  {
    title: 'Journal Your Thoughts',
    description: "Express yourself freely. Track your moods and earn points for reflection.",
    lunaMessage: "Writing helps process emotions. I love being here with you! 📝",
    lunaEmotion: 'calm',
    route: '/journal',
    emoji: '📝'
  },
  {
    title: 'Guided Exercises',
    description: "Try breathing, meditation, or grounding exercises whenever you need calm.",
    lunaMessage: "Breathing exercises are my favorite! Let's do one together 🧘",
    lunaEmotion: 'calm',
    route: '/exercises',
    emoji: '🧘‍♀️'
  },
  {
    title: 'Sensory Healing',
    description: "Immerse yourself in therapeutic soundscapes with beautiful audio-reactive visuals.",
    lunaMessage: "The sounds here are so peaceful... I could float here forever 🎧",
    lunaEmotion: 'calm',
    route: '/sensory-healing',
    emoji: '🎧'
  },
  {
    title: 'Your Insights',
    description: "Discover patterns in your wellness journey with charts and analytics.",
    lunaMessage: "I track all your progress here! You're doing amazing 📊",
    lunaEmotion: 'proud',
    route: '/insights',
    emoji: '📊'
  },
  {
    title: 'Badges & Achievements',
    description: "Unlock badges as you progress! Every milestone matters.",
    lunaMessage: "Ooh, I get SO excited when you earn badges! 🏆",
    lunaEmotion: 'happy',
    route: '/leaderboard',
    emoji: '🏆'
  },
  {
    title: 'Settings & Preferences',
    description: "Customize your experience to fit your needs perfectly.",
    lunaMessage: "Make everything just right for you! I'll adapt too ⚙️",
    lunaEmotion: 'calm',
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

              {/* Luna Avatar with Emotion */}
              <div className="flex justify-center mb-4">
                <motion.div
                  key={step.lunaEmotion}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="relative"
                >
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg ${
                    step.lunaEmotion === 'happy' 
                      ? 'bg-gradient-to-br from-yellow-400 to-amber-500' 
                      : step.lunaEmotion === 'proud'
                      ? 'bg-gradient-to-br from-purple-400 to-pink-500'
                      : 'bg-gradient-to-br from-primary to-accent'
                  }`}>
                    <Logo size="sm" />
                  </div>
                  <motion.div
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-background flex items-center justify-center text-sm shadow"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {step.lunaEmotion === 'happy' ? '😊' : step.lunaEmotion === 'proud' ? '🌟' : '😌'}
                  </motion.div>
                </motion.div>
              </div>

              {/* Content */}
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">{step.emoji}</div>
                <h3 className="font-display text-xl font-bold mb-2">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {step.description}
                </p>
              </div>

              {/* Luna's Message Bubble */}
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-primary/10 border border-primary/20 rounded-xl p-3 mb-4"
              >
                <p className="text-sm text-center text-primary italic">
                  "{step.lunaMessage}"
                </p>
              </motion.div>

              {/* Actions */}
              <div className="flex items-center justify-between gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-muted-foreground"
                >
                  <X className="w-4 h-4 mr-1" />
                  Skip
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
                        Start Journey
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
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
