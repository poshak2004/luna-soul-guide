import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Calendar, Sparkles, Award, Trophy, Zap, Target } from "lucide-react";

import { useJournal } from "@/hooks/useJournal";
import { useGamification } from "@/hooks/useGamification";
import { Logo } from "@/components/Logo";
import { Progress } from "@/components/ui/progress";
import { ActivityTimeline } from "@/components/ActivityTimeline";
import { LunaCompanion } from "@/components/luna/LunaCompanion";
import { useLuna } from "@/hooks/useLuna";
import { DailyCheckInWidget } from "@/components/home/DailyCheckInWidget";

const Dashboard = () => {
  const { entries } = useJournal();
  const { profile, userBadges, badges } = useGamification();
  const luna = useLuna();

  const stats = [
    { 
      title: "Journal Entries", 
      value: entries.length, 
      icon: Calendar, 
      color: "text-primary", 
      bgColor: "bg-primary/10",
      gradient: "from-primary/20 to-primary/5"
    },
    { 
      title: "Wellness Points", 
      value: profile?.total_points || 0, 
      icon: Sparkles, 
      color: "text-secondary", 
      bgColor: "bg-secondary/10",
      gradient: "from-secondary/20 to-secondary/5"
    },
    { 
      title: "Current Streak", 
      value: `${profile?.current_streak || 0}`, 
      suffix: "days",
      icon: TrendingUp, 
      color: "text-accent", 
      bgColor: "bg-accent/10",
      gradient: "from-accent/20 to-accent/5"
    },
    { 
      title: "Badges Earned", 
      value: userBadges.length, 
      icon: Award, 
      color: "text-support", 
      bgColor: "bg-support/10",
      gradient: "from-support/20 to-support/5"
    },
  ];

  const moodDistribution = entries.reduce((acc, entry) => {
    acc[entry.mood_label] = (acc[entry.mood_label] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const moodColors: Record<string, string> = {
    happy: "bg-accent",
    calm: "bg-primary",
    anxious: "bg-destructive",
    sad: "bg-secondary",
    stressed: "bg-support",
    neutral: "bg-muted-foreground"
  };

  const nextBadge = badges.find(
    (badge) => 
      !userBadges.some((ub) => ub.badge_id === badge.id) && 
      (profile?.total_points || 0) < badge.points_required
  );

  const progressToNextBadge = nextBadge 
    ? ((profile?.total_points || 0) / nextBadge.points_required) * 100 
    : 100;

  return (
    <AuthGate>
      <div className="min-h-screen pt-16 bg-gradient-calm">
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="mb-12 text-center"
          >
            <div className="inline-flex items-center gap-3 mb-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Logo size="md" />
              </motion.div>
              <h1 className="font-display text-4xl font-bold bg-gradient-vibrant bg-clip-text text-transparent">
                Your Wellness Dashboard
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">Track your progress and celebrate your growth journey</p>
          </motion.div>

          {/* Daily Check-in Widget */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mb-8"
          >
            <DailyCheckInWidget />
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, idx) => (
              <motion.div 
                key={stat.title} 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <Card className={`glass hover:glow transition-all duration-500 cursor-pointer overflow-hidden relative h-full`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-50`} />
                  <CardContent className="pt-6 relative">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-2 font-medium">{stat.title}</p>
                        <div className="flex items-baseline gap-1">
                          <p className="text-4xl font-bold">{stat.value}</p>
                          {stat.suffix && <p className="text-lg text-muted-foreground">{stat.suffix}</p>}
                        </div>
                      </div>
                      <div className={`p-4 rounded-2xl ${stat.bgColor} shadow-lg`}>
                        <stat.icon className={`h-8 w-8 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="glass h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Zap className="w-6 h-6 text-primary" />
                    Mood Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {Object.keys(moodDistribution).length > 0 ? (
                    <div className="space-y-4">
                      {Object.entries(moodDistribution)
                        .sort(([, a], [, b]) => b - a)
                        .map(([mood, count]) => {
                          const percentage = (count / entries.length) * 100;
                          return (
                            <motion.div 
                              key={mood}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="space-y-2"
                            >
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-semibold capitalize flex items-center gap-2">
                                  <div className={`w-3 h-3 rounded-full ${moodColors[mood] || 'bg-muted'}`} />
                                  {mood}
                                </span>
                                <span className="text-sm text-muted-foreground font-medium">
                                  {count} entries ({percentage.toFixed(0)}%)
                                </span>
                              </div>
                              <Progress value={percentage} className="h-3" />
                            </motion.div>
                          );
                        })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Calendar className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                      <p className="text-muted-foreground text-lg">Start journaling to see your mood trends</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="glass h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Trophy className="w-6 h-6 text-secondary" />
                    Badge Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {userBadges.length > 0 ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-3 gap-4">
                        {userBadges.slice(0, 6).map((userBadge) => {
                          const badge = badges.find((b) => b.id === userBadge.badge_id);
                          return badge ? (
                            <motion.div
                              key={badge.id}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              whileHover={{ scale: 1.1 }}
                              className="flex flex-col items-center p-3 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl cursor-pointer group"
                              title={badge.description}
                            >
                              <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">
                                {badge.icon}
                              </div>
                              <p className="text-xs font-semibold text-center line-clamp-2">{badge.name}</p>
                            </motion.div>
                          ) : null;
                        })}
                      </div>

                      {nextBadge && (
                        <div className="mt-6 p-4 bg-muted/30 rounded-xl border-2 border-dashed border-muted-foreground/20">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="text-3xl">{nextBadge.icon}</div>
                              <div>
                                <p className="font-semibold text-sm">Next Badge</p>
                                <p className="text-xs text-muted-foreground">{nextBadge.name}</p>
                              </div>
                            </div>
                            <Target className="w-5 h-5 text-primary" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>{profile?.total_points || 0} points</span>
                              <span>{nextBadge.points_required} points</span>
                            </div>
                            <Progress value={progressToNextBadge} className="h-2" />
                            <p className="text-xs text-center text-muted-foreground">
                              {nextBadge.points_required - (profile?.total_points || 0)} points to go!
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Award className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                      <p className="text-muted-foreground text-lg mb-2">No badges earned yet</p>
                      <p className="text-sm text-muted-foreground">Complete exercises to earn your first badge!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {entries.length > 0 && (
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Recent Activity */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card className="glass">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <TrendingUp className="w-6 h-6 text-accent" />
                      Recent Journal Entries
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {entries.slice(0, 5).map((entry, idx) => (
                        <motion.div
                          key={entry.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="flex items-center gap-4 p-4 bg-muted/20 rounded-xl hover:bg-muted/40 transition-colors cursor-pointer"
                        >
                          <div className={`w-12 h-12 rounded-full ${moodColors[entry.mood_label] || 'bg-muted'} flex items-center justify-center flex-shrink-0`}>
                            <span className="text-2xl">
                              {entry.mood_label === 'happy' && '😊'}
                              {entry.mood_label === 'calm' && '😌'}
                              {entry.mood_label === 'anxious' && '😰'}
                              {entry.mood_label === 'sad' && '😢'}
                              {entry.mood_label === 'stressed' && '😓'}
                              {entry.mood_label === 'neutral' && '😐'}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold capitalize mb-1">
                              Felt {entry.mood_label}
                            </p>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {entry.content}
                            </p>
                          </div>
                          <div className="text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(entry.created_at).toLocaleDateString()}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Activity Timeline */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <ActivityTimeline />
              </motion.div>
            </div>
          )}

          {entries.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <ActivityTimeline />
            </motion.div>
          )}
        </div>

        {/* Luna Companion */}
        <LunaCompanion
          emotion={luna.emotion}
          message={luna.message}
          showMessage={luna.showMessage}
          onDismiss={luna.dismiss}
          level={luna.level}
        />
      </div>
    </AuthGate>
  );
};

export default Dashboard;
