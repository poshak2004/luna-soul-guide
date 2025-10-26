import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { RotateCcw, Sparkles, RefreshCw, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface MindMirrorProps {
  onComplete: () => void;
  onExit: () => void;
}

export const MindMirror = ({ onComplete, onExit }: MindMirrorProps) => {
  const [affirmation, setAffirmation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [moodContext, setMoodContext] = useState("neutral");
  const [showAffirmation, setShowAffirmation] = useState(false);
  const { toast } = useToast();

  const moodOptions = [
    { label: "Stressed", value: "stressed", color: "hsl(15, 75%, 60%)", icon: "😰" },
    { label: "Sad", value: "sad", color: "hsl(220, 50%, 55%)", icon: "😢" },
    { label: "Anxious", value: "anxious", color: "hsl(30, 80%, 60%)", icon: "😟" },
    { label: "Tired", value: "tired", color: "hsl(220, 20%, 50%)", icon: "😴" },
    { label: "Neutral", value: "neutral", color: "hsl(200, 30%, 60%)", icon: "😐" },
    { label: "Content", value: "content", color: "hsl(140, 50%, 60%)", icon: "😊" },
    { label: "Confident", value: "confident", color: "hsl(45, 90%, 60%)", icon: "😎" },
    { label: "Joyful", value: "joyful", color: "hsl(50, 95%, 55%)", icon: "😄" },
  ];

  const generateAffirmation = async (mood: string) => {
    setIsLoading(true);
    setMoodContext(mood);
    
    try {
      const { data, error } = await supabase.functions.invoke('personalize-exercises', {
        body: {
          requestType: 'affirmation',
          recentMoods: [mood],
          exerciseHistory: [],
        },
      });

      if (error) throw error;

      setAffirmation(data.response);
      setShowAffirmation(true);
    } catch (error) {
      console.error('Error generating affirmation:', error);
      toast({
        title: "Couldn't generate affirmation",
        description: "Try again in a moment",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = () => {
    setShowAffirmation(false);
    setTimeout(() => generateAffirmation(moodContext), 300);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="max-w-5xl mx-auto"
    >
      <div className="glass rounded-3xl p-12 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Sparkles className="w-8 h-8 text-accent" />
            <h2 className="text-4xl font-bold bg-gradient-to-r from-accent via-secondary to-primary bg-clip-text text-transparent">
              Mind Mirror
            </h2>
          </div>
          <p className="text-muted-foreground">
            Personalized affirmations powered by AI
          </p>
        </div>

        {!showAffirmation ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            <div className="text-center space-y-3">
              <h3 className="text-2xl font-semibold">How are you feeling?</h3>
              <p className="text-muted-foreground">
                Choose your current mood to receive a personalized affirmation
              </p>
            </div>

            {/* Mood selection */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {moodOptions.map((mood, index) => (
                <motion.button
                  key={mood.value}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => generateAffirmation(mood.value)}
                  disabled={isLoading}
                  className="glass rounded-2xl p-4 space-y-2 transition-all duration-300 hover:shadow-xl disabled:opacity-50"
                  style={{
                    borderColor: mood.color,
                    borderWidth: '2px',
                  }}
                >
                  <div
                    className="text-5xl mx-auto w-16 h-16 flex items-center justify-center rounded-full"
                    style={{ backgroundColor: `${mood.color}20` }}
                  >
                    {mood.icon}
                  </div>
                  <p className="font-semibold">{mood.label}</p>
                </motion.button>
              ))}
            </div>

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center space-y-4 py-8"
              >
                <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
                <p className="text-muted-foreground">Crafting your affirmation...</p>
              </motion.div>
            )}

            <div className="flex justify-center">
              <Button variant="outline" size="lg" onClick={onExit}>
                <RotateCcw className="w-5 h-5 mr-2" />
                Exit
              </Button>
            </div>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={affirmation}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-8 py-8"
            >
              {/* Mirror visualization */}
              <motion.div
                initial={{ rotateY: 90 }}
                animate={{ rotateY: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative max-w-2xl mx-auto"
              >
                <div className="glass rounded-3xl p-12 space-y-6 border-4 border-primary/30 shadow-2xl">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="text-center"
                  >
                    <Heart className="w-16 h-16 mx-auto mb-6 text-accent" />
                    <p className="text-2xl md:text-3xl font-medium leading-relaxed text-center">
                      "{affirmation}"
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="pt-6 border-t border-border"
                  >
                    <p className="text-sm text-muted-foreground text-center italic">
                      Repeat this affirmation to yourself. Feel its truth. You are worthy of these words.
                    </p>
                  </motion.div>
                </div>

                {/* Glow effect */}
                <motion.div
                  animate={{
                    opacity: [0.3, 0.6, 0.3],
                    scale: [1, 1.05, 1],
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-primary/20 via-accent/20 to-secondary/20 blur-2xl"
                />
              </motion.div>

              {/* Actions */}
              <div className="flex gap-3 justify-center flex-wrap">
                <Button size="lg" onClick={onComplete} className="min-w-[200px]">
                  <Heart className="w-5 h-5 mr-2" />
                  Save Affirmation
                </Button>

                <Button variant="secondary" size="lg" onClick={handleRegenerate}>
                  <RefreshCw className="w-5 h-5 mr-2" />
                  New Affirmation
                </Button>

                <Button variant="outline" size="lg" onClick={() => setShowAffirmation(false)}>
                  Change Mood
                </Button>

                <Button variant="outline" size="lg" onClick={onExit}>
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Exit
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
};
