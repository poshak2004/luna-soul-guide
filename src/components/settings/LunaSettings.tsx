import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Moon, MessageCircle, Sparkles, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

interface LunaPreferences {
  luna_visible: boolean;
  message_frequency: 'low' | 'medium' | 'high';
  luna_size: 'small' | 'medium' | 'large';
  show_celebrations: boolean;
  show_encouragement: boolean;
}

const defaultPreferences: LunaPreferences = {
  luna_visible: true,
  message_frequency: 'medium',
  luna_size: 'medium',
  show_celebrations: true,
  show_encouragement: true,
};

export const LunaSettings = () => {
  const [preferences, setPreferences] = useState<LunaPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        // Luna preferences stored in the settings - use defaults if not set
        // Type assertion needed as these columns are added dynamically
        const settingsData = data as Record<string, unknown>;
        const lunaPrefs = {
          luna_visible: (settingsData.luna_visible as boolean) ?? defaultPreferences.luna_visible,
          message_frequency: (settingsData.message_frequency as LunaPreferences['message_frequency']) ?? defaultPreferences.message_frequency,
          luna_size: (settingsData.luna_size as LunaPreferences['luna_size']) ?? defaultPreferences.luna_size,
          show_celebrations: (settingsData.show_celebrations as boolean) ?? defaultPreferences.show_celebrations,
          show_encouragement: (settingsData.show_encouragement as boolean) ?? defaultPreferences.show_encouragement,
        };
        setPreferences(lunaPrefs);
      }
    } catch (error) {
      console.error('Error loading Luna preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async <K extends keyof LunaPreferences>(
    key: K,
    value: LunaPreferences[K]
  ) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          [key]: value,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        });

      if (error) throw error;
      toast.success('Luna preferences updated');
    } catch (error) {
      console.error('Error saving Luna preferences:', error);
      toast.error('Failed to save preferences');
    }
  };

  if (loading) {
    return (
      <Card className="p-6 glass">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3" />
          <div className="h-10 bg-muted rounded" />
          <div className="h-10 bg-muted rounded" />
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Luna Visibility */}
      <Card className="p-6 glass">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
            <Moon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Luna Companion</h3>
            <p className="text-sm text-muted-foreground">Customize your virtual pet guide</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Visibility Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {preferences.luna_visible ? (
                <Eye className="w-4 h-4 text-muted-foreground" />
              ) : (
                <EyeOff className="w-4 h-4 text-muted-foreground" />
              )}
              <div>
                <Label htmlFor="luna-visible" className="font-medium">Show Luna</Label>
                <p className="text-sm text-muted-foreground">Display Luna on all pages</p>
              </div>
            </div>
            <Switch
              id="luna-visible"
              checked={preferences.luna_visible}
              onCheckedChange={(checked) => updatePreference('luna_visible', checked)}
            />
          </div>

          {/* Size Selection */}
          <div className="space-y-3">
            <Label className="font-medium">Luna Size</Label>
            <RadioGroup
              value={preferences.luna_size}
              onValueChange={(value) => updatePreference('luna_size', value as LunaPreferences['luna_size'])}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="small" id="size-small" />
                <Label htmlFor="size-small" className="cursor-pointer">Small</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="size-medium" />
                <Label htmlFor="size-medium" className="cursor-pointer">Medium</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="large" id="size-large" />
                <Label htmlFor="size-large" className="cursor-pointer">Large</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </Card>

      {/* Message Settings */}
      <Card className="p-6 glass">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent/30 to-primary/30 flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Messages & Interactions</h3>
            <p className="text-sm text-muted-foreground">Control how Luna communicates with you</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Message Frequency */}
          <div className="space-y-3">
            <Label className="font-medium">Message Frequency</Label>
            <p className="text-sm text-muted-foreground">How often Luna shares messages</p>
            <RadioGroup
              value={preferences.message_frequency}
              onValueChange={(value) => updatePreference('message_frequency', value as LunaPreferences['message_frequency'])}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="low" id="freq-low" />
                <Label htmlFor="freq-low" className="cursor-pointer">Quiet</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="freq-medium" />
                <Label htmlFor="freq-medium" className="cursor-pointer">Balanced</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="high" id="freq-high" />
                <Label htmlFor="freq-high" className="cursor-pointer">Chatty</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Celebrations Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-muted-foreground" />
              <div>
                <Label htmlFor="celebrations" className="font-medium">Celebrations</Label>
                <p className="text-sm text-muted-foreground">Luna celebrates your achievements</p>
              </div>
            </div>
            <Switch
              id="celebrations"
              checked={preferences.show_celebrations}
              onCheckedChange={(checked) => updatePreference('show_celebrations', checked)}
            />
          </div>

          {/* Encouragement Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-4 h-4 text-muted-foreground" />
              <div>
                <Label htmlFor="encouragement" className="font-medium">Encouragement</Label>
                <p className="text-sm text-muted-foreground">Luna offers supportive messages</p>
              </div>
            </div>
            <Switch
              id="encouragement"
              checked={preferences.show_encouragement}
              onCheckedChange={(checked) => updatePreference('show_encouragement', checked)}
            />
          </div>
        </div>
      </Card>

      {/* Preview */}
      <Card className="p-6 glass overflow-hidden">
        <h3 className="text-lg font-semibold mb-4">Preview</h3>
        <div className="relative h-24 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center">
          {preferences.luna_visible ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`rounded-full bg-gradient-to-br from-primary/50 to-accent/50 flex items-center justify-center shadow-lg ${
                preferences.luna_size === 'small' ? 'w-10 h-10' :
                preferences.luna_size === 'large' ? 'w-20 h-20' : 'w-14 h-14'
              }`}
            >
              <Moon className={`text-primary-foreground ${
                preferences.luna_size === 'small' ? 'w-5 h-5' :
                preferences.luna_size === 'large' ? 'w-10 h-10' : 'w-7 h-7'
              }`} />
            </motion.div>
          ) : (
            <p className="text-muted-foreground text-sm">Luna is hidden</p>
          )}
        </div>
      </Card>
    </div>
  );
};
