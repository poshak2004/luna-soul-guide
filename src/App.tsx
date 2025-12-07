import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, redirect } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";
import Navigation from "./components/Navigation";
import { CalmNowButton } from "./components/home/CalmNowButton";
import { AchievementPopup } from "./components/gamification/AchievementPopup";
import { LunaOnboardingOverlay } from "./components/luna/LunaOnboardingOverlay";
import { OnboardingTour } from "./components/onboarding/OnboardingTour";
import Landing from "./pages/Landing";
import Chat from "./pages/Chat";
import Guide from "./pages/Guide";
import Onboarding from "./pages/Onboarding";
import Journal from "./pages/Journal";
import Dashboard from "./pages/Dashboard";
import Crisis from "./pages/Crisis";
import Exercises from "./pages/Exercises";
import Leaderboard from "./pages/Leaderboard";
import Assessments from "./pages/Assessments";
import AssessmentTake from "./pages/AssessmentTake";
import AssessmentResults from "./pages/AssessmentResults";
import MoodCalendar from "./pages/MoodCalendar";
import BiomarkerDashboard from "./pages/BiomarkerDashboard";
import CogniArts from "./pages/CogniArts";
import SensoryHealing from "./pages/SensoryHealing";
import VoiceCompanion from "./pages/VoiceCompanion";
import WellnessReports from "./pages/WellnessReports";
import Insights from "./pages/Insights";
import Settings from "./pages/Settings";
import SoundManager from "./pages/admin/SoundManager";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.4
};

// Server-side route protection loader
const protectedLoader = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return redirect('/');
  }
  return null;
};

const AnimatedRoutes = () => {
  const location = useLocation();
  useSmoothScroll(); // Enable ultra-smooth scrolling globally

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}>
            <Landing />
          </motion.div>
        } />
        <Route path="/guide" element={
          <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}>
            <Guide />
          </motion.div>
        } />
        <Route path="/chat" element={
          <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}>
            <Chat />
          </motion.div>
        } loader={protectedLoader} />
        <Route path="/onboarding" element={
          <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}>
            <Onboarding />
          </motion.div>
        } loader={protectedLoader} />
        <Route path="/journal" element={
          <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}>
            <Journal />
          </motion.div>
        } loader={protectedLoader} />
        <Route path="/exercises" element={
          <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}>
            <Exercises />
          </motion.div>
        } loader={protectedLoader} />
        <Route path="/leaderboard" element={
          <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}>
            <Leaderboard />
          </motion.div>
        } loader={protectedLoader} />
        <Route path="/dashboard" element={
          <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}>
            <Dashboard />
          </motion.div>
        } loader={protectedLoader} />
        <Route path="/crisis" element={
          <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}>
            <Crisis />
          </motion.div>
        } />
        <Route path="/assessments" element={
          <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}>
            <Assessments />
          </motion.div>
        } loader={protectedLoader} />
        <Route path="/assessments/:type" element={
          <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}>
            <AssessmentTake />
          </motion.div>
        } loader={protectedLoader} />
        <Route path="/assessments/results/:id" element={
          <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}>
            <AssessmentResults />
          </motion.div>
        } loader={protectedLoader} />
        <Route path="/mood-calendar" element={
          <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}>
            <MoodCalendar />
          </motion.div>
        } loader={protectedLoader} />
        <Route path="/biomarkers" element={
          <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}>
            <BiomarkerDashboard />
          </motion.div>
        } loader={protectedLoader} />
        <Route path="/cogniarts" element={
          <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}>
            <CogniArts />
          </motion.div>
        } loader={protectedLoader} />
        <Route path="/sensory-healing" element={
          <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}>
            <SensoryHealing />
          </motion.div>
        } loader={protectedLoader} />
        <Route path="/luna" element={
          <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}>
            <VoiceCompanion />
          </motion.div>
        } loader={protectedLoader} />
        <Route path="/wellness-reports" element={
          <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}>
            <WellnessReports />
          </motion.div>
        } loader={protectedLoader} />
        <Route path="/insights" element={
          <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}>
            <Insights />
          </motion.div>
        } loader={protectedLoader} />
        <Route path="/settings" element={
          <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}>
            <Settings />
          </motion.div>
        } loader={protectedLoader} />
        <Route path="/admin/sounds" element={
          <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}>
            <SoundManager />
          </motion.div>
        } loader={protectedLoader} />
        <Route path="*" element={
          <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}>
            <NotFound />
          </motion.div>
        } />
      </Routes>
    </AnimatePresence>
  );
};

// Luna Onboarding Manager Component
const LunaOnboardingManager = () => {
  const [showLunaIntro, setShowLunaIntro] = useState(false);
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    const checkOnboarding = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && !user.user_metadata?.luna_introduced) {
        setShowLunaIntro(true);
      }
    };
    
    // Check after a brief delay to let auth settle
    const timer = setTimeout(checkOnboarding, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <LunaOnboardingOverlay 
        isOpen={showLunaIntro} 
        onClose={() => setShowLunaIntro(false)}
        onStartTour={() => {
          setShowLunaIntro(false);
          setShowTour(true);
        }}
      />
      <OnboardingTour 
        isOpen={showTour} 
        onClose={() => setShowTour(false)} 
      />
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navigation />
        <AnimatedRoutes />
        <CalmNowButton />
        <AchievementPopup />
        <LunaOnboardingManager />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
