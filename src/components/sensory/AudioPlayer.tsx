import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, X } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { useAudioVisualizer } from '@/hooks/useAudioVisualizer';
import { spring } from '@/lib/motion';
import { useToast } from '@/hooks/use-toast';

interface AudioPlayerProps {
  soundUrl: string;
  soundTitle: string;
  duration: number;
  onComplete: () => void;
  onClose: () => void;
}

export const AudioPlayer = ({
  soundUrl,
  soundTitle,
  duration,
  onComplete,
  onClose,
}: AudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { frequencyData, amplitude, bass, mid } = useAudioVisualizer(audioRef.current);
  const { toast } = useToast();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      
      // Check if duration is complete
      if (audio.currentTime >= duration) {
        audio.pause();
        setIsPlaying(false);
        onComplete();
      }
    };

    const handleCanPlay = () => setIsLoading(false);
    const handleWaiting = () => setIsLoading(true);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('waiting', handleWaiting);
    
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('waiting', handleWaiting);
    };
  }, [duration, volume, onComplete]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        // Load audio if not loaded
        if (audio.readyState < 2) {
          audio.load();
        }
        
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          await playPromise;
          setIsPlaying(true);
        }
      }
    } catch (error: any) {
      console.error('Playback error:', error);
      if (error.name === 'NotAllowedError') {
        toast({
          title: 'Playback blocked',
          description: 'Please click play again to start audio',
          variant: 'destructive',
        });
      }
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (values: number[]) => {
    const newVolume = values[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (currentTime / duration) * 100;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={spring.medium}
        className="fixed bottom-0 left-0 right-0 z-50 p-4"
        style={{ willChange: 'transform' }}
      >
        <div className="container mx-auto max-w-4xl">
          <motion.div
            className="glass backdrop-blur-xl rounded-2xl shadow-2xl p-6 space-y-4 relative overflow-hidden"
            animate={{
              boxShadow: `0 0 ${20 + amplitude * 60}px hsl(var(--primary) / ${0.3 + amplitude * 0.4})`,
            }}
            style={{ willChange: 'box-shadow' }}
          >
            {/* Animated background glow */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              animate={{
                background: `radial-gradient(circle at 50% 50%, 
                  hsl(var(--primary) / ${bass * 0.2}), 
                  transparent 70%)`,
              }}
              style={{ willChange: 'background' }}
            />

            {/* Enhanced Waveform Visualizer */}
            <div className="flex items-center justify-center h-16 gap-0.5 relative z-10">
              {Array.from(frequencyData).slice(0, 80).map((value, i) => {
                const normalizedValue = value / 255;
                const barHeight = Math.max(normalizedValue * 100, 2);
                
                return (
                  <motion.div
                    key={i}
                    className="w-1 rounded-full"
                    animate={{
                      height: `${barHeight}%`,
                      opacity: 0.4 + normalizedValue * 0.6,
                      background: `linear-gradient(to top, 
                        hsl(var(--primary)), 
                        hsl(var(--accent)))`,
                    }}
                    transition={{ 
                      duration: 0.05,
                      ease: 'easeOut',
                    }}
                    style={{ 
                      willChange: 'height, opacity',
                      filter: `blur(${normalizedValue > 0.7 ? '1px' : '0px'})`,
                    }}
                  />
                );
              })}
            </div>

            {/* Title and Close */}
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-lg">{soundTitle}</h4>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-accent/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-accent"
                  style={{ width: `${progress}%` }}
                  animate={{
                    opacity: [0.8, 1, 0.8],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-6">
            {/* Play/Pause with breathing glow */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={togglePlay}
                className="relative flex items-center justify-center w-14 h-14 rounded-full bg-primary text-white shadow-lg"
                animate={{
                  boxShadow: isPlaying 
                    ? `0 0 ${20 + amplitude * 30}px hsl(var(--primary) / ${0.5 + amplitude * 0.3})`
                    : '0 4px 12px hsl(var(--primary) / 0.3)',
                }}
                transition={spring.soft}
                style={{ willChange: 'box-shadow, transform' }}
              >
                {isLoading ? (
                  <motion.div
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                ) : isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6 ml-1" />
                )}
              </motion.button>

              {/* Volume */}
              <div className="flex items-center gap-3 flex-1">
                <button onClick={toggleMute} className="text-muted-foreground hover:text-foreground">
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={1}
                  step={0.01}
                  onValueChange={handleVolumeChange}
                  className="flex-1"
                />
              </div>
            </div>

            <audio 
              ref={audioRef} 
              src={soundUrl} 
              loop 
              crossOrigin="anonymous"
              preload="auto"
              playsInline
            />
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
