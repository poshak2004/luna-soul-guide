import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MoodPicker } from './MoodPicker';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useGamification } from '@/hooks/useGamification';
import { JournalInputSchema } from '@/schemas/zodSchemas';

export const JournalEditor = ({ onSave }: { onSave: () => void }) => {
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('neutral');
  const { toast } = useToast();
  const { addActivity } = useGamification();

  const handleSave = async () => {
    try {
      JournalInputSchema.parse({ mood, content });
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('journal_entries').insert({ user_id: user.id, content, mood_label: mood });
      await addActivity('journal_entry', 5);
      
      toast({ title: 'Journal saved!', description: '+5 wellness points earned' });
      setContent('');
      setMood('neutral');
      onSave();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
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
      <Button onClick={handleSave} disabled={!content.trim()}>Save Entry</Button>
    </div>
  );
};
