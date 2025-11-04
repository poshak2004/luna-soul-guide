import { motion } from 'framer-motion';
import { Play, Pause, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cardHover, spring } from '@/lib/motion';

interface SoundCardProps {
  id: string;
  title: string;
  description?: string;
  moods: string[];
  category: string;
  isPlaying: boolean;
  isFavorite?: boolean;
  playCount?: number;
  onPlay: () => void;
  onFavorite?: () => void;
}

export const SoundCard = ({
  title,
  description,
  moods,
  category,
  isPlaying,
  isFavorite,
  playCount,
  onPlay,
  onFavorite,
}: SoundCardProps) => {
  const categoryColors: Record<string, string> = {
    Sleep: 'from-indigo-500/20 to-purple-500/20',
    Focus: 'from-emerald-500/20 to-teal-500/20',
    Meditation: 'from-violet-500/20 to-fuchsia-500/20',
    Relaxation: 'from-cyan-500/20 to-blue-500/20',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={cardHover}
      transition={spring.soft}
      style={{ willChange: 'transform' }}
    >
      <Card className="glass overflow-hidden group cursor-pointer relative">
        {/* Background gradient glow */}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br ${categoryColors[category]} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
          animate={isPlaying ? { opacity: [0.3, 0.5, 0.3] } : {}}
          transition={{ duration: 3, repeat: Infinity }}
          style={{ willChange: 'opacity' }}
        />

        <CardContent className="relative p-6 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-semibold truncate group-hover:text-primary transition-colors">
                {title}
              </h3>
              {description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {description}
                </p>
              )}
            </div>
            
            {onFavorite && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onFavorite();
                }}
                className="p-2 rounded-full hover:bg-accent/20 transition-colors"
              >
                <Heart 
                  className={`w-5 h-5 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-muted-foreground'}`} 
                />
              </motion.button>
            )}
          </div>

          {/* Moods */}
          <div className="flex flex-wrap gap-2">
            {moods.map((mood) => (
              <Badge key={mood} variant="secondary" className="text-xs capitalize">
                {mood}
              </Badge>
            ))}
            <Badge variant="outline" className="text-xs">
              {category}
            </Badge>
          </div>

          {/* Play button */}
          <div className="flex items-center justify-between pt-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onPlay}
              transition={spring.snappy}
              className={`
                relative flex items-center justify-center w-12 h-12 rounded-full
                ${isPlaying ? 'bg-primary/90' : 'bg-primary'}
                shadow-lg group-hover:shadow-2xl transition-shadow
              `}
              style={{ willChange: 'transform' }}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-white" />
              ) : (
                <Play className="w-5 h-5 text-white ml-0.5" />
              )}
              
              {/* Pulse ring when playing */}
              {isPlaying && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-primary"
                  initial={{ scale: 1, opacity: 0.5 }}
                  animate={{ scale: 1.8, opacity: 0 }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  style={{ willChange: 'transform, opacity' }}
                />
              )}
            </motion.button>

            {playCount !== undefined && playCount > 0 && (
              <span className="text-xs text-muted-foreground">
                {playCount} plays
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
