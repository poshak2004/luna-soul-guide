import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles, Heart, Moon, TrendingUp, Smile, Coffee } from 'lucide-react';
import { usePoints } from '@/hooks/usePoints';
import { useStreak } from '@/hooks/useStreak';

interface SuggestionButtonsProps {
  onSelectSuggestion: (text: string) => void;
  disabled?: boolean;
}

export const SuggestionButtons = ({ onSelectSuggestion, disabled }: SuggestionButtonsProps) => {
  const { totalPoints } = usePoints();
  const { streak } = useStreak();
  
  const getTimeSuggestions = () => {
    const hour = new Date().getHours();
    
    // Morning (5-12)
    if (hour >= 5 && hour < 12) {
      return [
        { icon: Coffee, text: "Good morning! How are you feeling today?", gradient: "from-amber-400/20 to-yellow-400/20" },
        { icon: Sparkles, text: "Help me set positive intentions for the day", gradient: "from-purple-400/20 to-pink-400/20" }
      ];
    }
    
    // Afternoon (12-17)
    if (hour >= 12 && hour < 17) {
      return [
        { icon: TrendingUp, text: "Let's review how my day is going", gradient: "from-emerald-400/20 to-green-400/20" },
        { icon: Heart, text: "I need a midday motivation boost", gradient: "from-pink-400/20 to-rose-400/20" }
      ];
    }
    
    // Evening/Night (17-5)
    return [
      { icon: Moon, text: "Help me unwind and relax", gradient: "from-indigo-400/20 to-purple-400/20" },
      { icon: Sparkles, text: "Let's reflect on my day", gradient: "from-violet-400/20 to-purple-400/20" }
    ];
  };

  const getProgressSuggestions = () => {
    const suggestions = [];
    
    if (streak > 0) {
      suggestions.push({
        icon: TrendingUp,
        text: `I'm on a ${streak}-day streak! Share some encouragement`,
        gradient: "from-green-400/20 to-emerald-400/20"
      });
    }
    
    if (totalPoints > 100) {
      suggestions.push({
        icon: Sparkles,
        text: "Review my wellness progress with me",
        gradient: "from-purple-400/20 to-pink-400/20"
      });
    }
    
    return suggestions;
  };

  const commonSuggestions = [
    { icon: Smile, text: "Give me an affirmation", gradient: "from-cyan-400/20 to-teal-400/20" },
    { icon: Heart, text: "I want to reflect on my day", gradient: "from-pink-400/20 to-rose-400/20" },
    { icon: Moon, text: "Help me relax with a breathing exercise", gradient: "from-indigo-400/20 to-blue-400/20" },
  ];

  const suggestions = [
    ...getTimeSuggestions(),
    ...getProgressSuggestions(),
    ...commonSuggestions
  ].slice(0, 5); // Show max 5 suggestions

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="flex flex-wrap gap-2 justify-center"
    >
      {suggestions.map((suggestion, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 + index * 0.1 }}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSelectSuggestion(suggestion.text)}
            disabled={disabled}
            className={`border-primary/30 hover:border-primary/50 hover-lift transition-all bg-gradient-to-br ${suggestion.gradient}`}
          >
            <suggestion.icon className="w-4 h-4 mr-2" />
            {suggestion.text}
          </Button>
        </motion.div>
      ))}
    </motion.div>
  );
};
