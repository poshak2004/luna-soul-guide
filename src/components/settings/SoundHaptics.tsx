import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Volume2 } from 'lucide-react';

export const SoundHaptics = () => {
  const [enabled, setEnabled] = useState(true);
  const [volume, setVolume] = useState([70]);

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="w-5 h-5" />
          Sound & Haptics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <Label htmlFor="sound">Sound Effects</Label>
          <Switch id="sound" checked={enabled} onCheckedChange={setEnabled} />
        </div>
        <div className="space-y-2">
          <Label>Volume: {volume[0]}%</Label>
          <Slider value={volume} onValueChange={setVolume} max={100} step={1} disabled={!enabled} />
        </div>
      </CardContent>
    </Card>
  );
};
