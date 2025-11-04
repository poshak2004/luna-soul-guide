import { useState, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wind, Brain, Target, Heart, Zap, Sparkles, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthGate } from "@/components/AuthGate";
import { useGamification } from "@/hooks/useGamification";
import { Logo } from "@/components/Logo";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { rpcWithRetry } from "@/lib/supabaseHelper";

// Lazy load exercise components for better performance
const BreatheSync = lazy(() => import("@/components/exercises/BreatheSync").then(m => ({ default: m.BreatheSync })));
const ReflectLoop = lazy(() => import("@/components/exercises/ReflectLoop").then(m => ({ default: m.ReflectLoop })));
const MoodFlow = lazy(() => import("@/components/exercises/MoodFlow").then(m => ({ default: m.MoodFlow })));
const MindMirror = lazy(() => import("@/components/exercises/MindMirror").then(m => ({ default: m.MindMirror })));
const FocusSprint = lazy(() => import("@/components/exercises/FocusSprint").then(m => ({ default: m.FocusSprint })));

const Exercises = () => {
  const [activeExercise, setActiveExercise] = useState<string | null>(null);
  const { refreshProfile } = useGamification();
  const { toast } = useToast();

  const exercises = [
    {
      id: "breathesync",
      title: "BreatheSync",
      description: "Animated breathing orb with adaptive rhythm for instant calm",
      icon: Wind,
      gradient: "from-primary via-primary-light to-primary",
      color: "text-primary",
      bgGlow: "bg-primary/20",
      points: 15,
      duration: "3 min",
      component: BreatheSync,
    },
    {
      id: "reflectloop",
      title: "ReflectLoop",
      description: "Guided journaling with AI-powered reflections and prompts",
      icon: BookOpen,
      gradient: "from-secondary via-accent to-secondary",
      color: "text-secondary",
      bgGlow: "bg-secondary/20",
      points: 20,
      duration: "5 min",
      component: ReflectLoop,
    },
    {
      id: "focussprint",
      title: "Focus Sprint",
      description: "Quick mental challenges with rewarding feedback animations",
      icon: Zap,
      gradient: "from-accent via-primary to-accent",
      color: "text-accent",
      bgGlow: "bg-accent/20",
      points: 25,
      duration: "2 min",
      component: FocusSprint,
    },
    {
      id: "moodflow",
      title: "Mood Flow",
      description: "Interactive emotion wheel that changes visuals and tones",
      icon: Target,
      gradient: "from-support via-secondary to-support",
      color: "text-support",
      bgGlow: "bg-support/20",
      points: 15,
      duration: "4 min",
      component: MoodFlow,
    },
    {
      id: "mindmirror",
      title: "Mind Mirror",
      description: "Affirmation generator adapting tone via AI sentiment detection",
      icon: Heart,
      gradient: "from-accent via-secondary to-primary",
      color: "text-accent",
      bgGlow: "bg-accent/20",
      points: 10,
      duration: "3 min",
      component: MindMirror,
    },
  ];

  const completeExercise = async (exerciseId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      // Map exercise IDs to database exercise types
      const exerciseTypeMap: Record<string, string> = {
        breathesync: 'breathing_exercise',
        reflectloop: 'meditation_exercise',
        focussprint: 'grounding_exercise',
        moodflow: 'breathing_exercise',
        mindmirror: 'meditation_exercise',
      };

      // Use atomic RPC function
      const { data, error } = await rpcWithRetry<any>('complete_exercise_and_award', {
        _user_id: user.id,
        _exercise_type: exerciseTypeMap[exerciseId] || 'breathing_exercise',
      });

      if (error) throw error;

      // Check for new badges
      const badgeResult = await rpcWithRetry('check_and_award_badges', {
        _user_id: user.id,
      });

      if (data?.success) {
        toast({
          title: `🎉 +${data.points_earned} points!`,
          description: `You earned ${data.points_earned} wellness points`,
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
      await refreshProfile();
    } catch (error: any) {
      if (import.meta.env.DEV) console.error('Error completing exercise:', error);
      
      // User-friendly error messages
      const errorMessage = error.message?.includes('wait') 
        ? 'Please wait a moment before completing this exercise again'
        : 'Failed to complete exercise. Please try again.';
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const activeExerciseData = exercises.find(e => e.id === activeExercise);

  return (
    <AuthGate>
      <div className="min-h-screen pt-16 bg-gradient-calm">
        <div className="container mx-auto px-4 py-12">
          {!activeExercise ? (
            <>
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-16"
              >
                <div className="flex items-center justify-center gap-4 mb-6">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    <Logo size="lg" />
                  </motion.div>
                  <h1 className="font-display text-6xl font-bold bg-gradient-vibrant bg-clip-text text-transparent">
                    Wellness Exercises
                  </h1>
                </div>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  Immersive, AI-enhanced experiences that merge design, sound, and interaction 
                  for emotional well-being and mental clarity.
                </p>
              </motion.div>

              {/* Exercise Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                {exercises.map((exercise, index) => (
                  <motion.div
                    key={exercise.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      delay: index * 0.1,
                      duration: 0.5,
                      ease: "easeOut"
                    }}
                  >
                    <Card 
                      className="glass hover-lift cursor-pointer group h-full overflow-hidden relative border-2"
                      onClick={() => setActiveExercise(exercise.id)}
                    >
                      {/* Background glow effect */}
                      <motion.div
                        className={`absolute inset-0 ${exercise.bgGlow} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                        animate={{
                          scale: [1, 1.05, 1],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />

                      <CardHeader className="relative space-y-4">
                        {/* Icon with gradient background */}
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ type: "spring", stiffness: 300 }}
                          className={`w-20 h-20 bg-gradient-to-br ${exercise.gradient} rounded-3xl flex items-center justify-center shadow-lg group-hover:shadow-2xl transition-shadow duration-300`}
                        >
                          <exercise.icon className="w-10 h-10 text-white" />
                        </motion.div>

                        <CardTitle className="text-2xl group-hover:text-primary transition-colors duration-300">
                          {exercise.title}
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="relative space-y-4">
                        <p className="text-muted-foreground leading-relaxed min-h-[60px]">
                          {exercise.description}
                        </p>

                        {/* Stats badges */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                            ⏱️ {exercise.duration}
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                            <Sparkles className="w-3 h-3" />
                            +{exercise.points} points
                          </span>
                        </div>

                        {/* Hover indicator */}
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          whileHover={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-2 text-sm font-medium text-primary"
                        >
                          <span>Start Exercise</span>
                          <motion.span
                            animate={{ x: [0, 5, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            →
                          </motion.span>
                        </motion.div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </>
          ) : (
            <AnimatePresence mode="wait">
              <Suspense
                fallback={
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="max-w-4xl mx-auto"
                  >
                    <Card className="glass p-12 space-y-6">
                      <Skeleton className="h-12 w-64 mx-auto" />
                      <Skeleton className="h-96 w-full" />
                      <Skeleton className="h-12 w-full" />
                    </Card>
                  </motion.div>
                }
              >
                {activeExerciseData && (
                  <activeExerciseData.component
                    onComplete={() => completeExercise(activeExercise)}
                    onExit={() => setActiveExercise(null)}
                  />
                )}
              </Suspense>
            </AnimatePresence>
          )}
        </div>
      </div>
    </AuthGate>
  );
};

export default Exercises;
