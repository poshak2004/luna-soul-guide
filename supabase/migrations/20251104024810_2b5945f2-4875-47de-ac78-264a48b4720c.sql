-- Create user roles system for admin access control
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Update sound_therapy RLS policies for admin management
DROP POLICY IF EXISTS "Authenticated users can insert sounds" ON public.sound_therapy;
DROP POLICY IF EXISTS "Authenticated users can update sounds" ON public.sound_therapy;

CREATE POLICY "Admins can insert sounds"
ON public.sound_therapy
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update sounds"
ON public.sound_therapy
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete sounds"
ON public.sound_therapy
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Update existing sounds with real playable URLs
UPDATE public.sound_therapy
SET file_url = 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_4037ff6f88.mp3'
WHERE title = 'Gentle Rain';

UPDATE public.sound_therapy
SET file_url = 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3'
WHERE title = 'Ocean Waves';

UPDATE public.sound_therapy
SET file_url = 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_12b0c7443c.mp3'
WHERE title = 'Forest Ambience';

UPDATE public.sound_therapy
SET file_url = 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_9ce9adfd28.mp3'
WHERE title = 'White Noise';

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;