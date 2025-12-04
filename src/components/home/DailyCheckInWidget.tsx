import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Smile, Frown, Meh, Sun, Moon, Zap, X, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const moodEmojis = [
  { value: 1, icon: Frown, label: 'Struggling', color: 'text-red-400' },
  { value: 3, icon: Frown, label: 'Low', color: 'text-orange-400' },
  { value: 5, icon: Meh, label: 'Okay', color: 'text-yellow-400' },
  { value: 7, icon: Smile, label: 'Good', color: 'text-lime-400' },
  { value: 10, icon: Smile, label: 'Great', color: 'text-green-400' },
];

interface DailyCheckInWidgetProps {
  onComplete?: () => void;
  compact?: boolean;
}

export const DailyCheckInWidget = ({ onComplete, compact = false }: DailyCheckInWidgetProps) => {
  const [isOpen, setIsOpen] = useState(!compact);
  const [moodScore, setMoodScore] = useState(5);
  const [energyLevel, setEnergyLevel] = useState(5);
  const [sleepHours, setSleepHours] = useState(7);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const getMoodEmoji = (score: number) => {
    return moodEmojis.reduce((prev, curr) =>
      Math.abs(curr.value - score) < Math.abs(prev.value - score) ? curr : prev
    );
  };

  const currentMood = getMoodEmoji(moodScore);
  const MoodIcon = currentMood.icon;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const moodLabel = currentMood.label.toLowerCase();

      await supabase.from('mood_calendar').upsert({
        user_id: user.id,
        date: new Date().toISOString().split('T')[0],
        mood_score: moodScore,
        mood_label: moodLabel,
        energy_level: energyLevel,
        sleep_hours: sleepHours,
      }, { onConflict: 'user_id,date' });

      toast({
        title: 'Check-in Complete! 🌟',
        description: 'Your daily mood has been recorded.',
      });

      onComplete?.();
      if (compact) setIsOpen(false);
    } catch (error) {
      console.error('Check-in error:', error);
      toast({
        title: 'Error',
        description: 'Failed to save check-in. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (compact && !isOpen) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <Button
          onClick={() => setIsOpen(true)}
          className="gap-2 bg-gradient-to-r from-primary to-accent text-primary-foreground"
        >
          <Sun className="w-4 h-4" />
          Daily Check-in
        </Button>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
      >
        <Card className="glass border-primary/20">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sun className="w-5 h-5 text-amber-500" />
                Daily Check-in
              </CardTitle>
              {compact && (
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Mood */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">How are you feeling?</span>
                <div className={`flex items-center gap-1 ${currentMood.color}`}>
                  <MoodIcon className="w-5 h-5" />
                  <span className="text-sm font-medium">{currentMood.label}</span>
                </div>
              </div>
              <Slider
                value={[moodScore]}
                onValueChange={([v]) => setMoodScore(v)}
                min={1}
                max={10}
                step={1}
                className="cursor-pointer"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Struggling</span>
                <span>Great</span>
              </div>
            </div>

            {/* Energy */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Energy Level</span>
                <div className="flex items-center gap-1 text-amber-500">
                  <Zap className="w-4 h-4" />
                  <span className="text-sm">{energyLevel}/10</span>
                </div>
              </div>
              <Slider
                value={[energyLevel]}
                onValueChange={([v]) => setEnergyLevel(v)}
                min={1}
                max={10}
                step={1}
                className="cursor-pointer"
              />
            </div>

            {/* Sleep */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Hours of Sleep</span>
                <div className="flex items-center gap-1 text-indigo-400">
                  <Moon className="w-4 h-4" />
                  <span className="text-sm">{sleepHours}h</span>
                </div>
              </div>
              <Slider
                value={[sleepHours]}
                onValueChange={([v]) => setSleepHours(v)}
                min={0}
                max={12}
                step={0.5}
                className="cursor-pointer"
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full gap-2"
            >
              <Check className="w-4 h-4" />
              {isSubmitting ? 'Saving...' : 'Complete Check-in'}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};
