import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { User } from 'lucide-react';

export const AccountSettings = () => {
  const [username, setUsername] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const fetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('user_profiles').select('anonymous_username').eq('user_id', user.id).single();
      if (data) setUsername(data.anonymous_username);
    };
    fetch();
  }, []);

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    await supabase.from('user_profiles').update({ anonymous_username: username }).eq('user_id', user.id);
    toast({ title: 'Account updated', description: 'Your username has been saved' });
  };

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Account Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Display Name</label>
          <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Your username" />
        </div>
        <Button onClick={handleSave}>Save Changes</Button>
      </CardContent>
    </Card>
  );
};
