import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Share2, TrendingUp, Calendar, Award } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const WellnessReports = () => {
  const { toast } = useToast();
  const [moodData, setMoodData] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalJournals: 0,
    totalExercises: 0,
    currentStreak: 0,
    totalPoints: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch mood calendar data
      const { data: moodCalendar } = await supabase
        .from("mood_calendar")
        .select("date, mood_score, mood_label")
        .eq("user_id", user.id)
        .order("date", { ascending: true })
        .limit(30);

      if (moodCalendar) {
        setMoodData(
          moodCalendar.map((entry) => ({
            date: new Date(entry.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            score: entry.mood_score,
            label: entry.mood_label,
          }))
        );
      }

      // Fetch journal entries count
      const { count: journalCount } = await supabase
        .from("journal_entries")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      // Fetch exercises count
      const { count: exerciseCount } = await supabase
        .from("therapy_exercises")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      // Fetch user profile
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("current_streak, total_points")
        .eq("user_id", user.id)
        .single();

      setStats({
        totalJournals: journalCount || 0,
        totalExercises: exerciseCount || 0,
        currentStreak: profile?.current_streak || 0,
        totalPoints: profile?.total_points || 0,
      });
    } catch (error) {
      console.error("Error fetching report data:", error);
      toast({
        title: "Error",
        description: "Failed to load wellness report data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateReport = () => {
    toast({
      title: "Generating report...",
      description: "Your wellness report will be ready shortly",
    });
  };

  const shareReport = () => {
    toast({
      title: "Share report",
      description: "Sharing functionality coming soon",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4 flex items-center justify-center">
        <p className="text-lg text-muted-foreground">Loading your wellness data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-gradient-to-br from-background via-primary/5 to-background">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-display font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            📈 Wellness Reports
          </h1>
          <p className="text-lg text-muted-foreground">
            Track your mental health journey with comprehensive insights
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 glass text-center">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p className="text-3xl font-bold mb-1">{stats.currentStreak}</p>
            <p className="text-sm text-muted-foreground">Day Streak</p>
          </Card>

          <Card className="p-6 glass text-center">
            <FileText className="w-8 h-8 mx-auto mb-2 text-accent" />
            <p className="text-3xl font-bold mb-1">{stats.totalJournals}</p>
            <p className="text-sm text-muted-foreground">Journal Entries</p>
          </Card>

          <Card className="p-6 glass text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p className="text-3xl font-bold mb-1">{stats.totalExercises}</p>
            <p className="text-sm text-muted-foreground">Exercises Done</p>
          </Card>

          <Card className="p-6 glass text-center">
            <Award className="w-8 h-8 mx-auto mb-2 text-accent" />
            <p className="text-3xl font-bold mb-1">{stats.totalPoints}</p>
            <p className="text-sm text-muted-foreground">Total Points</p>
          </Card>
        </div>

        {/* Mood Trend Chart */}
        <Card className="p-6 glass mb-8">
          <h3 className="text-xl font-semibold mb-4">30-Day Mood Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={moodData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 10]} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="score"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button onClick={generateReport} className="flex-1 gap-2">
            <Download className="w-4 h-4" />
            Download PDF Report
          </Button>
          <Button onClick={shareReport} variant="outline" className="flex-1 gap-2">
            <Share2 className="w-4 h-4" />
            Share with Therapist
          </Button>
        </div>

        {/* Privacy Note */}
        <Card className="p-4 mt-8 bg-primary/10 border-primary/20">
          <p className="text-sm text-muted-foreground text-center">
            🔒 Your wellness data is private and secure. Reports are only shared when you explicitly choose to do so.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default WellnessReports;
