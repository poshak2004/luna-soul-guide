import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface MoodGradientProps {
  category?: string;
  amplitude?: number;
}

const moodGradients = {
  sleep: {
    from: 'hsl(240, 60%, 20%)',
    via: 'hsl(260, 50%, 30%)',
    to: 'hsl(220, 55%, 25%)',
  },
  focus: {
    from: 'hsl(140, 50%, 45%)',
    via: 'hsl(160, 45%, 50%)',
    to: 'hsl(120, 55%, 40%)',
  },
  meditation: {
    from: 'hsl(280, 55%, 50%)',
    via: 'hsl(260, 50%, 60%)',
    to: 'hsl(300, 45%, 55%)',
  },
  relaxation: {
    from: 'hsl(195, 60%, 55%)',
    via: 'hsl(180, 55%, 60%)',
    to: 'hsl(210, 50%, 50%)',
  },
};

export const MoodGradient = ({ category = 'relaxation', amplitude = 0 }: MoodGradientProps) => {
  const [gradient, setGradient] = useState(moodGradients.relaxation);

  useEffect(() => {
    const moodKey = category.toLowerCase() as keyof typeof moodGradients;
    setGradient(moodGradients[moodKey] || moodGradients.relaxation);
  }, [category]);

  return (
    <motion.div
      className="fixed inset-0 pointer-events-none -z-10"
      animate={{
        background: `radial-gradient(circle at ${50 + amplitude * 10}% ${50 + amplitude * 10}%, 
          ${gradient.from}, 
          ${gradient.via}, 
          ${gradient.to})`,
        opacity: 0.3 + amplitude * 0.2,
      }}
      transition={{
        duration: 2,
        ease: 'easeInOut',
      }}
      style={{ willChange: 'background, opacity' }}
    />
  );
};
