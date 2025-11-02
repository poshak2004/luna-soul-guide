import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Volume2, VolumeX, Play, Pause, Waves, Wind, Droplets, Mountain, 
  Music, Coffee, Moon, Focus, Sparkles, Timer, Palette, Sliders 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type SoundTag = "Sleep" | "Focus" | "Stress Relief" | "Calm" | "Meditation" | "Energy";
type ColorMood = "Calm" | "Energized" | "Focused" | "Peaceful" | "Creative" | "Grounded";
type SessionDuration = 1 | 5 | 10 | 20;

interface Soundscape {
  id: string;
  name: string;
  icon: any;
  color: string;
  description: string;
  tags: SoundTag[];
  file: string;
}

interface ColorTheme {
  name: ColorMood;
  gradient: string[];
  description: string;
}

const SensoryHealing = () => {
  const { toast } = useToast();
  
  // Sound therapy state
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([0.6]);
  const [selectedSound, setSelectedSound] = useState<string>("ocean");
  const [sessionDuration, setSessionDuration] = useState<SessionDuration>(5);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [eqPreset, setEqPreset] = useState<"flat" | "bass" | "mid" | "treble">("flat");
  
  // Color therapy state
  const [colorMode, setColorMode] = useState(false);
  const [selectedMood, setSelectedMood] = useState<ColorMood>("Calm");
  const [transitionSpeed, setTransitionSpeed] = useState([5]);
  const [currentGradientIndex, setCurrentGradientIndex] = useState(0);
  
  // Audio refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const bassNodeRef = useRef<BiquadFilterNode | null>(null);
  const midNodeRef = useRef<BiquadFilterNode | null>(null);
  const trebleNodeRef = useRef<BiquadFilterNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sessionStartRef = useRef<Date | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const soundscapes: Soundscape[] = [
    { 
      id: "ocean", 
      name: "Ocean Waves", 
      icon: Waves, 
      color: "hsl(200, 70%, 58%)", 
      description: "Rhythmic waves for deep calm",
      tags: ["Sleep", "Calm", "Meditation"],
      file: "/sounds/ocean.mp3"
    },
    { 
      id: "rain", 
      name: "Gentle Rain", 
      icon: Droplets, 
      color: "hsl(175, 50%, 62%)", 
      description: "Soft rainfall for relaxation",
      tags: ["Sleep", "Stress Relief", "Calm"],
      file: "/sounds/rain.mp3"
    },
    { 
      id: "forest", 
      name: "Forest Ambience", 
      icon: Wind, 
      color: "hsl(140, 40%, 58%)", 
      description: "Birds and rustling leaves",
      tags: ["Focus", "Calm", "Meditation"],
      file: "/sounds/forest.mp3"
    },
    { 
      id: "stream", 
      name: "Mountain Stream", 
      icon: Mountain, 
      color: "hsl(210, 75%, 72%)", 
      description: "Flowing water sounds",
      tags: ["Focus", "Calm"],
      file: "/sounds/stream.mp3"
    },
    { 
      id: "bowl", 
      name: "Singing Bowl", 
      icon: Music, 
      color: "hsl(280, 60%, 65%)", 
      description: "Tibetan healing tones",
      tags: ["Meditation", "Stress Relief"],
      file: "/sounds/bowl.mp3"
    },
    { 
      id: "piano", 
      name: "Ambient Piano", 
      icon: Music, 
      color: "hsl(320, 60%, 70%)", 
      description: "Gentle piano melodies",
      tags: ["Focus", "Calm"],
      file: "/sounds/piano.mp3"
    },
    { 
      id: "wind", 
      name: "Wind Chimes", 
      icon: Sparkles, 
      color: "hsl(50, 80%, 65%)", 
      description: "Delicate chime sounds",
      tags: ["Meditation", "Calm"],
      file: "/sounds/chimes.mp3"
    },
    { 
      id: "coffee", 
      name: "Coffee Shop", 
      icon: Coffee, 
      color: "hsl(30, 50%, 60%)", 
      description: "Background café ambience",
      tags: ["Focus", "Energy"],
      file: "/sounds/coffee.mp3"
    },
  ];

  const colorThemes: ColorTheme[] = [
    {
      name: "Calm",
      gradient: [
        "linear-gradient(135deg, hsl(200, 65%, 88%), hsl(210, 70%, 90%))",
        "linear-gradient(135deg, hsl(175, 50%, 90%), hsl(200, 60%, 92%))",
        "linear-gradient(135deg, hsl(220, 55%, 88%), hsl(240, 50%, 92%))",
      ],
      description: "Soothing blues and teals"
    },
    {
      name: "Energized",
      gradient: [
        "linear-gradient(135deg, hsl(45, 80%, 75%), hsl(30, 85%, 70%))",
        "linear-gradient(135deg, hsl(15, 75%, 65%), hsl(350, 70%, 70%))",
        "linear-gradient(135deg, hsl(60, 75%, 72%), hsl(40, 80%, 68%))",
      ],
      description: "Warm oranges and yellows"
    },
    {
      name: "Focused",
      gradient: [
        "linear-gradient(135deg, hsl(280, 45%, 70%), hsl(260, 50%, 75%))",
        "linear-gradient(135deg, hsl(250, 55%, 72%), hsl(230, 50%, 78%))",
        "linear-gradient(135deg, hsl(270, 50%, 68%), hsl(290, 45%, 73%))",
      ],
      description: "Deep purples and indigos"
    },
    {
      name: "Peaceful",
      gradient: [
        "linear-gradient(135deg, hsl(140, 40%, 75%), hsl(160, 45%, 78%))",
        "linear-gradient(135deg, hsl(120, 35%, 72%), hsl(140, 40%, 76%))",
        "linear-gradient(135deg, hsl(155, 42%, 74%), hsl(175, 38%, 77%))",
      ],
      description: "Gentle greens and mint"
    },
    {
      name: "Creative",
      gradient: [
        "linear-gradient(135deg, hsl(320, 60%, 75%), hsl(280, 65%, 78%))",
        "linear-gradient(135deg, hsl(340, 55%, 72%), hsl(300, 60%, 76%))",
        "linear-gradient(135deg, hsl(290, 58%, 74%), hsl(260, 62%, 77%))",
      ],
      description: "Vibrant pinks and purples"
    },
    {
      name: "Grounded",
      gradient: [
        "linear-gradient(135deg, hsl(30, 35%, 65%), hsl(25, 40%, 70%))",
        "linear-gradient(135deg, hsl(35, 38%, 68%), hsl(20, 42%, 72%))",
        "linear-gradient(135deg, hsl(28, 36%, 66%), hsl(18, 40%, 71%))",
      ],
      description: "Earth tones and browns"
    },
  ];

  // Initialize Web Audio API
  useEffect(() => {
    const initAudio = () => {
      if (!audioContextRef.current) {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContext();

        // Create audio nodes
        gainNodeRef.current = audioContextRef.current.createGain();
        analyserRef.current = audioContextRef.current.createAnalyser();
        
        // Create EQ nodes
        bassNodeRef.current = audioContextRef.current.createBiquadFilter();
        bassNodeRef.current.type = "lowshelf";
        bassNodeRef.current.frequency.value = 200;
        
        midNodeRef.current = audioContextRef.current.createBiquadFilter();
        midNodeRef.current.type = "peaking";
        midNodeRef.current.frequency.value = 1000;
        midNodeRef.current.Q.value = 0.5;
        
        trebleNodeRef.current = audioContextRef.current.createBiquadFilter();
        trebleNodeRef.current.type = "highshelf";
        trebleNodeRef.current.frequency.value = 3000;

        gainNodeRef.current.gain.value = volume[0];
      }
    };

    initAudio();
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Connect audio element to Web Audio API
  useEffect(() => {
    if (audioElementRef.current && audioContextRef.current && !sourceNodeRef.current) {
      sourceNodeRef.current = audioContextRef.current.createMediaElementSource(audioElementRef.current);
      
      // Connect: source -> bass -> mid -> treble -> gain -> analyser -> destination
      sourceNodeRef.current.connect(bassNodeRef.current!);
      bassNodeRef.current!.connect(midNodeRef.current!);
      midNodeRef.current!.connect(trebleNodeRef.current!);
      trebleNodeRef.current!.connect(gainNodeRef.current!);
      gainNodeRef.current!.connect(analyserRef.current!);
      analyserRef.current!.connect(audioContextRef.current.destination);
    }
  }, [audioElementRef.current, audioContextRef.current]);

  // Apply EQ preset
  useEffect(() => {
    if (!bassNodeRef.current || !midNodeRef.current || !trebleNodeRef.current) return;

    switch (eqPreset) {
      case "bass":
        bassNodeRef.current.gain.value = 6;
        midNodeRef.current.gain.value = 0;
        trebleNodeRef.current.gain.value = -3;
        break;
      case "mid":
        bassNodeRef.current.gain.value = -2;
        midNodeRef.current.gain.value = 5;
        trebleNodeRef.current.gain.value = -2;
        break;
      case "treble":
        bassNodeRef.current.gain.value = -3;
        midNodeRef.current.gain.value = 0;
        trebleNodeRef.current.gain.value = 6;
        break;
      default: // flat
        bassNodeRef.current.gain.value = 0;
        midNodeRef.current.gain.value = 0;
        trebleNodeRef.current.gain.value = 0;
    }
  }, [eqPreset]);

  // Handle volume change
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = volume[0];
    }
  }, [volume]);

  // Session timer
  useEffect(() => {
    if (timeRemaining !== null && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev === null || prev <= 1) {
            handleSessionComplete();
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeRemaining]);

  // Color therapy gradient rotation
  useEffect(() => {
    if (!colorMode) return;

    const theme = colorThemes.find(t => t.name === selectedMood);
    if (!theme) return;

    const interval = setInterval(() => {
      setCurrentGradientIndex(prev => (prev + 1) % theme.gradient.length);
    }, transitionSpeed[0] * 1000);

    return () => clearInterval(interval);
  }, [colorMode, selectedMood, transitionSpeed]);

  const togglePlay = async () => {
    if (!audioElementRef.current || !audioContextRef.current) return;

    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    if (isPlaying) {
      audioElementRef.current.pause();
      setIsPlaying(false);
      if (sessionStartRef.current) {
        await trackSession();
      }
    } else {
      try {
        await audioElementRef.current.play();
        setIsPlaying(true);
        sessionStartRef.current = new Date();
      } catch (error) {
        console.error("Playback error:", error);
        toast({
          title: "Playback error",
          description: "Could not play audio. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const startTimedSession = async (minutes: SessionDuration) => {
    setSessionDuration(minutes);
    setTimeRemaining(minutes * 60);
    
    if (!isPlaying) {
      await togglePlay();
    }

    toast({
      title: "Session started",
      description: `${minutes} minute healing session`,
    });
  };

  const handleSessionComplete = async () => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
    }
    setIsPlaying(false);
    setTimeRemaining(null);
    
    await trackSession();
    
    toast({
      title: "Session complete! 🎉",
      description: "You've completed your sensory healing session",
    });
  };

  const trackSession = async () => {
    if (!sessionStartRef.current) return;

    const duration = Math.floor((new Date().getTime() - sessionStartRef.current.getTime()) / 1000);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("user_activities").insert({
        user_id: user.id,
        activity_type: `sensory_${colorMode ? 'color' : 'sound'}`,
        points_earned: Math.min(Math.floor(duration / 60) * 5, 20),
      });

      if (error) throw error;
      
      sessionStartRef.current = null;
    } catch (error) {
      console.error("Error tracking session:", error);
    }
  };

  const selectSound = (soundId: string) => {
    if (isPlaying) {
      setIsPlaying(false);
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
    }
    
    setSelectedSound(soundId);
    const sound = soundscapes.find(s => s.id === soundId);
    
    toast({
      title: "Soundscape selected",
      description: sound?.name,
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentSound = soundscapes.find(s => s.id === selectedSound);
  const currentTheme = colorThemes.find(t => t.name === selectedMood);

  return (
    <div 
      className="min-h-screen pt-20 pb-12 px-4 transition-all duration-1000"
      style={colorMode && currentTheme ? {
        background: currentTheme.gradient[currentGradientIndex]
      } : undefined}
    >
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-display font-bold mb-3 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            🌈 Sensory Healing
          </h1>
          <p className="text-lg text-muted-foreground">
            Immersive multisensory therapy for mind and body
          </p>
        </motion.div>

        <Tabs defaultValue="sound" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="sound">Sound Therapy</TabsTrigger>
            <TabsTrigger value="color">Color Therapy</TabsTrigger>
          </TabsList>

          {/* SOUND THERAPY */}
          <TabsContent value="sound" className="space-y-6">
            <Card className="p-6 glass hover-lift">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-semibold">Therapeutic Soundscapes</h3>
                  <p className="text-muted-foreground mt-1">
                    Curated audio for relaxation, focus, and healing
                  </p>
                </div>
                {timeRemaining !== null && (
                  <div className="flex items-center gap-2 text-primary font-mono text-2xl">
                    <Timer className="w-6 h-6" />
                    {formatTime(timeRemaining)}
                  </div>
                )}
              </div>

              {/* Soundscape Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {soundscapes.map((sound) => {
                  const Icon = sound.icon;
                  return (
                    <motion.button
                      key={sound.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => selectSound(sound.id)}
                      className={`p-4 rounded-2xl border-2 transition-all ${
                        selectedSound === sound.id
                          ? "border-primary bg-primary/10 shadow-lg"
                          : "border-border bg-card/50"
                      }`}
                    >
                      <Icon 
                        className="w-10 h-10 mb-2 mx-auto" 
                        style={{ color: sound.color }} 
                      />
                      <h4 className="font-semibold text-sm mb-1">{sound.name}</h4>
                      <div className="flex flex-wrap gap-1 justify-center mt-2">
                        {sound.tags.slice(0, 2).map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs px-2 py-0">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Controls */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Button
                    onClick={togglePlay}
                    size="lg"
                    className="flex-1 h-14 text-lg"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-6 h-6 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-6 h-6 mr-2" />
                        Play
                      </>
                    )}
                  </Button>
                </div>

                {/* Timed Sessions */}
                <div className="grid grid-cols-4 gap-2">
                  {([1, 5, 10, 20] as SessionDuration[]).map(min => (
                    <Button
                      key={min}
                      variant={sessionDuration === min ? "default" : "outline"}
                      onClick={() => startTimedSession(min)}
                      size="sm"
                    >
                      {min} min
                    </Button>
                  ))}
                </div>

                {/* Volume */}
                <div className="flex items-center gap-4">
                  <VolumeX className="w-5 h-5 text-muted-foreground" />
                  <Slider
                    value={volume}
                    onValueChange={setVolume}
                    max={1}
                    step={0.05}
                    className="flex-1"
                  />
                  <Volume2 className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground w-12 text-right">
                    {Math.round(volume[0] * 100)}%
                  </span>
                </div>

                {/* EQ Presets */}
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-muted-foreground" />
                  <div className="flex gap-2 flex-1">
                    {(["flat", "bass", "mid", "treble"] as const).map(preset => (
                      <Button
                        key={preset}
                        variant={eqPreset === preset ? "default" : "outline"}
                        size="sm"
                        onClick={() => setEqPreset(preset)}
                        className="flex-1 capitalize"
                      >
                        {preset}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <audio 
                ref={audioElementRef} 
                loop 
                crossOrigin="anonymous"
              >
                <source src={currentSound?.file} type="audio/mpeg" />
              </audio>
            </Card>
          </TabsContent>

          {/* COLOR THERAPY */}
          <TabsContent value="color" className="space-y-6">
            <Card className="p-6 glass hover-lift">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-semibold">Color Therapy Mode</h3>
                  <p className="text-muted-foreground mt-1">
                    Heal through chromotherapy and gradient immersion
                  </p>
                </div>
                <Button
                  variant={colorMode ? "default" : "outline"}
                  onClick={() => setColorMode(!colorMode)}
                  size="lg"
                >
                  <Palette className="w-5 h-5 mr-2" />
                  {colorMode ? "Exit" : "Start"}
                </Button>
              </div>

              {/* Mood Palettes */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {colorThemes.map((theme) => (
                  <motion.button
                    key={theme.name}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedMood(theme.name)}
                    className={`p-4 rounded-2xl border-2 transition-all ${
                      selectedMood === theme.name
                        ? "border-primary shadow-lg"
                        : "border-border"
                    }`}
                    style={{
                      background: theme.gradient[0]
                    }}
                  >
                    <h4 className="font-semibold text-white text-shadow mb-1">
                      {theme.name}
                    </h4>
                    <p className="text-xs text-white/90 text-shadow">
                      {theme.description}
                    </p>
                  </motion.button>
                ))}
              </div>

              {/* Transition Speed */}
              <div className="space-y-3">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Transition Speed: {transitionSpeed[0]}s
                </label>
                <Slider
                  value={transitionSpeed}
                  onValueChange={setTransitionSpeed}
                  min={2}
                  max={15}
                  step={1}
                  className="flex-1"
                />
              </div>

              {colorMode && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 rounded-xl bg-background/50 backdrop-blur-sm"
                >
                  <p className="text-center text-sm text-muted-foreground">
                    💫 Color therapy active. Let the healing gradients wash over you.
                  </p>
                </motion.div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SensoryHealing;
