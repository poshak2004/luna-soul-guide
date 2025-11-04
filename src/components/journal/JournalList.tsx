import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

export const JournalList = ({ refresh }: { refresh: number }) => {
  const [entries, setEntries] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      setEntries(data || []);
    };

    fetch();
  }, [refresh]);

  return (
    <div className="space-y-3">
      {entries.map((entry, idx) => (
        <motion.div key={entry.id} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: idx * 0.1 }}>
          <Card className="glass">
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">{format(new Date(entry.created_at), 'PPP')}</p>
              <p className="mt-2 line-clamp-3">{entry.content}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
