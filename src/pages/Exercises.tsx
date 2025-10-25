import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wind, Brain, Dumbbell, Zap, Play, Pause, RotateCcw, Check, Timer, Target, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AuthGate } from "@/components/AuthGate";
import { useGamification } from "@/hooks/useGamification";
import { Logo } from "@/components/Logo";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Exercises = () => {
  const [activeExercise, setActiveExercise] = useState<string | null>(null);
  const [breathPhase, setBreathPhase] = useState<"inhale" | "hold1" | "exhale" | "hold2">("inhale");
  const [breathCount, setBreathCount] = useState(0);
  const [isBreathing, setIsBreathing] = useState(false);
  const [timer, setTimer] = useState(0);
  const [phaseTimer, setPhaseTimer] = useState(4);
  const [groundingStep, setGroundingStep] = useState(0);
  const [meditationTimer, setMeditationTimer] = useState(0);
  const [isMeditating, setIsMeditating] = useState(false);
  const { refreshProfile } = useGamification();
  const { toast } = useToast();

  const exercises = [
    {
      id: "breathing",
      title: "Box Breathing",
      description: "4-4-4-4 breathing technique for instant calm and focus",
      icon: Wind,
      color: "text-primary",
      bgColor: "bg-primary/10",
      points: 10,
      duration: "2 min",
      difficulty: "Beginner"
    },
    {
      id: "meditation",
      title: "Mindful Meditation",
      description: "5-minute guided meditation journey for mental clarity",
      icon: Brain,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
      points: 15,
      duration: "5 min",
      difficulty: "Intermediate"
    },
    {
      id: "grounding",
      title: "5-4-3-2-1 Grounding",
      description: "Powerful sensory awareness exercise to combat anxiety",
      icon: Zap,
      color: "text-accent",
      bgColor: "bg-accent/10",
      points: 10,
      duration: "3 min",
      difficulty: "Beginner"
    },
    {
      id: "progressive",
      title: "Progressive Relaxation",
      description: "Release physical tension muscle by muscle systematically",
      icon: Dumbbell,
      color: "text-support",
      bgColor: "bg-support/10",
      points: 20,
      duration: "10 min",
      difficulty: "Advanced"
    },
  ];

  const groundingSteps = [
    { count: 5, sense: "See", text: "Name 5 things you can see around you", icon: "👁️" },
    { count: 4, sense: "Touch", text: "Name 4 things you can touch", icon: "✋" },
    { count: 3, sense: "Hear", text: "Name 3 things you can hear", icon: "👂" },
    { count: 2, sense: "Smell", text: "Name 2 things you can smell", icon: "👃" },
    { count: 1, sense: "Taste", text: "Name 1 thing you can taste", icon: "👅" },
  ];

  const breathPhaseText = {
    inhale: "Breathe In",
    hold1: "Hold",
    exhale: "Breathe Out",
    hold2: "Hold",
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isBreathing) {
      interval = setInterval(() => {
        setPhaseTimer((prev) => {
          if (prev <= 0) {
            return 4;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isBreathing]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isMeditating) {
      interval = setInterval(() => {
        setMeditationTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isMeditating]);

  const startBreathing = () => {
    setIsBreathing(true);
    setBreathCount(0);
    setPhaseTimer(4);
    breathingCycle();
  };

  const breathingCycle = async () => {
    const phases: Array<"inhale" | "hold1" | "exhale" | "hold2"> = ["inhale", "hold1", "exhale", "hold2"];
    let currentPhaseIndex = 0;
    let cycles = 0;

    const interval = setInterval(() => {
      currentPhaseIndex = (currentPhaseIndex + 1) % phases.length;
      setBreathPhase(phases[currentPhaseIndex]);
      setPhaseTimer(4);

      if (currentPhaseIndex === 0) {
        cycles++;
        setBreathCount(cycles);
        
        if (cycles >= 4) {
          clearInterval(interval);
          setIsBreathing(false);
          completeExercise("breathing");
        }
      }
    }, 4000);
  };

  const startMeditation = () => {
    setIsMeditating(true);
    setMeditationTimer(0);
    setTimeout(() => {
      setIsMeditating(false);
      completeExercise("meditation");
    }, 300000); // 5 minutes
  };

  const completeExercise = async (exerciseId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc('complete_exercise', {
        _user_id: user.id,
        _exercise_type: `${exerciseId}_exercise`,
      });

      if (error) throw error;

      const badgeResult = await supabase.rpc('check_and_award_badges', {
        _user_id: user.id,
      });

      const result = data as any;
      if (result?.success) {
        toast({
          title: `🎉 +${result.points_earned} points!`,
          description: `You earned ${result.points_earned} wellness points`,
        });
      }

      const badgeData = badgeResult.data as any;
      if (badgeData?.awarded_badges && badgeData.awarded_badges.length > 0) {
        badgeData.awarded_badges.forEach((badge: any) => {
          toast({
            title: '🏆 New Badge Unlocked!',
            description: `You earned the "${badge.name}" badge!`,
          });
        });
      }

      setActiveExercise(null);
      setGroundingStep(0);
      setMeditationTimer(0);
      await refreshProfile();
    } catch (error: any) {
      console.error('Error completing exercise:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to complete exercise',
        variant: 'destructive',
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Logo size="lg" />
              </motion.div>
              <h1 className="font-display text-5xl font-bold bg-gradient-vibrant bg-clip-text text-transparent">
                Wellness Exercises
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Transform your mind and body with guided wellness exercises. Each practice earns you points and brings you closer to inner peace.
            </p>
          </motion.div>

          {!activeExercise ? (
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {exercises.map((exercise, index) => (
                <motion.div
                  key={exercise.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                >
                  <Card 
                    className="glass hover:glow transition-all duration-500 cursor-pointer group h-full overflow-hidden relative"
                    onClick={() => setActiveExercise(exercise.id)}
                  >
                    <div className="absolute inset-0 bg-gradient-vibrant opacity-0 group-hover:opacity-5 transition-opacity duration-500" />
                    <CardHeader className="relative">
                      <div className={`w-20 h-20 ${exercise.bgColor} rounded-3xl flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-500 shadow-lg`}>
                        <exercise.icon className={`w-10 h-10 ${exercise.color}`} />
                      </div>
                      <CardTitle className="text-2xl group-hover:text-primary transition-colors duration-300">
                        {exercise.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="relative space-y-4">
                      <p className="text-muted-foreground leading-relaxed">
                        {exercise.description}
                      </p>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary">
                          <Timer className="w-3 h-3" />
                          {exercise.duration}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-accent/10 text-accent">
                          <Target className="w-3 h-3" />
                          {exercise.difficulty}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-secondary/10 text-secondary">
                          <Sparkles className="w-3 h-3" />
                          +{exercise.points} points
                        </span>
                      </div>
                      <Button size="lg" className="w-full group-hover:scale-105 transition-transform duration-300">
                        Start Exercise <Play className="w-4 h-4 ml-2" />
                      </Button>
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
                  className="max-w-3xl mx-auto"
                >
                  <Card className="glass p-12 text-center">
                    <div className="mb-8">
                      <motion.div
                        animate={{
                          scale: breathPhase === "inhale" || breathPhase === "hold1" ? 1.4 : 0.8,
                        }}
                        transition={{ duration: 4, ease: "easeInOut" }}
                        className="w-72 h-72 mx-auto rounded-full flex items-center justify-center relative"
                        style={{
                          background: `radial-gradient(circle, hsl(200, 75%, 70%), hsl(175, 55%, 70%))`,
                          boxShadow: '0 0 60px rgba(100, 181, 246, 0.4)',
                        }}
                      >
                        <motion.div
                          animate={{
                            scale: breathPhase === "inhale" || breathPhase === "hold1" ? 1.2 : 0.7,
                          }}
                          transition={{ duration: 4, ease: "easeInOut" }}
                          className="w-56 h-56 bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm"
                        >
                          <div className="text-center">
                            <p className="text-4xl font-bold text-white mb-2">
                              {breathPhaseText[breathPhase]}
                            </p>
                            <p className="text-6xl font-bold text-white">{phaseTimer}</p>
                          </div>
                        </motion.div>
                      </motion.div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-3xl font-bold">Box Breathing Exercise</h3>
                      <div className="flex items-center justify-center gap-8 text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-primary rounded-full animate-pulse-gentle" />
                          <span>Cycle {breathCount} of 4</span>
                        </div>
                        <Progress value={(breathCount / 4) * 100} className="w-48" />
                      </div>

                      {!isBreathing ? (
                        <div className="space-y-4 mt-8">
                          <div className="bg-muted/50 rounded-xl p-6 mb-6">
                            <p className="text-sm text-muted-foreground">
                              Follow the visual guide: <span className="font-semibold text-primary">Inhale for 4 seconds</span>, 
                              <span className="font-semibold text-secondary"> hold for 4 seconds</span>, 
                              <span className="font-semibold text-accent"> exhale for 4 seconds</span>, and 
                              <span className="font-semibold text-support"> hold for 4 seconds</span>.
                            </p>
                          </div>
                          <Button size="lg" onClick={startBreathing} className="w-full text-lg py-6">
                            <Play className="w-6 h-6 mr-2" />
                            Begin Breathing Exercise
                          </Button>
                          <Button variant="outline" size="lg" onClick={() => setActiveExercise(null)} className="w-full">
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Back to Exercises
                          </Button>
                        </div>
                      ) : (
                        <Button variant="outline" disabled size="lg" className="w-full mt-8">
                          <Pause className="w-5 h-5 mr-2" />
                          Exercise in Progress...
                        </Button>
                      )}
                    </div>
                  </Card>
                </motion.div>
              )}

              {activeExercise === "grounding" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="max-w-3xl mx-auto"
                >
                  <Card className="glass p-10">
                    <CardHeader>
                      <CardTitle className="text-3xl flex items-center gap-3">
                        <Zap className="w-8 h-8 text-accent" />
                        5-4-3-2-1 Grounding Exercise
                      </CardTitle>
                      <p className="text-muted-foreground text-lg mt-2">
                        Engage your senses to anchor yourself in the present moment
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-6 mt-6">
                      {groundingSteps.map((step, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`p-6 rounded-2xl transition-all duration-300 ${
                            groundingStep >= index
                              ? 'bg-gradient-to-r from-accent/20 to-primary/20 border-2 border-accent/30'
                              : 'bg-muted/30 border-2 border-transparent'
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div className="text-5xl">{step.icon}</div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-3">
                                <p className="font-bold text-xl text-foreground">
                                  {step.count} - {step.sense}
                                </p>
                                {groundingStep > index && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-8 h-8 bg-accent rounded-full flex items-center justify-center"
                                  >
                                    <Check className="w-5 h-5 text-white" />
                                  </motion.div>
                                )}
                              </div>
                              <p className="text-muted-foreground mb-3">{step.text}</p>
                              {groundingStep === index && (
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                >
                                  <Button
                                    onClick={() => setGroundingStep(index + 1)}
                                    className="mt-2"
                                  >
                                    Complete Step <Check className="w-4 h-4 ml-2" />
                                  </Button>
                                </motion.div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                      <div className="flex gap-4 pt-6">
                        <Button
                          className="flex-1 text-lg py-6"
                          onClick={() => completeExercise("grounding")}
                          disabled={groundingStep < groundingSteps.length}
                        >
                          {groundingStep < groundingSteps.length ? (
                            <>Complete All Steps First</>
                          ) : (
                            <>Finish Exercise <Sparkles className="w-4 h-4 ml-2" /></>
                          )}
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setActiveExercise(null);
                            setGroundingStep(0);
                          }}
                          className="px-8"
                        >
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Back
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {activeExercise === "meditation" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="max-w-3xl mx-auto"
                >
                  <Card className="glass p-12 text-center">
                    <h3 className="text-3xl font-bold mb-6 flex items-center justify-center gap-3">
                      <Brain className="w-8 h-8 text-secondary" />
                      Mindful Meditation
                    </h3>
                    
                    {!isMeditating ? (
                      <div className="space-y-6">
                        <div className="bg-muted/50 rounded-2xl p-8 mb-8">
                          <p className="text-muted-foreground leading-relaxed text-lg">
                            Find a comfortable seated position. Close your eyes or soften your gaze. 
                            Focus on your breath, observing each inhale and exhale without judgment. 
                            When your mind wanders, gently bring your attention back to your breath.
                          </p>
                        </div>
                        <motion.div className="w-64 h-64 mx-auto mb-8 breathe">
                          <div className="w-full h-full rounded-full bg-gradient-to-br from-secondary/30 to-primary/30 flex items-center justify-center">
                            <Logo size="lg" className="w-32 h-32" />
                          </div>
                        </motion.div>
                        <Button size="lg" onClick={startMeditation} className="w-full text-lg py-6">
                          <Play className="w-6 h-6 mr-2" />
                          Begin 5-Minute Meditation
                        </Button>
                        <Button variant="outline" size="lg" onClick={() => setActiveExercise(null)} className="w-full">
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Back to Exercises
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-8">
                        <motion.div 
                          className="w-64 h-64 mx-auto breathe"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                        >
                          <div className="w-full h-full rounded-full bg-gradient-to-br from-secondary/40 to-primary/40 flex items-center justify-center shadow-glow">
                            <Logo size="lg" className="w-32 h-32" />
                          </div>
                        </motion.div>
                        <div className="text-center">
                          <p className="text-6xl font-bold text-primary mb-2">{formatTime(meditationTimer)}</p>
                          <p className="text-muted-foreground">Time Remaining: {formatTime(300 - meditationTimer)}</p>
                          <Progress value={(meditationTimer / 300) * 100} className="w-full max-w-md mx-auto mt-4" />
                        </div>
                        <p className="text-muted-foreground italic">
                          "Be present. Be still. Be at peace."
                        </p>
                      </div>
                    )}
                  </Card>
                </motion.div>
              )}

              {activeExercise === "progressive" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="max-w-3xl mx-auto"
                >
                  <Card className="glass p-12 text-center">
                    <h3 className="text-3xl font-bold mb-6 flex items-center justify-center gap-3">
                      <Dumbbell className="w-8 h-8 text-support" />
                      Progressive Muscle Relaxation
                    </h3>
                    
                    <div className="space-y-6">
                      <div className="bg-muted/50 rounded-2xl p-8 mb-8 text-left">
                        <p className="text-muted-foreground leading-relaxed text-lg mb-4">
                          Progressive muscle relaxation involves tensing and then releasing different muscle groups. This helps you:
                        </p>
                        <ul className="space-y-2 text-muted-foreground">
                          <li className="flex items-start gap-3">
                            <Check className="w-5 h-5 text-support mt-0.5 flex-shrink-0" />
                            <span>Release physical tension stored in your body</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <Check className="w-5 h-5 text-support mt-0.5 flex-shrink-0" />
                            <span>Distinguish between tension and relaxation</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <Check className="w-5 h-5 text-support mt-0.5 flex-shrink-0" />
                            <span>Achieve deeper states of relaxation</span>
                          </li>
                        </ul>
                      </div>
                      
                      <motion.div className="w-64 h-64 mx-auto mb-8 breathe">
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-support/30 to-accent/30 flex items-center justify-center shadow-glow">
                          <Logo size="lg" className="w-32 h-32" />
                        </div>
                      </motion.div>
                      
                      <div className="bg-primary/10 rounded-xl p-6 mb-6">
                        <p className="text-sm text-muted-foreground">
                          Start from your toes and work your way up: tense each muscle group for 5 seconds, 
                          then release and notice the difference for 10 seconds before moving to the next group.
                        </p>
                      </div>

                      <Button
                        size="lg"
                        className="w-full text-lg py-6"
                        onClick={() => completeExercise("progressive")}
                      >
                        Complete Exercise <Sparkles className="w-5 h-5 ml-2" />
                      </Button>
                      <Button variant="outline" size="lg" onClick={() => setActiveExercise(null)} className="w-full">
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
