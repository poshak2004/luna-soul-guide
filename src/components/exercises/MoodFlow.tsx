import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { RotateCcw, Check } from "lucide-react";

interface MoodFlowProps {
  onComplete: () => void;
  onExit: () => void;
}

const moods = [
  { name: "Joyful", emoji: "😊", color: "hsl(45, 95%, 60%)", description: "Bright and uplifted" },
  { name: "Calm", emoji: "😌", color: "hsl(200, 75%, 65%)", description: "Peaceful and centered" },
  { name: "Energized", emoji: "⚡", color: "hsl(25, 95%, 60%)", description: "Full of vitality" },
  { name: "Grateful", emoji: "🙏", color: "hsl(140, 60%, 60%)", description: "Appreciative and warm" },
  { name: "Curious", emoji: "🤔", color: "hsl(280, 60%, 65%)", description: "Open and wondering" },
  { name: "Reflective", emoji: "🌙", color: "hsl(230, 50%, 60%)", description: "Thoughtful and deep" },
  { name: "Anxious", emoji: "😰", color: "hsl(15, 75%, 60%)", description: "Worried or tense" },
  { name: "Tired", emoji: "😴", color: "hsl(220, 20%, 50%)", description: "Low energy, need rest" },
];

export const MoodFlow = ({ onComplete, onExit }: MoodFlowProps) => {
  const [selectedMood, setSelectedMood] = useState<typeof moods[0] | null>(null);
  const [intensity, setIntensity] = useState(5);
  const [step, setStep] = useState<"select" | "intensity" | "complete">("select");

  const handleMoodSelect = (mood: typeof moods[0]) => {
    setSelectedMood(mood);
    setStep("intensity");
  };

  const handleComplete = () => {
    setStep("complete");
    setTimeout(() => {
      onComplete();
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="max-w-6xl mx-auto"
    >
      <div className="glass rounded-3xl p-12 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-accent via-primary to-secondary bg-clip-text text-transparent">
            Mood Flow
          </h2>
          <p className="text-muted-foreground">
            Interactive emotion wheel to explore your feelings
          </p>
        </div>

        {step === "select" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <p className="text-center text-lg font-medium">
              How are you feeling right now?
            </p>

            {/* Mood wheel */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {moods.map((mood, index) => (
                <motion.button
                  key={mood.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.1, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleMoodSelect(mood)}
                  className="glass rounded-2xl p-6 space-y-3 transition-all duration-300 hover:shadow-2xl group"
                  style={{
                    borderColor: mood.color,
                    borderWidth: '2px',
                  }}
                >
                  <div
                    className="text-6xl mx-auto w-20 h-20 flex items-center justify-center rounded-full"
                    style={{ backgroundColor: `${mood.color}20` }}
                  >
                    {mood.emoji}
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-lg">{mood.name}</p>
                    <p className="text-xs text-muted-foreground">{mood.description}</p>
                  </div>
                </motion.button>
              ))}
            </div>

            <div className="flex justify-center">
              <Button variant="outline" size="lg" onClick={onExit}>
                <RotateCcw className="w-5 h-5 mr-2" />
                Exit
              </Button>
            </div>
          </motion.div>
        )}

        {step === "intensity" && selectedMood && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8 max-w-2xl mx-auto"
          >
            <div className="text-center space-y-4">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-8xl mx-auto w-32 h-32 flex items-center justify-center rounded-full"
                style={{ backgroundColor: `${selectedMood.color}30` }}
              >
                {selectedMood.emoji}
              </motion.div>
              <h3 className="text-3xl font-bold">{selectedMood.name}</h3>
              <p className="text-muted-foreground">{selectedMood.description}</p>
            </div>

            <div className="space-y-4">
              <p className="text-center text-lg font-medium">
                How intense is this feeling?
              </p>
              
              <div className="space-y-6">
                {/* Intensity slider visualization */}
                <div className="relative h-24">
                  <motion.div
                    className="absolute inset-0 rounded-2xl"
                    style={{
                      background: `linear-gradient(to right, 
                        ${selectedMood.color}10 0%, 
                        ${selectedMood.color}50 50%, 
                        ${selectedMood.color} 100%)`,
                    }}
                  />
                  <motion.div
                    className="absolute top-1/2 -translate-y-1/2 w-16 h-16 rounded-full border-4 border-white shadow-2xl"
                    style={{
                      backgroundColor: selectedMood.color,
                      left: `calc(${(intensity / 10) * 100}% - 2rem)`,
                    }}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                </div>

                {/* Slider input */}
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={intensity}
                  onChange={(e) => setIntensity(Number(e.target.value))}
                  className="w-full h-3 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, ${selectedMood.color}30 0%, ${selectedMood.color} 100%)`,
                  }}
                />
                
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Slight</span>
                  <span className="font-bold text-2xl">{intensity}/10</span>
                  <span>Intense</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-center flex-wrap">
              <Button size="lg" onClick={handleComplete} className="min-w-[200px]">
                <Check className="w-5 h-5 mr-2" />
                Record Mood
              </Button>

              <Button variant="outline" size="lg" onClick={() => setStep("select")}>
                Change Mood
              </Button>

              <Button variant="outline" size="lg" onClick={onExit}>
                <RotateCcw className="w-5 h-5 mr-2" />
                Exit
              </Button>
            </div>
          </motion.div>
        )}

        {step === "complete" && selectedMood && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6 py-12"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ duration: 0.6 }}
              className="text-9xl mx-auto"
            >
              {selectedMood.emoji}
            </motion.div>
            <h3 className="text-3xl font-bold">Mood Recorded!</h3>
            <p className="text-muted-foreground text-lg">
              Your <span className="font-semibold" style={{ color: selectedMood.color }}>{selectedMood.name}</span> feeling at {intensity}/10 intensity has been logged.
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
