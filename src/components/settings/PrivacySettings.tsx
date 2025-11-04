import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Shield } from 'lucide-react';

export const PrivacySettings = () => {
  const [settings, setSettings] = useState({
    leaderboardVisible: true,
    profilePublic: false,
    dataSharing: false,
  });

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Privacy Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="leaderboard">Show on Leaderboard</Label>
          <Switch
            id="leaderboard"
            checked={settings.leaderboardVisible}
            onCheckedChange={(v) => setSettings({ ...settings, leaderboardVisible: v })}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="profile">Public Profile</Label>
          <Switch
            id="profile"
            checked={settings.profilePublic}
            onCheckedChange={(v) => setSettings({ ...settings, profilePublic: v })}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="data">Anonymous Data Sharing</Label>
          <Switch
            id="data"
            checked={settings.dataSharing}
            onCheckedChange={(v) => setSettings({ ...settings, dataSharing: v })}
          />
        </div>
      </CardContent>
    </Card>
  );
};
