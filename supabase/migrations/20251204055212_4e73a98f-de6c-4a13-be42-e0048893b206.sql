-- Add XP fields to user_profiles
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS xp_total integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_level integer DEFAULT 1;

-- Create user_settings table for preferences
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  daily_reminder_enabled boolean DEFAULT false,
  reminder_time time DEFAULT '09:00:00',
  streak_reminders boolean DEFAULT true,
  theme text DEFAULT 'auto',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on user_settings
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_settings
CREATE POLICY "Users can view their own settings" 
ON public.user_settings FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" 
ON public.user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" 
ON public.user_settings FOR UPDATE USING (auth.uid() = user_id);

-- Add more badges for gamification
INSERT INTO public.badges (name, description, icon, points_required) VALUES
('Early Bird', 'Complete 3 morning sessions', 'sunrise', 50),
('Night Owl', 'Complete 3 evening sessions', 'moon', 50),
('Explorer', 'Try all exercise types', 'compass', 100),
('Zen Master', 'Complete 50 breathing exercises', 'wind', 500),
('Journal Keeper', 'Write 30 journal entries', 'book-open', 300),
('Sound Healer', 'Complete 20 sound therapy sessions', 'headphones', 200),
('Colour Artist', 'Complete 15 colour therapy sessions', 'palette', 150),
('Streak Champion', 'Maintain a 30-day streak', 'flame', 1000)
ON CONFLICT DO NOTHING;

-- Trigger for user_settings updated_at
CREATE OR REPLACE TRIGGER update_user_settings_updated_at
BEFORE UPDATE ON public.user_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();