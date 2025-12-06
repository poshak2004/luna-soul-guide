import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const NotificationsSettings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    daily_reminder_enabled: true,
    reminder_time: '09:00',
    streak_reminders: true,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setSettings({
          daily_reminder_enabled: data.daily_reminder_enabled ?? true,
          reminder_time: data.reminder_time ?? '09:00',
          streak_reminders: data.streak_reminders ?? true,
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, value: boolean | string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          [key]: value,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (error) throw error;

      setSettings(prev => ({ ...prev, [key]: value }));
      toast({
        title: 'Settings saved',
        description: 'Your notification preferences have been updated.',
      });
    } catch (error) {
      console.error('Error updating setting:', error);
      toast({
        title: 'Error',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const timeOptions = [
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'
  ];

  if (loading) {
    return (
      <Card className="glass">
        <CardContent className="pt-6">
          <div className="h-32 animate-pulse bg-muted/50 rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="daily" className="font-medium">Daily Check-in Reminder</Label>
            <p className="text-sm text-muted-foreground">Get reminded to log your mood</p>
          </div>
          <Switch
            id="daily"
            checked={settings.daily_reminder_enabled}
            onCheckedChange={(v) => updateSetting('daily_reminder_enabled', v)}
          />
        </div>

        {settings.daily_reminder_enabled && (
          <div className="flex items-center justify-between pl-4 border-l-2 border-primary/30">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <Label htmlFor="time" className="font-medium">Reminder Time</Label>
            </div>
            <Select
              value={settings.reminder_time}
              onValueChange={(v) => updateSetting('reminder_time', v)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timeOptions.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="streak" className="font-medium">Streak Reminders</Label>
            <p className="text-sm text-muted-foreground">Alert when your streak is at risk</p>
          </div>
          <Switch
            id="streak"
            checked={settings.streak_reminders}
            onCheckedChange={(v) => updateSetting('streak_reminders', v)}
          />
        </div>
      </CardContent>
    </Card>
  );
};
