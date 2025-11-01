import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import Landing from "./pages/Landing";
import Chat from "./pages/Chat";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navigation />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/exercises" element={<Exercises />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/crisis" element={<Crisis />} />
          <Route path="/assessments" element={<Assessments />} />
          <Route path="/assessments/:type" element={<AssessmentTake />} />
          <Route path="/assessments/results/:id" element={<AssessmentResults />} />
          <Route path="/mood-calendar" element={<MoodCalendar />} />
          <Route path="/biomarkers" element={<BiomarkerDashboard />} />
          <Route path="/cogniarts" element={<CogniArts />} />
          <Route path="/sensory-healing" element={<SensoryHealing />} />
          <Route path="/luna" element={<VoiceCompanion />} />
          <Route path="/wellness-reports" element={<WellnessReports />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
