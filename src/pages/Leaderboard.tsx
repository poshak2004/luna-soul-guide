import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, Award, Sparkles, Crown, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { supabase } from "@/integrations/supabase/client";
import { useGamification } from "@/hooks/useGamification";
import { Logo } from "@/components/Logo";
import { LunaCompanion } from "@/components/luna/LunaCompanion";
import { useLuna } from "@/hooks/useLuna";

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const { profile, userBadges, badges } = useGamification();
  const luna = useLuna('leaderboard');

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    // Use secure server-side function
    const { data, error } = await supabase.rpc('get_leaderboard');

    if (error) {
      console.error('Error fetching leaderboard:', error);
      return;
    }

    setLeaderboard(data || []);
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return (
          <motion.div
            animate={{ rotate: [0, -5, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Crown className="w-8 h-8 text-yellow-500" />
          </motion.div>
        );
      case 1:
        return <Medal className="w-7 h-7 text-gray-400" />;
      case 2:
        return <Medal className="w-7 h-7 text-amber-700" />;
      default:
        return (
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <span className="text-sm font-bold text-muted-foreground">#{index + 1}</span>
          </div>
        );
    }
  };

  const getRankBg = (index: number) => {
    switch (index) {
      case 0:
        return "bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border-yellow-500/30";
      case 1:
        return "bg-gradient-to-br from-gray-400/20 to-gray-500/10 border-gray-400/30";
      case 2:
        return "bg-gradient-to-br from-amber-700/20 to-amber-800/10 border-amber-700/30";
      default:
        return "bg-muted/50";
    }
  };

  return (
    <AuthGate>
      <div className="min-h-screen pt-16 bg-gradient-calm">
        <LunaCompanion {...luna} />
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Trophy className="w-12 h-12 text-primary" />
              <h1 className="font-display text-4xl font-bold">Leaderboard</h1>
            </div>
            <p className="text-lg text-muted-foreground">
              See how you rank among fellow wellness warriors
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Leaderboard */}
            <div className="lg:col-span-2">
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Top Wellness Warriors
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {leaderboard.length === 0 ? (
                    <div className="text-center py-12">
                      <Trophy className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                      <p className="text-muted-foreground">No rankings yet</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Start earning points to appear on the leaderboard!
                      </p>
                    </div>
                  ) : (
                    leaderboard.map((user, index) => (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.08 }}
                        whileHover={{ scale: 1.02, x: 4 }}
                        className={`flex items-center gap-4 p-4 rounded-xl transition-all border ${
                          user.user_id === profile?.user_id
                            ? "bg-primary/20 border-primary shadow-lg shadow-primary/20"
                            : `${getRankBg(index)} hover:shadow-md ${index < 3 ? 'border' : 'border-transparent'}`
                        }`}
                      >
                        <div className="w-12 flex items-center justify-center flex-shrink-0">
                          {getRankIcon(index)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-bold text-base">{user.anonymous_username}</p>
                            {user.user_id === profile?.user_id && (
                              <Badge variant="default" className="text-xs animate-pulse">You</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              {user.current_streak} day streak
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-3xl font-bold ${index < 3 ? 'text-primary' : 'text-foreground'}`}>
                            {user.total_points}
                          </p>
                          <p className="text-xs text-muted-foreground">points</p>
                        </div>
                      </motion.div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Your Stats */}
            <div className="space-y-6">
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Logo size="sm" />
                    Your Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-4 bg-primary/10 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Username</p>
                    <p className="text-xl font-bold">{profile?.anonymous_username}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold text-primary">{profile?.total_points || 0}</p>
                      <p className="text-xs text-muted-foreground">Points</p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold text-secondary">{profile?.current_streak || 0}</p>
                      <p className="text-xs text-muted-foreground">Day Streak</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-accent" />
                    Your Badges
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {userBadges.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                      {userBadges.map((userBadge, index) => {
                        const badge = badges.find(b => b.id === userBadge.badge_id);
                        if (!badge) return null;
                        
                        return (
                          <motion.div
                            key={userBadge.id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            className="text-center p-4 bg-gradient-to-br from-accent/10 to-support/10 rounded-xl hover:shadow-lg transition-all cursor-pointer group"
                            title={badge.description || badge.name}
                          >
                            <div className="text-4xl mb-2 group-hover:scale-125 transition-transform">
                              {badge.icon}
                            </div>
                            <p className="text-xs font-semibold line-clamp-2">{badge.name}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(userBadge.earned_at).toLocaleDateString()}
                            </p>
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Award className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground mb-1">No badges yet</p>
                      <p className="text-xs text-muted-foreground">
                        Complete activities to earn badges!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AuthGate>
  );
};

export default Leaderboard;
