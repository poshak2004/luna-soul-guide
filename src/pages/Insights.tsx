
import { Logo } from '@/components/Logo';
import { StreakCard } from '@/components/insights/StreakCard';
import { PointsBar } from '@/components/insights/PointsBar';
import { WellnessReport } from '@/components/insights/WellnessReport';
import { ActivityTimeline } from '@/components/ActivityTimeline';
import { BadgeGrid } from '@/components/gamification/BadgeGrid';
import { MoodTrendsChart } from '@/components/insights/MoodTrendsChart';
import { ActivityPieChart } from '@/components/insights/ActivityPieChart';
import { AIInsightsSummary } from '@/components/insights/AIInsightsSummary';
import { LevelProgress } from '@/components/gamification/LevelProgress';
import { LunaCompanion } from '@/components/luna/LunaCompanion';
import { useLuna } from '@/hooks/useLuna';
import { motion } from 'framer-motion';

const Insights = () => {
  const luna = useLuna();

  return (
    <>
      <div className="min-h-screen bg-gradient-calm p-6 pt-20">
        <header className="max-w-6xl mx-auto mb-8">
          <Logo />
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            <h1 className="text-4xl font-bold text-primary mt-6">Your Wellness Command Center</h1>
            <p className="text-muted-foreground mt-2">Track your progress and celebrate your journey</p>
          </motion.div>
        </header>

        <main className="max-w-6xl mx-auto space-y-6">
          {/* Level & Points Row */}
          <div className="grid gap-6 md:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <LevelProgress />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <PointsBar />
            </motion.div>
          </div>

          {/* Charts Row */}
          <div className="grid gap-6 md:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <MoodTrendsChart />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <ActivityPieChart />
            </motion.div>
          </div>

          {/* AI Insights & Streak */}
          <div className="grid gap-6 md:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <AIInsightsSummary />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <StreakCard />
            </motion.div>
          </div>

          {/* Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-xl font-semibold mb-4">Your Badges</h2>
            <BadgeGrid />
          </motion.div>

          {/* Detailed Reports */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <WellnessReport />
          </motion.div>

          {/* Activity Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <ActivityTimeline />
          </motion.div>
        </main>

        <LunaCompanion
          emotion={luna.emotion}
          message={luna.message}
          showMessage={luna.showMessage}
          onDismiss={luna.dismiss}
          position="fixed"
          level={luna.level}
        />
      </div>
    </AuthGate>
  );
};

export default Insights;
