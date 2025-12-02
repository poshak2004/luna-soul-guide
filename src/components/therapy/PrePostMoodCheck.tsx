import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Heart } from 'lucide-react';

interface PrePostMoodCheckProps {
  type: 'pre' | 'post';
  onComplete: (mood: number) => void;
}

const moodLabels = ['Very Low', 'Low', 'Neutral', 'Good', 'Excellent'];

export const PrePostMoodCheck = ({ type, onComplete }: PrePostMoodCheckProps) => {
  const [moodScore, setMoodScore] = useState([5]);

  const handleComplete = () => {
    onComplete(moodScore[0]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
    >
      <Card className="glass w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            {type === 'pre' ? 'How are you feeling right now?' : 'How do you feel after the session?'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Very Low</span>
              <span>Excellent</span>
            </div>
            
            <Slider
              value={moodScore}
              onValueChange={setMoodScore}
              min={1}
              max={10}
              step={1}
              className="cursor-pointer"
            />

            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{moodScore[0]}/10</p>
              <p className="text-sm text-muted-foreground mt-1">
                {moodLabels[Math.floor((moodScore[0] - 1) / 2)]}
              </p>
            </div>
          </div>

          <Button onClick={handleComplete} className="w-full">
            Continue
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};
