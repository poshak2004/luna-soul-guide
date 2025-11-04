import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const usePoints = () => {
  const [totalPoints, setTotalPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPoints = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase.from('user_profiles').select('total_points').eq('user_id', user.id).single();
      if (data) setTotalPoints(data.total_points);
      setLoading(false);
    };

    fetchPoints();

    // Real-time subscription
    const channel = supabase
      .channel('points_updates')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'user_profiles' }, (payload) => {
        setTotalPoints(payload.new.total_points);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return { totalPoints, loading };
};
