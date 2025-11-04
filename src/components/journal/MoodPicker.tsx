import { cn } from '@/lib/utils';
import { Smile, Meh, Frown, CloudRain, Heart, Zap } from 'lucide-react';

const moods = [
  { value: 'joyful', label: 'Joyful', icon: Heart, color: 'text-accent' },
  { value: 'calm', label: 'Calm', icon: Smile, color: 'text-primary' },
  { value: 'neutral', label: 'Neutral', icon: Meh, color: 'text-muted-foreground' },
  { value: 'anxious', label: 'Anxious', icon: Zap, color: 'text-support' },
  { value: 'sad', label: 'Sad', icon: CloudRain, color: 'text-secondary' },
  { value: 'stressed', label: 'Stressed', icon: Frown, color: 'text-destructive' },
];

interface MoodPickerProps {
  value: string;
  onChange: (mood: string) => void;
}

export const MoodPicker = ({ value, onChange }: MoodPickerProps) => (
  <div className="grid grid-cols-3 gap-3">
    {moods.map(({ value: moodValue, label, icon: Icon, color }) => (
      <button
        key={moodValue}
        onClick={() => onChange(moodValue)}
        className={cn(
          'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all',
          value === moodValue ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
        )}
      >
        <Icon className={cn('w-6 h-6', color)} />
        <span className="text-sm font-medium">{label}</span>
      </button>
    ))}
  </div>
);
