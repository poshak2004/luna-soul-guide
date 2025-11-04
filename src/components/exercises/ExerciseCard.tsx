import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface ExerciseCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  points: number;
  onStart: () => void;
}

export const ExerciseCard = ({ title, description, icon: Icon, points, onStart }: ExerciseCardProps) => (
  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
    <Card className="glass hover-lift">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{description}</p>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-secondary">+{points} points</span>
          <Button onClick={onStart} size="sm">Start</Button>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);
