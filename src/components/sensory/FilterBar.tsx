import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const categories = ['All', 'Sleep', 'Focus', 'Meditation', 'Relaxation'];
const moods = ['calm', 'peaceful', 'joyful', 'relaxed', 'focused'];

interface FilterBarProps {
  selectedCategory: string;
  selectedMoods: string[];
  onCategoryChange: (category: string) => void;
  onMoodToggle: (mood: string) => void;
}

export const FilterBar = ({
  selectedCategory,
  selectedMoods,
  onCategoryChange,
  onMoodToggle,
}: FilterBarProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Categories */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">Category</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => onCategoryChange(category)}
              className="rounded-full"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Moods */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">Mood</h3>
        <div className="flex flex-wrap gap-2">
          {moods.map((mood) => (
            <Badge
              key={mood}
              variant={selectedMoods.includes(mood) ? 'default' : 'outline'}
              className="cursor-pointer capitalize px-3 py-1.5"
              onClick={() => onMoodToggle(mood)}
            >
              {mood}
            </Badge>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
