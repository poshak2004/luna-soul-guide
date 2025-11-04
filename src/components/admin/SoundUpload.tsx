import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Music, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SoundUploadProps {
  onUploadComplete: () => void;
}

export const SoundUpload = ({ onUploadComplete }: SoundUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [moods, setMoods] = useState('');
  const [purposes, setPurposes] = useState('');
  const [category, setCategory] = useState('relaxation');
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.type.includes('audio')) {
      toast.error('Please select a valid audio file');
      return;
    }

    if (selectedFile.size > 20 * 1024 * 1024) {
      toast.error('File size must be less than 20MB');
      return;
    }

    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
  };

  const handleUpload = async () => {
    if (!file || !title) {
      toast.error('Please provide a file and title');
      return;
    }

    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `therapy/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('sounds')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('sounds')
        .getPublicUrl(filePath);

      const moodsArray = moods.split(',').map(m => m.trim()).filter(Boolean);
      const purposesArray = purposes.split(',').map(p => p.trim()).filter(Boolean);

      const { error: insertError } = await supabase
        .from('sound_therapy')
        .insert({
          title,
          description,
          moods: moodsArray.length > 0 ? moodsArray : ['calm'],
          purposes: purposesArray.length > 0 ? purposesArray : ['relaxation'],
          category,
          file_url: publicUrl,
          duration_options: [60, 300, 600, 1200],
        });

      if (insertError) throw insertError;

      toast.success('✅ Sound uploaded successfully');
      
      setFile(null);
      setTitle('');
      setDescription('');
      setMoods('');
      setPurposes('');
      setPreviewUrl(null);
      
      onUploadComplete();
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload sound');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-4">Upload New Sound</h3>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="file-upload">Audio File (MP3/WAV, max 20MB)</Label>
          <div className="mt-2">
            {!file ? (
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors"
              >
                <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Click to upload audio</span>
                <input
                  id="file-upload"
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            ) : (
              <div className="flex items-center gap-4 p-4 bg-secondary rounded-lg">
                <Music className="w-6 h-6 text-primary" />
                <div className="flex-1">
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                {previewUrl && (
                  <audio src={previewUrl} controls className="max-w-xs" />
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setFile(null);
                    setPreviewUrl(null);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Peaceful Rain"
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the sound and its benefits..."
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="relaxation">Relaxation</option>
            <option value="sleep">Sleep</option>
            <option value="focus">Focus</option>
            <option value="meditation">Meditation</option>
          </select>
        </div>

        <div>
          <Label htmlFor="moods">Moods (comma-separated)</Label>
          <Input
            id="moods"
            value={moods}
            onChange={(e) => setMoods(e.target.value)}
            placeholder="e.g., calm, peaceful, serene"
          />
        </div>

        <div>
          <Label htmlFor="purposes">Purposes (comma-separated)</Label>
          <Input
            id="purposes"
            value={purposes}
            onChange={(e) => setPurposes(e.target.value)}
            placeholder="e.g., sleep, relaxation, focus"
          />
        </div>

        <Button
          onClick={handleUpload}
          disabled={!file || !title || uploading}
          className="w-full"
        >
          {uploading ? 'Uploading...' : 'Upload Sound'}
        </Button>
      </div>
    </Card>
  );
};
