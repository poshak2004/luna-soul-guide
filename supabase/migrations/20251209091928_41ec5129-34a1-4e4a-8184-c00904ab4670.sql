-- Add Luna preference columns to user_settings table
ALTER TABLE public.user_settings
ADD COLUMN IF NOT EXISTS luna_visible boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS message_frequency text DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS luna_size text DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS show_celebrations boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS show_encouragement boolean DEFAULT true;

-- Add check constraint for valid values
ALTER TABLE public.user_settings
ADD CONSTRAINT valid_message_frequency CHECK (message_frequency IN ('low', 'medium', 'high')),
ADD CONSTRAINT valid_luna_size CHECK (luna_size IN ('small', 'medium', 'large'));