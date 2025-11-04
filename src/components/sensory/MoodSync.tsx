import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

interface MoodSyncProps {
  onSoundRecommend: (soundId: string) => void;
}

export const MoodSync = ({ onSoundRecommend }: MoodSyncProps) => {
  const [recommendation, setRecommendation] = useState<{
    mood: string;
    soundTitle: string;
    soundId: string;
    message: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendation = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Get latest journal mood
      const { data: journals } = await supabase
        .from('journal_entries')
        .select('mood_label')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (!journals || journals.length === 0) {
        setLoading(false);
        return;
      }

      const mood = journals[0].mood_label;

      // Map moods to sound categories/purposes
      const moodSoundMap: Record<string, { category: string; message: string }> = {
        anxious: { category: 'Meditation', message: 'Feeling anxious? Try calming sounds to center yourself 🌊' },
        sad: { category: 'Relaxation', message: 'Feeling down? Gentle sounds can lift your spirit 🌸' },
        stressed: { category: 'Sleep', message: 'Feeling stressed? Let soothing sounds ease your mind 🌙' },
        joyful: { category: 'Focus', message: 'Feeling joyful? Channel that energy into focused sounds 🔆' },
        calm: { category: 'Meditation', message: 'Feeling calm? Deepen your peace with meditation sounds 🪷' },
        neutral: { category: 'Relaxation', message: 'Try a gentle sound to enhance your day 🌿' },
      };

      const moodMap = moodSoundMap[mood] || moodSoundMap.neutral;

      // Find matching sound
      const { data: sounds } = await supabase
        .from('sound_therapy')
        .select('id, title')
        .eq('category', moodMap.category)
        .limit(1)
        .maybeSingle();

      if (sounds) {
        setRecommendation({
          mood,
          soundTitle: sounds.title,
          soundId: sounds.id,
          message: moodMap.message,
        });
      }

      setLoading(false);
    };

    fetchRecommendation();
  }, []);

  if (loading || !recommendation) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="glass border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="font-semibold text-lg">AI Recommendation</h3>
              <p className="text-muted-foreground text-sm">{recommendation.message}</p>
              <button
                onClick={() => onSoundRecommend(recommendation.soundId)}
                className="text-primary text-sm font-medium hover:underline"
              >
                Try "{recommendation.soundTitle}" →
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
