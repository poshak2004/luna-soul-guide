import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface JournalEntry {
  id: string;
  content: string;
  mood_label: string;
  mood_score: number;
  tags: string[];
  created_at: string;
  updated_at: string;
  user_id: string;
}

export const useJournal = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchEntries();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('journal_entries')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'journal_entries',
        },
        () => {
          fetchEntries();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchEntries = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setEntries([]);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error fetching entries:', error);
      toast({
        title: 'Error',
        description: 'Failed to load journal entries',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveEntry = async (content: string, moodLabel: string = 'neutral', moodScore: number = 5, tags: string[] = []) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: 'Authentication required',
          description: 'Please sign in to save journal entries',
          variant: 'destructive',
        });
        return null;
      }

      const { data, error } = await supabase
        .from('journal_entries')
        .insert({
          user_id: user.id,
          content,
          mood_label: moodLabel,
          mood_score: moodScore,
          tags,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Saved',
        description: 'Journal entry saved successfully',
      });

      return data;
    } catch (error) {
      console.error('Error saving entry:', error);
      toast({
        title: 'Error',
        description: 'Failed to save journal entry',
        variant: 'destructive',
      });
      return null;
    }
  };

  const deleteEntry = async (id: string) => {
    try {
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Deleted',
        description: 'Journal entry deleted',
      });
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete entry',
        variant: 'destructive',
      });
    }
  };

  return { entries, isLoading, saveEntry, deleteEntry, refetch: fetchEntries };
};
