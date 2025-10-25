import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, Award, Sparkles, Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AuthGate } from "@/components/AuthGate";
import { supabase } from "@/integrations/supabase/client";
import { useGamification } from "@/hooks/useGamification";
import { Logo } from "@/components/Logo";

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const { profile, userBadges } = useGamification();

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
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 1:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-amber-700" />;
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>;
    }
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
                  {leaderboard.map((user, index) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
                        user.user_id === profile?.user_id
                          ? "bg-primary/20 border-2 border-primary"
                          : "bg-muted/50 hover:bg-muted"
                      }`}
                    >
                      <div className="w-12 flex items-center justify-center">
                        {getRankIcon(index)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{user.anonymous_username}</p>
                          {user.user_id === profile?.user_id && (
                            <Badge variant="secondary" className="text-xs">You</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {user.current_streak} day streak
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">{user.total_points}</p>
                        <p className="text-xs text-muted-foreground">points</p>
                      </div>
                    </motion.div>
                  ))}
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
                    <div className="grid grid-cols-2 gap-3">
                      {userBadges.map((userBadge) => (
                        <div
                          key={userBadge.id}
                          className="text-center p-3 bg-accent/10 rounded-lg hover:bg-accent/20 transition-colors"
                        >
                          <div className="text-3xl mb-2">
                            {userBadge.badges.icon === "star" && "⭐"}
                            {userBadge.badges.icon === "brain" && "🧠"}
                            {userBadge.badges.icon === "wind" && "💨"}
                            {userBadge.badges.icon === "flame" && "🔥"}
                            {userBadge.badges.icon === "shield" && "🛡️"}
                            {userBadge.badges.icon === "sparkles" && "✨"}
                          </div>
                          <p className="text-xs font-semibold">{userBadge.badges.name}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-sm text-muted-foreground py-4">
                      Complete activities to earn badges!
                    </p>
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
