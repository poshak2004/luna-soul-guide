import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bell } from 'lucide-react';

export const NotificationsSettings = () => {
  const [settings, setSettings] = useState({
    email: true,
    push: true,
    dailyReminder: true,
    achievements: true,
  });

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="email">Email Notifications</Label>
          <Switch
            id="email"
            checked={settings.email}
            onCheckedChange={(v) => setSettings({ ...settings, email: v })}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="push">Push Notifications</Label>
          <Switch
            id="push"
            checked={settings.push}
            onCheckedChange={(v) => setSettings({ ...settings, push: v })}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="daily">Daily Reminders</Label>
          <Switch
            id="daily"
            checked={settings.dailyReminder}
            onCheckedChange={(v) => setSettings({ ...settings, dailyReminder: v })}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="achievements">Achievement Alerts</Label>
          <Switch
            id="achievements"
            checked={settings.achievements}
            onCheckedChange={(v) => setSettings({ ...settings, achievements: v })}
          />
        </div>
      </CardContent>
    </Card>
  );
};
