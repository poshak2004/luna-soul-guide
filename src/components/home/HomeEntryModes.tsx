import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Sun, TrendingUp, Wind, BookOpen, Headphones, BarChart3, Target, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EntryMode {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  actions: { label: string; link: string; icon: React.ElementType }[];
  lunaMessage: string;
}

const modes: EntryMode[] = [
  {
    id: 'calm',
    title: 'Calm Now',
    description: 'Instant relief for anxiety and stress',
    icon: Heart,
    color: 'from-pink-500/20 to-purple-500/20',
    actions: [
      { label: 'Breathing Exercise', link: '/exercises', icon: Wind },
      { label: 'Sound Therapy', link: '/sensory', icon: Headphones },
      { label: 'Talk to Luna', link: '/chat', icon: Sparkles },
    ],
    lunaMessage: "I'm here for you. Let's find some calm together. 💜",
  },
  {
    id: 'daily',
    title: 'Daily Wellness',
    description: 'Build healthy habits every day',
    icon: Sun,
    color: 'from-amber-500/20 to-orange-500/20',
    actions: [
      { label: 'Journal Entry', link: '/journal', icon: BookOpen },
      { label: 'Quick Exercise', link: '/exercises', icon: Wind },
      { label: 'Mood Check-in', link: '/mood-calendar', icon: Heart },
    ],
    lunaMessage: "Great to see you! Let's make today count. 🌟",
  },
  {
    id: 'growth',
    title: 'Growth & Insights',
    description: 'Deep tracking and self-development',
    icon: TrendingUp,
    color: 'from-teal-500/20 to-cyan-500/20',
    actions: [
      { label: 'View Insights', link: '/insights', icon: BarChart3 },
      { label: 'Take Assessment', link: '/assessments', icon: Target },
      { label: 'Weekly Report', link: '/reports', icon: TrendingUp },
    ],
    lunaMessage: "Ready to grow? I'm proud of your progress! 🌱",
  },
];

export const HomeEntryModes = () => {
  return (
    <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
      {modes.map((mode, index) => (
        <motion.div
          key={mode.id}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.15 }}
        >
          <Card className={`p-6 glass hover:shadow-lg transition-all duration-300 h-full bg-gradient-to-br ${mode.color}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-background/50">
                <mode.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-display text-xl font-semibold">{mode.title}</h3>
                <p className="text-sm text-muted-foreground">{mode.description}</p>
              </div>
            </div>

            <p className="text-sm italic text-foreground/70 mb-4 bg-background/30 p-3 rounded-lg">
              "{mode.lunaMessage}"
            </p>

            <div className="space-y-2">
              {mode.actions.map((action) => (
                <Link key={action.label} to={action.link}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 hover:bg-background/50"
                  >
                    <action.icon className="w-4 h-4" />
                    {action.label}
                  </Button>
                </Link>
              ))}
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
