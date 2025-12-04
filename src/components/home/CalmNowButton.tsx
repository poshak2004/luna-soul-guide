import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, Wind, Headphones, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';

export const CalmNowButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const quickActions = [
    { icon: Wind, label: 'Breathe', link: '/exercises', color: 'bg-teal-500/20 text-teal-400' },
    { icon: Headphones, label: 'Listen', link: '/sensory', color: 'bg-purple-500/20 text-purple-400' },
    { icon: MessageCircle, label: 'Talk', link: '/chat', color: 'bg-pink-500/20 text-pink-400' },
  ];

  return (
    <>
      {/* Floating Button */}
      <motion.div
        className="fixed bottom-6 left-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          size="lg"
          className={`rounded-full w-14 h-14 shadow-lg transition-all duration-300 ${
            isOpen
              ? 'bg-muted hover:bg-muted/80'
              : 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 animate-pulse-gentle'
          }`}
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Heart className="w-6 h-6 text-white" />
          )}
        </Button>
      </motion.div>

      {/* Quick Actions Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-24 left-6 z-50"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <Card className="p-4 glass shadow-xl border-primary/20">
              <p className="text-sm font-medium mb-3 text-center">Need to calm down?</p>
              <div className="flex flex-col gap-2">
                {quickActions.map((action) => (
                  <Link key={action.label} to={action.link} onClick={() => setIsOpen(false)}>
                    <Button
                      variant="ghost"
                      className={`w-full justify-start gap-3 ${action.color} hover:opacity-80`}
                    >
                      <action.icon className="w-5 h-5" />
                      {action.label}
                    </Button>
                  </Link>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                You're not alone. 💜
              </p>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
