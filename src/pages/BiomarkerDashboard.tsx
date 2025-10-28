import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Activity, 
  Droplet, 
  Sun, 
  Zap, 
  Brain, 
  TrendingUp,
  Plus,
  AlertCircle
} from "lucide-react";
import { format, subDays } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface BiomarkerEntry {
  id: string;
  date: string;
  biomarkers: {
    thyroid?: number;
    bloodSugar?: number;
    vitaminD?: number;
    vitaminB12?: number;
    cortisol?: number;
  };
  lifestyle: {
    exercise?: number;
    waterIntake?: number;
    screenTime?: number;
  };
  mood_score?: number;
}

export default function BiomarkerDashboard() {
  const [entries, setEntries] = useState<BiomarkerEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Form state
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [thyroid, setThyroid] = useState("");
  const [bloodSugar, setBloodSugar] = useState("");
  const [vitaminD, setVitaminD] = useState("");
  const [vitaminB12, setVitaminB12] = useState("");
  const [cortisol, setCortisol] = useState("");
  const [exercise, setExercise] = useState("");
  const [waterIntake, setWaterIntake] = useState("");
  const [screenTime, setScreenTime] = useState("");

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setLoading(false);
      return;
    }

    const thirtyDaysAgo = format(subDays(new Date(), 30), "yyyy-MM-dd");

    const { data, error } = await supabase
      .from("wellness_correlations")
      .select("*")
      .gte("date", thirtyDaysAgo)
      .order("date", { ascending: true });

    if (error) {
      toast({
        title: "Error loading data",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setEntries(data as BiomarkerEntry[] || []);
    setLoading(false);
  };

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: "Authentication required",
        variant: "destructive",
      });
      return;
    }

    const biomarkers: any = {};
    const lifestyle: any = {};

    if (thyroid) biomarkers.thyroid = parseFloat(thyroid);
    if (bloodSugar) biomarkers.bloodSugar = parseFloat(bloodSugar);
    if (vitaminD) biomarkers.vitaminD = parseFloat(vitaminD);
    if (vitaminB12) biomarkers.vitaminB12 = parseFloat(vitaminB12);
    if (cortisol) biomarkers.cortisol = parseFloat(cortisol);
    if (exercise) lifestyle.exercise = parseInt(exercise);
    if (waterIntake) lifestyle.waterIntake = parseFloat(waterIntake);
    if (screenTime) lifestyle.screenTime = parseFloat(screenTime);

    const { error } = await supabase.from("wellness_correlations").upsert({
      user_id: user.id,
      date,
      biomarkers,
      lifestyle,
    });

    if (error) {
      toast({
        title: "Error saving data",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Biomarker data saved!",
      description: "Your health metrics have been recorded",
    });

    setShowForm(false);
    resetForm();
    fetchEntries();
  };

  const resetForm = () => {
    setThyroid("");
    setBloodSugar("");
    setVitaminD("");
    setVitaminB12("");
    setCortisol("");
    setExercise("");
    setWaterIntake("");
    setScreenTime("");
    setDate(format(new Date(), "yyyy-MM-dd"));
  };

  const getCorrelationInsights = () => {
    if (entries.length < 3) return [];

    const insights: Array<{ icon: any; message: string; type: "positive" | "warning" }> = [];

    // Calculate averages for entries with vitamin D data
    const vitaminDEntries = entries.filter(e => e.biomarkers?.vitaminD);
    if (vitaminDEntries.length >= 3) {
      const avgVitD = vitaminDEntries.reduce((sum, e) => sum + (e.biomarkers.vitaminD || 0), 0) / vitaminDEntries.length;
      const avgMood = vitaminDEntries.reduce((sum, e) => sum + (e.mood_score || 5), 0) / vitaminDEntries.length;

      if (avgVitD < 30 && avgMood < 6) {
        insights.push({
          icon: Sun,
          message: "Your Vitamin D levels are low and correlate with decreased mood. Consider more sunlight exposure or supplements.",
          type: "warning"
        });
      } else if (avgVitD >= 40 && avgMood >= 7) {
        insights.push({
          icon: Sun,
          message: "Great! Your healthy Vitamin D levels align with improved mood patterns.",
          type: "positive"
        });
      }
    }

    // Sleep and mood correlation (from lifestyle)
    const exerciseEntries = entries.filter(e => e.lifestyle?.exercise);
    if (exerciseEntries.length >= 3) {
      const avgExercise = exerciseEntries.reduce((sum, e) => sum + (e.lifestyle.exercise || 0), 0) / exerciseEntries.length;
      
      if (avgExercise >= 30) {
        insights.push({
          icon: Activity,
          message: `You're averaging ${Math.round(avgExercise)} minutes of daily exercise - excellent for mental wellness!`,
          type: "positive"
        });
      }
    }

    // Cortisol stress patterns
    const cortisolEntries = entries.filter(e => e.biomarkers?.cortisol);
    if (cortisolEntries.length >= 3) {
      const avgCortisol = cortisolEntries.reduce((sum, e) => sum + (e.biomarkers.cortisol || 0), 0) / cortisolEntries.length;
      
      if (avgCortisol > 20) {
        insights.push({
          icon: AlertCircle,
          message: "Elevated cortisol levels detected. Consider stress-reduction exercises and rest.",
          type: "warning"
        });
      }
    }

    return insights;
  };

  const chartData = entries.slice(-14).map(entry => ({
    date: format(new Date(entry.date), "MMM d"),
    vitaminD: entry.biomarkers?.vitaminD || null,
    cortisol: entry.biomarkers?.cortisol || null,
    mood: entry.mood_score || null,
  }));

  const insights = getCorrelationInsights();

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
            Biomarker–Mind Connection
          </h1>
          <p className="text-muted-foreground text-lg">
            Track how your biological health influences your mental wellness
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="glass p-4 hover-lift">
            <div className="flex items-center gap-3">
              <Sun className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Vitamin D</p>
                <p className="text-2xl font-bold">
                  {entries[entries.length - 1]?.biomarkers?.vitaminD || "—"}
                </p>
              </div>
            </div>
          </Card>

          <Card className="glass p-4 hover-lift">
            <div className="flex items-center gap-3">
              <Droplet className="w-8 h-8 text-secondary" />
              <div>
                <p className="text-sm text-muted-foreground">Blood Sugar</p>
                <p className="text-2xl font-bold">
                  {entries[entries.length - 1]?.biomarkers?.bloodSugar || "—"}
                </p>
              </div>
            </div>
          </Card>

          <Card className="glass p-4 hover-lift">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-8 h-8 text-accent" />
              <div>
                <p className="text-sm text-muted-foreground">Cortisol</p>
                <p className="text-2xl font-bold">
                  {entries[entries.length - 1]?.biomarkers?.cortisol || "—"}
                </p>
              </div>
            </div>
          </Card>

          <Card className="glass p-4 hover-lift">
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-support" />
              <div>
                <p className="text-sm text-muted-foreground">Exercise (min)</p>
                <p className="text-2xl font-bold">
                  {entries[entries.length - 1]?.lifestyle?.exercise || "—"}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* AI Insights */}
        {insights.length > 0 && (
          <Card className="glass p-6 bg-gradient-to-br from-primary/10 to-secondary/10">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              AI Correlation Insights
            </h3>
            <div className="space-y-3">
              {insights.map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-start gap-3 p-4 rounded-xl ${
                    insight.type === "positive" ? "bg-green-500/10" : "bg-orange-500/10"
                  }`}
                >
                  <insight.icon className={`w-5 h-5 mt-0.5 ${
                    insight.type === "positive" ? "text-green-500" : "text-orange-500"
                  }`} />
                  <p className="text-sm">{insight.message}</p>
                </motion.div>
              ))}
            </div>
          </Card>
        )}

        {/* Chart */}
        {chartData.length > 0 && (
          <Card className="glass p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Biomarker Trends (Last 14 Days)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }} 
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="vitaminD" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name="Vitamin D"
                />
                <Line 
                  type="monotone" 
                  dataKey="cortisol" 
                  stroke="hsl(var(--accent))" 
                  strokeWidth={2}
                  name="Cortisol"
                />
                <Line 
                  type="monotone" 
                  dataKey="mood" 
                  stroke="hsl(var(--secondary))" 
                  strokeWidth={2}
                  name="Mood Score"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Add Data Button */}
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="w-full" size="lg">
            <Plus className="w-5 h-5 mr-2" />
            Add Biomarker Data
          </Button>
        )}

        {/* Entry Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="glass p-6">
              <h3 className="text-2xl font-semibold mb-6">Log Health Metrics</h3>

              <div className="space-y-6">
                {/* Date */}
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="glass"
                  />
                </div>

                {/* Biomarkers Section */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Biomarkers</h4>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Thyroid (TSH μIU/mL)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={thyroid}
                        onChange={(e) => setThyroid(e.target.value)}
                        placeholder="e.g., 2.5"
                        className="glass"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Blood Sugar (mg/dL)</Label>
                      <Input
                        type="number"
                        value={bloodSugar}
                        onChange={(e) => setBloodSugar(e.target.value)}
                        placeholder="e.g., 95"
                        className="glass"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Vitamin D (ng/mL)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={vitaminD}
                        onChange={(e) => setVitaminD(e.target.value)}
                        placeholder="e.g., 35"
                        className="glass"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Vitamin B12 (pg/mL)</Label>
                      <Input
                        type="number"
                        value={vitaminB12}
                        onChange={(e) => setVitaminB12(e.target.value)}
                        placeholder="e.g., 450"
                        className="glass"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Cortisol (μg/dL)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={cortisol}
                        onChange={(e) => setCortisol(e.target.value)}
                        placeholder="e.g., 15"
                        className="glass"
                      />
                    </div>
                  </div>
                </div>

                {/* Lifestyle Section */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Lifestyle Factors</h4>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Exercise (minutes)</Label>
                      <Input
                        type="number"
                        value={exercise}
                        onChange={(e) => setExercise(e.target.value)}
                        placeholder="e.g., 30"
                        className="glass"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Water Intake (liters)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={waterIntake}
                        onChange={(e) => setWaterIntake(e.target.value)}
                        placeholder="e.g., 2.5"
                        className="glass"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Screen Time (hours)</Label>
                      <Input
                        type="number"
                        step="0.5"
                        value={screenTime}
                        onChange={(e) => setScreenTime(e.target.value)}
                        placeholder="e.g., 4"
                        className="glass"
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button onClick={handleSave} className="flex-1">
                    Save Health Data
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}>
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
