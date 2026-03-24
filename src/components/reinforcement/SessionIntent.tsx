import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Target } from 'lucide-react';

interface SessionIntentProps {
  onSubmit: (intent: string) => void;
  onSkip: () => void;
}

export const SessionIntent = ({ onSubmit, onSkip }: SessionIntentProps) => {
  const [intent, setIntent] = useState('');

  return (
    <div className="flex flex-col gap-3 p-4 bg-muted/20 rounded-xl border border-border/50">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Target className="w-4 h-4 text-primary" />
        What's your focus for this session?
      </div>
      <div className="flex gap-2">
        <Input
          value={intent}
          onChange={(e) => setIntent(e.target.value)}
          placeholder="e.g. Stay present, reduce anxiety..."
          className="text-sm"
          maxLength={80}
        />
        <Button size="sm" onClick={() => onSubmit(intent || 'General wellness')} variant="default">
          Start
        </Button>
        <Button size="sm" onClick={onSkip} variant="ghost">
          Skip
        </Button>
      </div>
    </div>
  );
};
