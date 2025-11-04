import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, X } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { useAudioVisualizer } from '@/hooks/useAudioVisualizer';

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
  const { frequencyData, amplitude } = useAudioVisualizer(audioRef.current);

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

    audio.addEventListener('timeupdate', handleTimeUpdate);
    return () => audio.removeEventListener('timeupdate', handleTimeUpdate);
  }, [duration, volume, onComplete]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
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
        className="fixed bottom-0 left-0 right-0 z-50 p-4"
      >
        <div className="container mx-auto max-w-4xl">
          <motion.div
            className="glass backdrop-blur-xl rounded-2xl shadow-2xl p-6 space-y-4"
            animate={{
              boxShadow: `0 0 ${20 + amplitude * 40}px rgba(var(--primary-rgb), ${amplitude * 0.5})`
            }}
          >
            {/* Waveform Visualizer */}
            <div className="flex items-center justify-center h-12 gap-1">
              {Array.from(frequencyData).slice(0, 64).map((value, i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-gradient-to-t from-primary to-accent rounded-full"
                  animate={{
                    height: `${(value / 255) * 100}%`,
                    opacity: 0.3 + (value / 255) * 0.7,
                  }}
                  transition={{ duration: 0.1 }}
                />
              ))}
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
              {/* Play/Pause */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={togglePlay}
                className="flex items-center justify-center w-14 h-14 rounded-full bg-primary text-white shadow-lg"
              >
                {isPlaying ? (
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

            <audio ref={audioRef} src={soundUrl} loop />
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
