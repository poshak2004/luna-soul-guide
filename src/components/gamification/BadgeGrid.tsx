import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Award } from 'lucide-react';

export const BadgeGrid = () => {
  const [badges, setBadges] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('user_badges')
        .select('*, badges(*)')
        .eq('user_id', user.id);

      setBadges(data || []);
    };

    fetch();

    const channel = supabase
      .channel('badge_updates')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'user_badges' }, () => fetch())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {badges.map((ub, idx) => (
        <motion.div key={ub.id} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: idx * 0.1 }}>
          <Card className="glass text-center">
            <CardContent className="pt-6">
              <Award className="w-12 h-12 mx-auto mb-2 text-primary" />
              <p className="font-medium">{ub.badges.name}</p>
              <p className="text-xs text-muted-foreground mt-1">{ub.badges.description}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
