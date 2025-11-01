import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Volume2, VolumeX, Play, Pause, Waves, Wind, Droplets, Mountain } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const SensoryHealing = () => {
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([0.5]);
  const [selectedSound, setSelectedSound] = useState("ocean");
  const [breathPhase, setBreathPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [breathCount, setBreathCount] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const sounds = [
    { id: "ocean", name: "Ocean Waves", icon: Waves, color: "#4A90E2", description: "Calming wave sounds" },
    { id: "rain", name: "Gentle Rain", icon: Droplets, color: "#7ED321", description: "Peaceful rainfall" },
    { id: "wind", name: "Forest Wind", icon: Wind, color: "#9B51E0", description: "Rustling leaves" },
    { id: "mountain", name: "Mountain Stream", icon: Mountain, color: "#E24A4A", description: "Flowing water" },
  ];

  const breathingColors = [
    { phase: "inhale", color: "#4A90E2", text: "Breathe In", duration: 4000 },
    { phase: "hold", color: "#9B51E0", text: "Hold", duration: 4000 },
    { phase: "exhale", color: "#7ED321", text: "Breathe Out", duration: 6000 },
  ];

  useEffect(() => {
    const breathingCycle = () => {
      const phases = breathingColors;
      let currentIndex = 0;

      const interval = setInterval(() => {
        setBreathPhase(phases[currentIndex].phase as any);
        currentIndex = (currentIndex + 1) % phases.length;
        if (currentIndex === 0) {
          setBreathCount((prev) => prev + 1);
        }
      }, phases[currentIndex].duration);

      return () => clearInterval(interval);
    };

    const cleanup = breathingCycle();
    return cleanup;
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume[0];
    }
  };

  const selectSound = (soundId: string) => {
    setSelectedSound(soundId);
    setIsPlaying(false);
    toast({
      title: "Sound selected",
      description: sounds.find(s => s.id === soundId)?.name,
    });
  };

  const currentBreathColor = breathingColors.find(b => b.phase === breathPhase);

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-gradient-to-br from-background via-primary/5 to-background">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-display font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            🌈 Sensory Healing
          </h1>
          <p className="text-lg text-muted-foreground">
            Heal through color, sound, and breath
          </p>
        </div>

        <Tabs defaultValue="sound" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="sound">Sound Therapy</TabsTrigger>
            <TabsTrigger value="breath">Guided Breathing</TabsTrigger>
          </TabsList>

          <TabsContent value="sound" className="space-y-6">
            <Card className="p-6 glass">
              <h3 className="text-xl font-semibold mb-4">Therapeutic Soundscapes</h3>
              <p className="text-muted-foreground mb-6">
                Choose calming sounds to reduce stress and promote relaxation
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {sounds.map((sound) => {
                  const Icon = sound.icon;
                  return (
                    <button
                      key={sound.id}
                      onClick={() => selectSound(sound.id)}
                      className={`p-6 rounded-lg border-2 transition-all hover:scale-105 ${
                        selectedSound === sound.id
                          ? "border-primary bg-primary/10"
                          : "border-border bg-card"
                      }`}
                    >
                      <Icon className="w-12 h-12 mb-3" style={{ color: sound.color }} />
                      <h4 className="font-semibold mb-1">{sound.name}</h4>
                      <p className="text-sm text-muted-foreground">{sound.description}</p>
                    </button>
                  );
                })}
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Button
                    onClick={togglePlay}
                    size="lg"
                    className="w-full"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-5 h-5 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5 mr-2" />
                        Play Sound
                      </>
                    )}
                  </Button>
                </div>

                <div className="flex items-center gap-4">
                  <VolumeX className="w-5 h-5 text-muted-foreground" />
                  <Slider
                    value={volume}
                    onValueChange={handleVolumeChange}
                    max={1}
                    step={0.1}
                    className="flex-1"
                  />
                  <Volume2 className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>

              <audio ref={audioRef} loop>
                <source src={`/sounds/${selectedSound}.mp3`} type="audio/mpeg" />
              </audio>
            </Card>
          </TabsContent>

          <TabsContent value="breath" className="space-y-6">
            <Card className="p-6 glass">
              <h3 className="text-xl font-semibold mb-4">Box Breathing Exercise</h3>
              <p className="text-muted-foreground mb-6">
                Follow the visual guide for a calming breathing rhythm
              </p>

              <div className="flex flex-col items-center gap-8 py-12">
                <div
                  className="relative w-64 h-64 rounded-full flex items-center justify-center transition-all duration-1000 ease-in-out shadow-2xl"
                  style={{
                    backgroundColor: currentBreathColor?.color,
                    transform: breathPhase === "inhale" ? "scale(1.2)" : breathPhase === "hold" ? "scale(1.15)" : "scale(1)",
                  }}
                >
                  <div className="text-center text-white">
                    <p className="text-3xl font-bold mb-2">{currentBreathColor?.text}</p>
                    <p className="text-xl">Cycle: {breathCount}</p>
                  </div>
                </div>

                <div className="text-center space-y-2">
                  <p className="text-lg font-medium">
                    {breathPhase === "inhale" && "Slowly breathe in through your nose"}
                    {breathPhase === "hold" && "Hold your breath gently"}
                    {breathPhase === "exhale" && "Slowly breathe out through your mouth"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Continue for 5-10 minutes for best results
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SensoryHealing;
