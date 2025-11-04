import { ExerciseCard } from './ExerciseCard';
import { Wind, Brain, Heart, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const exercises = [
  { id: 'breathe', title: 'Breathe Sync', icon: Wind, description: 'Guided breathing exercise', points: 10, path: '/exercises' },
  { id: 'focus', title: 'Focus Sprint', icon: Brain, description: 'Concentration training', points: 15, path: '/exercises' },
  { id: 'mindful', title: 'Mind Mirror', icon: Heart, description: 'Mindfulness practice', points: 10, path: '/exercises' },
  { id: 'mood', title: 'Mood Flow', icon: Sparkles, description: 'Emotional awareness', points: 10, path: '/exercises' },
];

export const ExerciseList = () => {
  const navigate = useNavigate();

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {exercises.map((ex) => (
        <ExerciseCard key={ex.id} {...ex} onStart={() => navigate(ex.path)} />
      ))}
    </div>
  );
};
