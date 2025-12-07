import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLuna } from "@/hooks/useLuna";
import { LunaCompanion } from "@/components/luna/LunaCompanion";
import { Calendar as CalendarIcon, Plus, TrendingUp } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, subMonths } from "date-fns";

const moodEmojis: Record<string, string> = {
  "Extremely Happy": "😄",
  "Very Happy": "😊",
  "Happy": "🙂",
  "Okay": "😐",
  "Slightly Sad": "😕",
  "Sad": "😢",
  "Very Sad": "😞",
  "Anxious": "😰",
  "Stressed": "😤",
  "Calm": "😌",
};

export default function MoodCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [moodEntries, setMoodEntries] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEntry, setShowEntry] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const luna = useLuna('moodCalendar');

  // Form state
  const [moodScore, setMoodScore] = useState(5);
  const [moodLabel, setMoodLabel] = useState("Okay");
  const [energyLevel, setEnergyLevel] = useState(5);
  const [sleepHours, setSleepHours] = useState(7);
  const [stressLevel, setStressLevel] = useState(5);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchMoodEntries();
  }, [currentDate]);

  const fetchMoodEntries = async () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);

    const { data, error } = await supabase
      .from("mood_calendar")
      .select("*")
      .gte("date", format(start, "yyyy-MM-dd"))
      .lte("date", format(end, "yyyy-MM-dd"));

    if (error) {
      toast({
        title: "Error loading mood data",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setMoodEntries(data || []);
    setLoading(false);
  };

  const handleSaveMood = async () => {
    if (!selectedDate) return;

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: "Authentication required",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.from("mood_calendar").upsert({
      user_id: user.id,
      date: format(selectedDate, "yyyy-MM-dd"),
      mood_score: moodScore,
      mood_label: moodLabel,
      energy_level: energyLevel,
      sleep_hours: sleepHours,
      stress_level: stressLevel,
      notes: notes,
    } as any);

    if (error) {
      toast({
        title: "Error saving mood",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Mood saved!",
      description: "Your daily mood entry has been recorded",
    });

    setShowEntry(false);
    fetchMoodEntries();
  };

  const getMoodForDate = (date: Date) => {
    return moodEntries.find((entry) => isSameDay(new Date(entry.date), date));
  };

  const getMoodColor = (score: number) => {
    if (score >= 8) return "bg-green-500";
    if (score >= 6) return "bg-yellow-500";
    if (score >= 4) return "bg-orange-500";
    return "bg-red-500";
  };

  const days = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  const getMoodEmoji = (label: string) => moodEmojis[label] || "😐";

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Mood Calendar
          </h1>
          <p className="text-muted-foreground text-lg">
            Track your daily emotional patterns and discover insights
          </p>
        </div>

        {/* Month Navigation */}
        <Card className="glass p-6">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="outline"
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            >
              Previous Month
            </Button>
            <h2 className="text-2xl font-semibold">{format(currentDate, "MMMM yyyy")}</h2>
            <Button
              variant="outline"
              onClick={() =>
                setCurrentDate((prev) => {
                  const next = new Date(prev);
                  next.setMonth(prev.getMonth() + 1);
                  return next;
                })
              }
            >
              Next Month
            </Button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center font-semibold text-sm py-2">
                {day}
              </div>
            ))}

            {days.map((day, index) => {
              const mood = getMoodForDate(day);
              const isToday = isSameDay(day, new Date());

              return (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSelectedDate(day);
                    setShowEntry(true);
                    if (mood) {
                      setMoodScore(mood.mood_score);
                      setMoodLabel(mood.mood_label);
                      setEnergyLevel(mood.energy_level || 5);
                      setSleepHours(mood.sleep_hours || 7);
                      setStressLevel(mood.stress_level || 5);
                      setNotes(mood.notes || "");
                    } else {
                      setMoodScore(5);
                      setMoodLabel("Okay");
                      setEnergyLevel(5);
                      setSleepHours(7);
                      setStressLevel(5);
                      setNotes("");
                    }
                  }}
                  className={`glass aspect-square rounded-xl p-2 flex flex-col items-center justify-center transition-all ${
                    isToday ? "ring-2 ring-primary" : ""
                  } ${mood ? "hover:shadow-lg" : ""}`}
                >
                  <span className="text-sm font-medium">{format(day, "d")}</span>
                  {mood && (
                    <>
                      <span className="text-2xl">{getMoodEmoji(mood.mood_label)}</span>
                      <div
                        className={`w-2 h-2 rounded-full mt-1 ${getMoodColor(mood.mood_score)}`}
                      />
                    </>
                  )}
                </motion.button>
              );
            })}
          </div>
        </Card>

        {/* Mood Entry Form */}
        {showEntry && selectedDate && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="glass p-6">
              <h3 className="text-2xl font-semibold mb-6">
                {format(selectedDate, "MMMM d, yyyy")}
              </h3>

              <div className="space-y-6">
                {/* Mood Score */}
                <div className="space-y-2">
                  <Label>How are you feeling? ({moodScore}/10)</Label>
                  <Input
                    type="range"
                    min="1"
                    max="10"
                    value={moodScore}
                    onChange={(e) => setMoodScore(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Very Sad</span>
                    <span>Neutral</span>
                    <span>Very Happy</span>
                  </div>
                </div>

                {/* Mood Label */}
                <div className="space-y-2">
                  <Label>Mood Description</Label>
                  <select
                    value={moodLabel}
                    onChange={(e) => setMoodLabel(e.target.value)}
                    className="w-full glass rounded-lg p-2"
                  >
                    {Object.keys(moodEmojis).map((mood) => (
                      <option key={mood} value={mood}>
                        {moodEmojis[mood]} {mood}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Energy Level */}
                <div className="space-y-2">
                  <Label>Energy Level ({energyLevel}/10)</Label>
                  <Input
                    type="range"
                    min="1"
                    max="10"
                    value={energyLevel}
                    onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                {/* Sleep Hours */}
                <div className="space-y-2">
                  <Label>Sleep Hours</Label>
                  <Input
                    type="number"
                    step="0.5"
                    value={sleepHours}
                    onChange={(e) => setSleepHours(parseFloat(e.target.value))}
                    className="glass"
                  />
                </div>

                {/* Stress Level */}
                <div className="space-y-2">
                  <Label>Stress Level ({stressLevel}/10)</Label>
                  <Input
                    type="range"
                    min="1"
                    max="10"
                    value={stressLevel}
                    onChange={(e) => setStressLevel(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label>Notes (Optional)</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any thoughts or observations about your day..."
                    className="glass"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button onClick={handleSaveMood} className="flex-1">
                    Save Mood Entry
                  </Button>
                  <Button variant="outline" onClick={() => setShowEntry(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Insights */}
        <Card className="glass p-6 bg-gradient-to-br from-primary/10 to-secondary/10">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Monthly Insights
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">
                {moodEntries.length > 0
                  ? (
                      moodEntries.reduce((sum, e) => sum + e.mood_score, 0) / moodEntries.length
                    ).toFixed(1)
                  : "—"}
              </p>
              <p className="text-sm text-muted-foreground">Average Mood</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{moodEntries.length}</p>
              <p className="text-sm text-muted-foreground">Days Tracked</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">
                {moodEntries.length > 0
                  ? (
                      moodEntries.reduce((sum, e) => sum + (e.sleep_hours || 0), 0) /
                      moodEntries.filter((e) => e.sleep_hours).length
                    ).toFixed(1)
                  : "—"}
              </p>
              <p className="text-sm text-muted-foreground">Avg Sleep Hours</p>
            </div>
          </div>
        </Card>

        {/* Luna Companion */}
        <LunaCompanion
          emotion={luna.emotion}
          message={luna.message}
          showMessage={luna.showMessage}
          onDismiss={luna.dismiss}
          level={luna.level}
        />
      </motion.div>
    </div>
  );
}
