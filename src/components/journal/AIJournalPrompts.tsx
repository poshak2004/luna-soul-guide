import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AIJournalPromptsProps {
  onSelectPrompt: (prompt: string) => void;
}

const defaultPrompts = [
  "What made you smile today, even if just for a moment?",
  "What emotion are you feeling right now? Let's explore it together.",
  "If your day had a color, what would it be and why?",
  "What's one thing you're grateful for today?",
  "What would you tell your past self about today?",
];

export const AIJournalPrompts = ({ onSelectPrompt }: AIJournalPromptsProps) => {
  const [prompts, setPrompts] = useState<string[]>(defaultPrompts);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateAIPrompts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-journal-prompts', {
        body: { count: 5 },
      });

      if (error) throw error;

      if (data?.prompts) {
        setPrompts(data.prompts);
        toast({
          title: '✨ New prompts generated',
          description: 'Luna has created personalized prompts for you',
        });
      }
    } catch (error: any) {
      console.error('Error generating prompts:', error);
      toast({
        title: 'Using default prompts',
        description: 'AI prompts are temporarily unavailable',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="glass mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="w-5 h-5 text-primary" />
          Journal Prompts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-2">
          {prompts.map((prompt, index) => (
            <motion.div
              key={prompt}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Button
                variant="outline"
                className="w-full justify-start text-left h-auto py-3 px-4 hover:bg-primary/10"
                onClick={() => onSelectPrompt(prompt)}
              >
                <span className="text-sm">{prompt}</span>
              </Button>
            </motion.div>
          ))}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={generateAIPrompts}
          disabled={loading}
          className="w-full"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Generating...' : 'Get New AI Prompts'}
        </Button>
      </CardContent>
    </Card>
  );
};
