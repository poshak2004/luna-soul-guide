import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Calendar, Sparkles, Award } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { useJournal } from "@/hooks/useJournal";
import { useGamification } from "@/hooks/useGamification";
import { Logo } from "@/components/Logo";

const Dashboard = () => {
  const { entries } = useJournal();
  const { profile, userBadges } = useGamification();

  const stats = [
    { title: "Journal Entries", value: entries.length, icon: Calendar, color: "text-primary", bgColor: "bg-primary/10" },
    { title: "Wellness Points", value: profile?.total_points || 0, icon: Sparkles, color: "text-secondary", bgColor: "bg-secondary/10" },
    { title: "Current Streak", value: `${profile?.current_streak || 0} days`, icon: TrendingUp, color: "text-accent", bgColor: "bg-accent/10" },
    { title: "Badges Earned", value: userBadges.length, icon: Award, color: "text-support", bgColor: "bg-support/10" },
  ];

  const moodDistribution = entries.reduce((acc, entry) => {
    acc[entry.mood_label] = (acc[entry.mood_label] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <AuthGate>
      <div className="min-h-screen pt-16 bg-gradient-calm">
        <div className="container mx-auto px-4 py-12">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
            <div className="inline-flex items-center gap-3 mb-4">
              <Logo size="md" />
              <h1 className="font-display text-3xl font-bold">Dashboard</h1>
            </div>
            <p className="text-muted-foreground">Track your progress and celebrate your growth</p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, idx) => (
              <motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                <Card className="glass hover:shadow-lg transition-all">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                        <p className="text-3xl font-bold">{stat.value}</p>
                      </div>
                      <div className={`p-3 rounded-full ${stat.bgColor}`}>
                        <stat.icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <Card className="glass">
            <CardHeader><CardTitle>Mood Distribution</CardTitle></CardHeader>
            <CardContent>
              {Object.keys(moodDistribution).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(moodDistribution).map(([mood, count]) => (
                    <div key={mood}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm capitalize">{mood}</span>
                        <span className="text-sm text-muted-foreground">{count}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${(count / entries.length) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p className="text-muted-foreground text-center py-8">Start journaling to see your mood trends</p>}
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGate>
  );
};

export default Dashboard;
