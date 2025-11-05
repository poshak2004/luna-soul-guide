import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Heart, Sparkles, TrendingUp, Award, Music, MessageCircle, PenTool } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Logo } from '@/components/Logo';
import { fadeIn, scaleIn } from '@/lib/motion';

const Guide = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: PenTool,
      title: 'Journaling',
      description: 'Express yourself freely and track your emotional journey',
      gradient: 'from-purple-400/20 to-pink-400/20'
    },
    {
      icon: Heart,
      title: 'Guided Exercises',
      description: 'Breathing, meditation, and grounding techniques',
      gradient: 'from-pink-400/20 to-rose-400/20'
    },
    {
      icon: Music,
      title: 'Sensory Healing',
      description: 'Therapeutic soundscapes and audio-reactive visuals',
      gradient: 'from-cyan-400/20 to-teal-400/20'
    },
    {
      icon: TrendingUp,
      title: 'Insights & Analytics',
      description: 'Understand patterns in your mood and wellness',
      gradient: 'from-emerald-400/20 to-green-400/20'
    },
    {
      icon: Award,
      title: 'Badges & Progress',
      description: 'Earn achievements as you grow and heal',
      gradient: 'from-amber-400/20 to-yellow-400/20'
    },
    {
      icon: MessageCircle,
      title: 'Chat with Luna',
      description: 'AI companion for support and reflection',
      gradient: 'from-violet-400/20 to-purple-400/20'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender/10 via-mint/10 to-blush/10 pt-20 pb-12 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Hero Section */}
        <motion.div 
          className="text-center mb-16"
          {...fadeIn}
        >
          <div className="flex justify-center mb-6">
            <Logo size="lg" />
          </div>
          <h1 className="font-display text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Welcome to Emotional Reactive AI
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Your companion for calm, reflection, and emotional clarity. 
            A safe space to explore your inner world and nurture your mental wellbeing.
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate('/dashboard')}
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white shadow-lg hover:shadow-xl transition-all"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Start Exploring
          </Button>
        </motion.div>

        {/* About Section */}
        <motion.div
          className="mb-16"
          {...scaleIn}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-8 glass border-primary/20">
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="w-6 h-6 text-primary" />
              <h2 className="font-display text-3xl font-bold">What is Luna?</h2>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Emotional Reactive AI is a gamified wellness platform designed to support your mental health journey.
              Through journaling, therapeutic exercises, sensory experiences, and AI-powered insights, 
              Luna helps you understand your emotions, build healthy habits, and find moments of peace 
              in your daily life. Every interaction earns you points, unlocks badges, and contributes 
              to your personal growth story.
            </p>
          </Card>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          {...fadeIn}
          transition={{ delay: 0.3 }}
        >
          <h2 className="font-display text-3xl font-bold text-center mb-8">
            Everything You Need to Thrive
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <Card className={`p-6 h-full glass border-primary/20 hover:border-primary/40 transition-all hover-lift bg-gradient-to-br ${feature.gradient}`}>
                  <feature.icon className="w-8 h-8 text-primary mb-3" />
                  <h3 className="font-display text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Footer */}
        <motion.div
          className="text-center"
          {...scaleIn}
          transition={{ delay: 0.8 }}
        >
          <Card className="p-8 glass border-primary/20 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5">
            <h2 className="font-display text-3xl font-bold mb-4">
              Ready to Begin?
            </h2>
            <p className="text-muted-foreground mb-6 text-lg">
              Your journey to emotional wellbeing starts here. 
              Luna is with you every step of the way 🌸
            </p>
            <Button 
              size="lg"
              onClick={() => navigate('/dashboard')}
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white shadow-lg hover:shadow-xl transition-all"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Begin Your Journey
            </Button>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Guide;
