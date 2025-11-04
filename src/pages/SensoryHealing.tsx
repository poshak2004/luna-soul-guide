import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Music } from 'lucide-react';
import { AuthGate } from '@/components/AuthGate';
import { Logo } from '@/components/Logo';
import { SoundCard } from '@/components/sensory/SoundCard';
import { AudioPlayer } from '@/components/sensory/AudioPlayer';
import { FilterBar } from '@/components/sensory/FilterBar';
import { MoodSync } from '@/components/sensory/MoodSync';
import { AmbientParticles } from '@/components/sensory/AmbientParticles';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { rpcWithRetry } from '@/lib/supabaseHelper';
import { Skeleton } from '@/components/ui/skeleton';

interface Sound {
  id: string;
  title: string;
  description?: string;
  moods: string[];
  purposes: string[];
  category: string;
  file_url: string;
  duration_options: number[];
  play_count: number;
}

const SensoryHealing = () => {
  const [sounds, setSounds] = useState<Sound[]>([]);
  const [filteredSounds, setFilteredSounds] = useState<Sound[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [currentSound, setCurrentSound] = useState<Sound | null>(null);
  const [selectedDuration, setSelectedDuration] = useState(300); // 5 minutes default
  const [sessionId, setSessionId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchSounds();
  }, []);

  useEffect(() => {
    filterSounds();
  }, [sounds, selectedCategory, selectedMoods]);

  const fetchSounds = async () => {
    const { data, error } = await supabase
      .from('sound_therapy')
      .select('*')
      .order('play_count', { ascending: false });

    if (error) {
      if (import.meta.env.DEV) console.error('Error fetching sounds:', error);
      toast({
        title: 'Error',
        description: 'Failed to load sounds',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    setSounds(data || []);
    setLoading(false);
  };

  const filterSounds = () => {
    let filtered = sounds;

    if (selectedCategory !== 'All') {
      filtered = filtered.filter((s) => s.category === selectedCategory);
    }

    if (selectedMoods.length > 0) {
      filtered = filtered.filter((s) =>
        s.moods.some((mood) => selectedMoods.includes(mood))
      );
    }

    setFilteredSounds(filtered);
  };

  const handlePlay = async (sound: Sound) => {
    if (currentSound?.id === sound.id) {
      // Stop playing
      setCurrentSound(null);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Create session
    const { data: session, error } = await supabase
      .from('user_sound_history')
      .insert({
        user_id: user.id,
        sound_id: sound.id,
        duration_seconds: selectedDuration,
      })
      .select()
      .single();

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to start session',
        variant: 'destructive',
      });
      return;
    }

    setSessionId(session.id);
    setCurrentSound(sound);
  };

  const handleComplete = async () => {
    if (!sessionId || !currentSound) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const { data, error } = await rpcWithRetry<any>('complete_sound_session', {
        _user_id: user.id,
        _sound_id: currentSound.id,
        _duration_seconds: selectedDuration,
        _session_id: sessionId,
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: '🎵 Session Complete!',
          description: `+${data.points_earned} wellness points earned`,
        });

        // Check for badges
        const badgeResult = await rpcWithRetry('check_and_award_badges', {
          _user_id: user.id,
        });

        const badgeData = badgeResult.data as any;
        if (badgeData?.awarded_badges && badgeData.awarded_badges.length > 0) {
          badgeData.awarded_badges.forEach((badge: any) => {
            toast({
              title: '🏆 New Badge Unlocked!',
              description: `You earned the "${badge.name}" badge!`,
            });
          });
        }
      }
    } catch (error: any) {
      if (import.meta.env.DEV) console.error('Error completing session:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete session',
        variant: 'destructive',
      });
    }
  };

  const handleMoodToggle = (mood: string) => {
    setSelectedMoods((prev) =>
      prev.includes(mood) ? prev.filter((m) => m !== mood) : [...prev, mood]
    );
  };

  const handleSoundRecommend = (soundId: string) => {
    const sound = sounds.find((s) => s.id === soundId);
    if (sound) handlePlay(sound);
  };

  return (
    <AuthGate>
      <div className="min-h-screen pt-16 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-950 dark:to-indigo-950 relative overflow-hidden">
        {/* Ambient particles */}
        <AmbientParticles amplitude={currentSound ? 0.5 : 0} />

        <div className="container mx-auto px-4 py-12 relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-4 mb-6">
              <motion.div
                animate={{ rotate: [0, 5, 0, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <Logo size="lg" />
              </motion.div>
              <h1 className="font-display text-6xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                Sound Therapy
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Immerse yourself in healing soundscapes that respond to your rhythm.
              Watch visuals dance with every note. 🎧✨
            </p>
          </motion.div>

          {/* Mood Sync Recommendation */}
          <div className="mb-8">
            <MoodSync onSoundRecommend={handleSoundRecommend} />
          </div>

          {/* Filters */}
          <div className="mb-12">
            <FilterBar
              selectedCategory={selectedCategory}
              selectedMoods={selectedMoods}
              onCategoryChange={setSelectedCategory}
              onMoodToggle={handleMoodToggle}
            />
          </div>

          {/* Duration Selection */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-4 mb-8"
          >
            <span className="text-sm font-medium">Duration:</span>
            {[60, 300, 600, 1200].map((duration) => (
              <button
                key={duration}
                onClick={() => setSelectedDuration(duration)}
                className={`px-4 py-2 rounded-full text-sm transition-all ${
                  selectedDuration === duration
                    ? 'bg-primary text-white shadow-lg'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                {duration < 60 ? `${duration}s` : `${duration / 60}m`}
              </button>
            ))}
          </motion.div>

          {/* Sound Grid */}
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-xl" />
              ))}
            </div>
          ) : filteredSounds.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <Music className="w-20 h-20 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No sounds found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters or check back later for new sounds
              </p>
            </motion.div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSounds.map((sound, index) => (
                <motion.div
                  key={sound.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <SoundCard
                    {...sound}
                    isPlaying={currentSound?.id === sound.id}
                    onPlay={() => handlePlay(sound)}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Audio Player */}
        {currentSound && (
          <AudioPlayer
            soundUrl={currentSound.file_url}
            soundTitle={currentSound.title}
            duration={selectedDuration}
            onComplete={handleComplete}
            onClose={() => setCurrentSound(null)}
          />
        )}
      </div>
    </AuthGate>
  );
};

export default SensoryHealing;
