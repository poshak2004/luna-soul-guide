import { AuthGate } from '@/components/AuthGate';
import { Logo } from '@/components/Logo';
import { StreakCard } from '@/components/insights/StreakCard';
import { PointsBar } from '@/components/insights/PointsBar';
import { WellnessReport } from '@/components/insights/WellnessReport';
import { ActivityTimeline } from '@/components/ActivityTimeline';
import { BadgeGrid } from '@/components/gamification/BadgeGrid';
import { motion } from 'framer-motion';

const Insights = () => (
  <AuthGate>
    <div className="min-h-screen bg-gradient-calm p-6">
      <header className="max-w-6xl mx-auto mb-8">
        <Logo />
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <h1 className="text-4xl font-bold text-primary mt-6">Your Wellness Insights</h1>
          <p className="text-muted-foreground mt-2">Track your progress and celebrate your journey</p>
        </motion.div>
      </header>

      <main className="max-w-6xl mx-auto space-y-6">
        <PointsBar />
        
        <div className="grid gap-6 md:grid-cols-2">
          <StreakCard />
          <BadgeGrid />
        </div>

        <WellnessReport />
        <ActivityTimeline />
      </main>
    </div>
  </AuthGate>
);

export default Insights;
