import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RotateCcw, Send, Sparkles, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface ReflectLoopProps {
  onComplete: () => void;
  onExit: () => void;
}

export const ReflectLoop = ({ onComplete, onExit }: ReflectLoopProps) => {
  const [entry, setEntry] = useState("");
  const [aiReflection, setAiReflection] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"write" | "reflect">("write");
  const { toast } = useToast();

  const prompts = [
    "What brought you joy today?",
    "What challenge did you overcome?",
    "What are you grateful for right now?",
    "What emotion is present for you today?",
    "What would make tomorrow better?",
  ];

  const [currentPrompt] = useState(prompts[Math.floor(Math.random() * prompts.length)]);

  const handleGetReflection = async () => {
    if (entry.trim().length < 20) {
      toast({
        title: "Write a bit more",
        description: "Share at least a few sentences for a meaningful reflection",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('personalize-exercises', {
        body: {
          requestType: 'reflection',
          recentMoods: [entry],
          exerciseHistory: [],
        },
      });

      if (error) throw error;

      setAiReflection(data.response);
      setStep("reflect");
    } catch (error) {
      console.error('Error getting reflection:', error);
      toast({
        title: "Couldn't generate reflection",
        description: "Try again in a moment",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = () => {
    onComplete();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="max-w-4xl mx-auto"
    >
      <div className="glass rounded-3xl p-12 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3 mb-2">
            <BookOpen className="w-8 h-8 text-secondary" />
            <h2 className="text-4xl font-bold bg-gradient-to-r from-secondary via-accent to-primary bg-clip-text text-transparent">
              ReflectLoop
            </h2>
          </div>
          <p className="text-muted-foreground">
            Guided journaling with AI-powered reflections
          </p>
        </div>

        {step === "write" ? (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Prompt */}
            <div className="bg-gradient-to-r from-secondary/10 to-accent/10 rounded-2xl p-6 border border-secondary/20">
              <p className="text-lg font-medium text-center">
                <Sparkles className="w-5 h-5 inline mr-2 text-secondary" />
                {currentPrompt}
              </p>
            </div>

            {/* Writing area */}
            <div className="space-y-3">
              <Textarea
                value={entry}
                onChange={(e) => setEntry(e.target.value)}
                placeholder="Start writing your thoughts... Let them flow freely."
                className="min-h-[300px] text-lg resize-none glass"
                disabled={isLoading}
              />
              <p className="text-sm text-muted-foreground text-right">
                {entry.length} characters
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-center flex-wrap">
              <Button
                size="lg"
                onClick={handleGetReflection}
                disabled={isLoading || entry.trim().length < 20}
                className="min-w-[200px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Reflecting...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Get AI Reflection
                  </>
                )}
              </Button>

              <Button variant="outline" size="lg" onClick={onExit}>
                <RotateCcw className="w-5 h-5 mr-2" />
                Exit
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Your entry */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Your Reflection
              </h3>
              <div className="bg-muted/50 rounded-xl p-6 text-muted-foreground italic">
                "{entry}"
              </div>
            </div>

            {/* AI reflection */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-secondary" />
                AI Insight
              </h3>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-secondary/10 to-accent/10 rounded-xl p-6 border border-secondary/20"
              >
                <p className="leading-relaxed">{aiReflection}</p>
              </motion.div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-center flex-wrap">
              <Button size="lg" onClick={handleComplete} className="min-w-[200px]">
                <Send className="w-5 h-5 mr-2" />
                Complete & Save
              </Button>

              <Button variant="outline" size="lg" onClick={() => setStep("write")}>
                Write More
              </Button>

              <Button variant="outline" size="lg" onClick={onExit}>
                <RotateCcw className="w-5 h-5 mr-2" />
                Exit
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
