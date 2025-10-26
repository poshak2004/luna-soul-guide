import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface BreatheSyncProps {
  onComplete: () => void;
  onExit: () => void;
}

export const BreatheSync = ({ onComplete, onExit }: BreatheSyncProps) => {
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [phaseTimer, setPhaseTimer] = useState(4);
  const [cycles, setCycles] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const totalCycles = 6;

  const phaseConfig = {
    inhale: { duration: 4, next: "hold", text: "Breathe In", scale: 1.5 },
    hold: { duration: 4, next: "exhale", text: "Hold", scale: 1.5 },
    exhale: { duration: 6, next: "inhale", text: "Breathe Out", scale: 0.7 },
  };

  useEffect(() => {
    if (!isActive || isPaused) return;

    const interval = setInterval(() => {
      setPhaseTimer((prev) => {
        if (prev <= 1) {
          const currentPhase = phaseConfig[phase];
          const nextPhase = currentPhase.next as typeof phase;
          
          if (nextPhase === "inhale") {
            const newCycles = cycles + 1;
            setCycles(newCycles);
            if (newCycles >= totalCycles) {
              setIsActive(false);
              onComplete();
              return 0;
            }
          }
          
          setPhase(nextPhase);
          return phaseConfig[nextPhase].duration;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, isPaused, phase, cycles, onComplete]);

  const handleStart = useCallback(() => {
    setIsActive(true);
    setIsPaused(false);
    setCycles(0);
    setPhase("inhale");
    setPhaseTimer(4);
  }, []);

  const handlePauseResume = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  const currentPhase = phaseConfig[phase];
  const progress = (cycles / totalCycles) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="max-w-4xl mx-auto"
    >
      <div className="glass rounded-3xl p-12 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            BreatheSync
          </h2>
          <p className="text-muted-foreground">
            Adaptive breathing rhythm for instant calm
          </p>
        </div>

        {/* Breathing Orb */}
        <div className="relative flex items-center justify-center h-96">
          <motion.div
            animate={{
              scale: isActive && !isPaused ? currentPhase.scale : 1,
            }}
            transition={{ duration: currentPhase.duration, ease: "easeInOut" }}
            className="relative w-80 h-80"
          >
            {/* Outer glow */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: `radial-gradient(circle, hsl(200, 75%, 70%), hsl(175, 55%, 70%), hsl(140, 45%, 70%))`,
                filter: 'blur(40px)',
                opacity: 0.4,
              }}
              animate={{
                scale: isActive && !isPaused ? [1, 1.2, 1] : 1,
              }}
              transition={{ duration: currentPhase.duration * 2, ease: "easeInOut", repeat: Infinity }}
            />
            
            {/* Main orb */}
            <motion.div
              className="absolute inset-8 rounded-full flex items-center justify-center"
              style={{
                background: `radial-gradient(circle, hsl(200, 75%, 65%), hsl(175, 55%, 65%))`,
                boxShadow: '0 0 80px rgba(100, 181, 246, 0.5)',
              }}
            >
              <div className="text-center text-white">
                <motion.p
                  key={phase}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-3xl font-bold mb-3"
                >
                  {currentPhase.text}
                </motion.p>
                <motion.p
                  key={phaseTimer}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="text-7xl font-bold"
                >
                  {phaseTimer}
                </motion.p>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Cycle {cycles} of {totalCycles}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Controls */}
        <div className="flex gap-3 justify-center flex-wrap">
          {!isActive ? (
            <Button size="lg" onClick={handleStart} className="min-w-[200px]">
              <Play className="w-5 h-5 mr-2" />
              Start BreatheSync
            </Button>
          ) : (
            <Button size="lg" variant="secondary" onClick={handlePauseResume} className="min-w-[200px]">
              {isPaused ? <Play className="w-5 h-5 mr-2" /> : <Pause className="w-5 h-5 mr-2" />}
              {isPaused ? "Resume" : "Pause"}
            </Button>
          )}
          
          <Button variant="outline" size="lg" onClick={() => setSoundEnabled(!soundEnabled)}>
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </Button>

          <Button variant="outline" size="lg" onClick={onExit}>
            <RotateCcw className="w-5 h-5 mr-2" />
            Exit
          </Button>
        </div>

        {/* Instructions */}
        {!isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-muted/50 rounded-xl p-6 text-center"
          >
            <p className="text-sm text-muted-foreground leading-relaxed">
              <span className="font-semibold text-primary">Inhale deeply</span> for 4 seconds, 
              <span className="font-semibold text-secondary"> hold</span> for 4 seconds, 
              <span className="font-semibold text-accent"> exhale slowly</span> for 6 seconds. 
              Let the orb guide your rhythm.
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
