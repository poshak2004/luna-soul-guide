-- Add server-side restrictions to the sounds storage bucket
UPDATE storage.buckets
SET file_size_limit = 20971520, -- 20MB limit matching client-side
    allowed_mime_types = ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/x-wav', 'audio/wave']
WHERE id = 'sounds';