import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Sound {
  id: string;
  title: string;
  description: string;
  category: string;
  moods: string[];
  purposes: string[];
  file_url: string;
  play_count: number;
  created_at: string;
}

interface SoundListProps {
  sounds: Sound[];
  onDelete: () => void;
}

export const SoundList = ({ sounds, onDelete }: SoundListProps) => {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handlePlay = (sound: Sound) => {
    if (audioElement) {
      audioElement.pause();
      audioElement.remove();
    }

    if (playingId === sound.id) {
      setPlayingId(null);
      setAudioElement(null);
      return;
    }

    const audio = new Audio(sound.file_url);
    audio.play();
    setAudioElement(audio);
    setPlayingId(sound.id);

    audio.onended = () => {
      setPlayingId(null);
      setAudioElement(null);
    };
  };

  const handleDelete = async (sound: Sound) => {
    setDeleting(sound.id);

    try {
      if (playingId === sound.id && audioElement) {
        audioElement.pause();
        setPlayingId(null);
        setAudioElement(null);
      }

      const urlPath = sound.file_url.split('/sounds/')[1];
      if (urlPath && urlPath.startsWith('therapy/')) {
        await supabase.storage.from('sounds').remove([urlPath]);
      }

      const { error } = await supabase
        .from('sound_therapy')
        .delete()
        .eq('id', sound.id);

      if (error) throw error;

      toast.success('Sound deleted successfully');
      onDelete();
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(error.message || 'Failed to delete sound');
    } finally {
      setDeleting(null);
    }
  };

  if (sounds.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No sounds uploaded yet</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {sounds.map((sound) => (
        <motion.div
          key={sound.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-4">
            <div className="flex items-start gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePlay(sound)}
                className="shrink-0"
              >
                {playingId === sound.id ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </Button>

              <div className="flex-1 min-w-0">
                <h4 className="font-semibold">{sound.title}</h4>
                {sound.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {sound.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="outline">{sound.category}</Badge>
                  {sound.moods.map((mood) => (
                    <Badge key={mood} variant="secondary">
                      {mood}
                    </Badge>
                  ))}
                  <Badge variant="outline">
                    {sound.play_count} plays
                  </Badge>
                </div>
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={deleting === sound.id}
                    className="shrink-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Sound</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{sound.title}"? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(sound)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
