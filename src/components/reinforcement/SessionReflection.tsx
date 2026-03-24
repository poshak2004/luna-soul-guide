import { Button } from '@/components/ui/button';
import { Focus, Zap } from 'lucide-react';

interface SessionReflectionProps {
  onReflect: (quality: 'focused' | 'distracted') => void;
}

export const SessionReflection = ({ onReflect }: SessionReflectionProps) => {
  return (
    <div className="flex flex-col gap-3 p-4 bg-muted/20 rounded-xl border border-border/50">
      <p className="text-sm font-medium text-foreground">How was your session?</p>
      <div className="flex gap-3">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 gap-2"
          onClick={() => onReflect('focused')}
        >
          <Focus className="w-4 h-4 text-primary" />
          Focused
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 gap-2"
          onClick={() => onReflect('distracted')}
        >
          <Zap className="w-4 h-4 text-muted-foreground" />
          Distracted
        </Button>
      </div>
    </div>
  );
};
