import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Zap, Gauge, Sparkles } from 'lucide-react';

interface PerformancePrefs {
  smooth_scrolling: boolean;
  high_refresh_mode: boolean;
  animation_intensity: number;
  reduce_motion: boolean;
}

export const PerformanceSettings = () => {
  const [loading, setLoading] = useState(true);
  const [prefs, setPrefs] = useState<PerformancePrefs>({
    smooth_scrolling: true,
    high_refresh_mode: true,
    animation_intensity: 100,
    reduce_motion: false,
  });

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // For now, use localStorage until we add user_settings table
        const stored = localStorage.getItem('performance_prefs');
        if (stored) {
          setPrefs(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, []);

  const updatePref = (key: keyof PerformancePrefs, value: any) => {
    const updated = { ...prefs, [key]: value };
    setPrefs(updated);
    localStorage.setItem('performance_prefs', JSON.stringify(updated));
    
    // Apply settings immediately
    if (key === 'reduce_motion') {
      document.documentElement.style.setProperty(
        '--animation-duration',
        value ? '0.01s' : '0.4s'
      );
    }
    
    toast.success('Performance setting updated');
  };

  if (loading) {
    return <div className="animate-pulse h-64 bg-secondary rounded-lg" />;
  }

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Zap className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Performance & Motion</h3>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="smooth-scroll">Smooth Scrolling</Label>
              <p className="text-sm text-muted-foreground">
                Enable buttery-smooth inertia scrolling
              </p>
            </div>
            <Switch
              id="smooth-scroll"
              checked={prefs.smooth_scrolling}
              onCheckedChange={(checked) => updatePref('smooth_scrolling', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="high-refresh">120Hz Optimization</Label>
              <p className="text-sm text-muted-foreground">
                Enhanced animations for high-refresh displays
              </p>
            </div>
            <Switch
              id="high-refresh"
              checked={prefs.high_refresh_mode}
              onCheckedChange={(checked) => updatePref('high_refresh_mode', checked)}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <Label>Animation Intensity</Label>
            </div>
            <div className="flex items-center gap-4">
              <Slider
                value={[prefs.animation_intensity]}
                onValueChange={(values) => updatePref('animation_intensity', values[0])}
                max={100}
                step={25}
                className="flex-1"
              />
              <span className="text-sm font-medium w-12 text-right">
                {prefs.animation_intensity}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Lower values reduce visual effects for better performance
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="reduce-motion">Reduce Motion</Label>
              <p className="text-sm text-muted-foreground">
                Minimize animations for accessibility
              </p>
            </div>
            <Switch
              id="reduce-motion"
              checked={prefs.reduce_motion}
              onCheckedChange={(checked) => updatePref('reduce_motion', checked)}
            />
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-secondary/50">
        <div className="flex items-center gap-3 mb-3">
          <Gauge className="w-5 h-5 text-primary" />
          <h4 className="font-medium">Performance Tips</h4>
        </div>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Enable 120Hz mode for smoother animations on compatible displays</li>
          <li>• Lower animation intensity on older devices for better performance</li>
          <li>• Reduce motion mode improves battery life and accessibility</li>
          <li>• Smooth scrolling uses GPU acceleration for fluid navigation</li>
        </ul>
      </Card>
    </div>
  );
};
