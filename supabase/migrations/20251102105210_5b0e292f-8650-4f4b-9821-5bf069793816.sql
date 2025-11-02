-- Create user_artworks table for storing art therapy creations
CREATE TABLE public.user_artworks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'Untitled Artwork',
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  canvas_data JSONB,
  duration_seconds INTEGER,
  mood_tag TEXT,
  color_palette TEXT,
  brush_strokes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_artworks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own artworks"
  ON public.user_artworks
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own artworks"
  ON public.user_artworks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own artworks"
  ON public.user_artworks
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own artworks"
  ON public.user_artworks
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_user_artworks_updated_at
  BEFORE UPDATE ON public.user_artworks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for artworks
INSERT INTO storage.buckets (id, name, public)
VALUES ('artworks', 'artworks', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for artworks
CREATE POLICY "Users can view their own artwork files"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'artworks' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own artwork files"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'artworks' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own artwork files"
  ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'artworks' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own artwork files"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'artworks' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create index for faster queries
CREATE INDEX idx_user_artworks_user_id ON public.user_artworks(user_id);
CREATE INDEX idx_user_artworks_created_at ON public.user_artworks(created_at DESC);