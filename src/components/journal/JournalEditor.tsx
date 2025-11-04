import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MoodPicker } from './MoodPicker';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { JournalInputSchema } from '@/schemas/zodSchemas';
import { rpcWithRetry } from '@/lib/supabaseHelper';

export const JournalEditor = ({ onSave }: { onSave: () => void }) => {
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('neutral');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    try {
      JournalInputSchema.parse({ mood, content });
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setIsSubmitting(true);

      // Use atomic RPC function
      const { data, error } = await rpcWithRetry<any>('create_journal_and_award', {
        _user_id: user.id,
        _mood: mood,
        _content: content
      });

      if (error) throw error;
      
      toast({ 
        title: 'Journal saved!', 
        description: `+${data.points_earned} wellness points earned` 
      });
      
      setContent('');
      setMood('neutral');
      onSave();
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to save journal', 
        variant: 'destructive' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <MoodPicker value={mood} onChange={setMood} />
      <Textarea
        placeholder="How are you feeling today?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={6}
        className="resize-none"
      />
      <Button onClick={handleSave} disabled={!content.trim() || isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save Entry'}
      </Button>
    </div>
  );
};
