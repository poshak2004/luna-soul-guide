import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useStreak = () => {
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStreak = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase.from('user_profiles').select('current_streak').eq('user_id', user.id).single();
      if (data) setStreak(data.current_streak);
      setLoading(false);
    };

    fetchStreak();

    const channel = supabase
      .channel('streak_updates')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'user_profiles' }, (payload) => {
        setStreak(payload.new.current_streak);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return { streak, loading };
};
