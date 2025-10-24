import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wind, Brain, Dumbbell, Zap, Play, Pause, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AuthGate } from "@/components/AuthGate";
import { useGamification } from "@/hooks/useGamification";
import { Logo } from "@/components/Logo";

const Exercises = () => {
  const [activeExercise, setActiveExercise] = useState<string | null>(null);
  const [breathPhase, setBreathPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [breathCount, setBreathCount] = useState(0);
  const [isBreathing, setIsBreathing] = useState(false);
  const { addActivity } = useGamification();

  const exercises = [
    {
      id: "breathing",
      title: "Box Breathing",
      description: "4-4-4-4 breathing technique for instant calm",
      icon: Wind,
      color: "text-primary",
      bgColor: "bg-primary/10",
      points: 10,
    },
    {
      id: "meditation",
      title: "Mindful Meditation",
      description: "5-minute guided meditation for mental clarity",
      icon: Brain,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
      points: 15,
    },
    {
      id: "grounding",
      title: "5-4-3-2-1 Grounding",
      description: "Sensory awareness exercise to combat anxiety",
      icon: Zap,
      color: "text-accent",
      bgColor: "bg-accent/10",
      points: 10,
    },
    {
      id: "progressive",
      title: "Progressive Relaxation",
      description: "Release physical tension muscle by muscle",
      icon: Dumbbell,
      color: "text-support",
      bgColor: "bg-support/10",
      points: 20,
    },
  ];

  const startBreathing = () => {
    setIsBreathing(true);
    setBreathCount(0);
    breathingCycle();
  };

  const breathingCycle = () => {
    const phases: Array<"inhale" | "hold" | "exhale"> = ["inhale", "hold", "exhale", "hold"];
    let currentPhaseIndex = 0;
    let cycles = 0;

    const interval = setInterval(() => {
      currentPhaseIndex = (currentPhaseIndex + 1) % phases.length;
      setBreathPhase(phases[currentPhaseIndex]);

      if (currentPhaseIndex === 0) {
        cycles++;
        setBreathCount(cycles);
        
        if (cycles >= 4) {
          clearInterval(interval);
          setIsBreathing(false);
          addActivity("breathing_exercise", 10);
        }
      }
    }, 4000);
  };

  const completeExercise = (exerciseId: string, points: number) => {
    addActivity(`${exerciseId}_exercise`, points);
    setActiveExercise(null);
  };

  return (
    <AuthGate>
      <div className="min-h-screen pt-16 bg-gradient-calm">
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Logo size="lg" />
              <h1 className="font-display text-4xl font-bold">Wellness Exercises</h1>
            </div>
            <p className="text-lg text-muted-foreground">
              Practice mindfulness and earn wellness points
            </p>
          </motion.div>

          {!activeExercise ? (
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {exercises.map((exercise, index) => (
                <motion.div
                  key={exercise.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="glass hover:glow transition-all duration-300 cursor-pointer group h-full"
                    onClick={() => setActiveExercise(exercise.id)}
                  >
                    <CardHeader>
                      <div className={`w-16 h-16 ${exercise.bgColor} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <exercise.icon className={`w-8 h-8 ${exercise.color}`} />
                      </div>
                      <CardTitle className="text-xl">{exercise.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">{exercise.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-primary">
                          +{exercise.points} points
                        </span>
                        <Button size="sm" variant="outline">
                          Start <Play className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {activeExercise === "breathing" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="max-w-2xl mx-auto"
                >
                  <Card className="glass p-12 text-center">
                    <div className="mb-8">
                      <motion.div
                        animate={{
                          scale: breathPhase === "inhale" ? 1.3 : breathPhase === "hold" ? 1.3 : 0.9,
                        }}
                        transition={{ duration: 4, ease: "easeInOut" }}
                        className="w-64 h-64 mx-auto bg-gradient-to-br from-primary/30 to-accent/30 rounded-full flex items-center justify-center"
                      >
                        <motion.div
                          animate={{
                            scale: breathPhase === "inhale" ? 1.2 : breathPhase === "hold" ? 1.2 : 0.8,
                          }}
                          transition={{ duration: 4, ease: "easeInOut" }}
                          className="w-48 h-48 bg-primary/50 rounded-full flex items-center justify-center"
                        >
                          <span className="text-3xl font-bold capitalize">{breathPhase}</span>
                        </motion.div>
                      </motion.div>
                    </div>

                    <h3 className="text-2xl font-bold mb-2">Box Breathing</h3>
                    <p className="text-muted-foreground mb-4">Cycle {breathCount} of 4</p>

                    {!isBreathing ? (
                      <div className="space-y-4">
                        <Button size="lg" onClick={startBreathing} className="w-full">
                          <Play className="w-5 h-5 mr-2" />
                          Start Exercise
                        </Button>
                        <Button variant="outline" onClick={() => setActiveExercise(null)}>
                          Back to Exercises
                        </Button>
                      </div>
                    ) : (
                      <Button variant="outline" disabled>
                        <Pause className="w-5 h-5 mr-2" />
                        In Progress...
                      </Button>
                    )}
                  </Card>
                </motion.div>
              )}

              {activeExercise === "grounding" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="max-w-2xl mx-auto"
                >
                  <Card className="glass p-8">
                    <CardHeader>
                      <CardTitle className="text-2xl">5-4-3-2-1 Grounding Exercise</CardTitle>
                      <p className="text-muted-foreground">
                        Use your senses to ground yourself in the present moment
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {[
                        { count: 5, text: "things you can see" },
                        { count: 4, text: "things you can touch" },
                        { count: 3, text: "things you can hear" },
                        { count: 2, text: "things you can smell" },
                        { count: 1, text: "thing you can taste" },
                      ].map((step, index) => (
                        <div key={index} className="p-4 bg-muted/50 rounded-lg">
                          <p className="font-semibold text-lg mb-2">
                            Name {step.count} {step.text}
                          </p>
                          <Progress value={(index + 1) * 20} className="h-2" />
                        </div>
                      ))}
                      <div className="flex gap-4 pt-4">
                        <Button
                          className="flex-1"
                          onClick={() => completeExercise("grounding", 10)}
                        >
                          Complete Exercise
                        </Button>
                        <Button variant="outline" onClick={() => setActiveExercise(null)}>
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Back
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {(activeExercise === "meditation" || activeExercise === "progressive") && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="max-w-2xl mx-auto"
                >
                  <Card className="glass p-8 text-center">
                    <h3 className="text-2xl font-bold mb-4">
                      {activeExercise === "meditation" ? "Mindful Meditation" : "Progressive Relaxation"}
                    </h3>
                    <p className="text-muted-foreground mb-8">
                      {activeExercise === "meditation"
                        ? "Find a comfortable position and focus on your breath"
                        : "Tense and relax each muscle group, starting from your toes"}
                    </p>
                    <div className="w-48 h-48 mx-auto mb-8 breathe">
                      <Logo size="lg" className="w-full h-full" />
                    </div>
                    <div className="space-y-4">
                      <Button
                        size="lg"
                        className="w-full"
                        onClick={() => completeExercise(activeExercise, activeExercise === "meditation" ? 15 : 20)}
                      >
                        Complete Exercise
                      </Button>
                      <Button variant="outline" onClick={() => setActiveExercise(null)}>
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Back to Exercises
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </AuthGate>
  );
};

export default Exercises;
