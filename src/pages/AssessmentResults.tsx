import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, AlertCircle, CheckCircle, Info, TrendingUp } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AssessmentResults() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResult();
  }, [id]);

  const fetchResult = async () => {
    const { data, error } = await supabase
      .from("assessment_results")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      toast({
        title: "Result not found",
        variant: "destructive",
      });
      navigate("/assessments");
      return;
    }

    setResult(data);
    setLoading(false);
  };

  const getSeverityColor = (level: string) => {
    const lowerLevel = level.toLowerCase();
    if (lowerLevel.includes("minimal") || lowerLevel.includes("normal")) return "text-green-500";
    if (lowerLevel.includes("mild")) return "text-yellow-500";
    if (lowerLevel.includes("moderate")) return "text-orange-500";
    if (lowerLevel.includes("severe")) return "text-red-500";
    return "text-primary";
  };

  const getSeverityIcon = (level: string) => {
    const lowerLevel = level.toLowerCase();
    if (lowerLevel.includes("minimal") || lowerLevel.includes("normal"))
      return <CheckCircle className="w-6 h-6 text-green-500" />;
    if (lowerLevel.includes("mild")) return <Info className="w-6 h-6 text-yellow-500" />;
    if (lowerLevel.includes("severe"))
      return <AlertCircle className="w-6 h-6 text-red-500" />;
    return <TrendingUp className="w-6 h-6 text-orange-500" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const isDASS21 = result.assessment_type === "DASS-21";

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="space-y-2">
          <Button variant="ghost" onClick={() => navigate("/assessments")} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Assessments
          </Button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Your Results
          </h1>
          <p className="text-muted-foreground">
            {result.assessment_type} · {new Date(result.created_at).toLocaleDateString()}
          </p>
        </div>

        {/* Score Card */}
        <Card className="glass p-8 bg-gradient-to-br from-primary/10 to-secondary/10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                {isDASS21 ? "Overall Assessment" : "Your Score"}
              </h2>
              <p className="text-4xl font-bold text-primary">{result.total_score}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              {getSeverityIcon(result.severity_level)}
              <p className={`text-xl font-semibold ${getSeverityColor(result.severity_level)}`}>
                {result.severity_level}
              </p>
            </div>
          </div>

          {isDASS21 && (
            <div className="grid md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
              {result.interpretation.split(",").map((item: string, index: number) => {
                const [subscale, level] = item.split(":").map((s: string) => s.trim());
                return (
                  <div key={index} className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">{subscale}</p>
                    <p className={`font-semibold ${getSeverityColor(level)}`}>{level}</p>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Interpretation */}
        <Card className="glass p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Info className="w-5 h-5 text-primary" />
            What This Means
          </h3>
          <p className="leading-relaxed">{result.interpretation}</p>
        </Card>

        {/* Recommendations */}
        <Card className="glass p-6 bg-gradient-to-br from-accent/10 to-support/10">
          <h3 className="text-xl font-semibold mb-4">Recommended Next Steps</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <span>Continue with daily mindfulness exercises and mood tracking</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <span>Explore our guided breathing and reflection exercises</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <span>Retake this assessment in 2 weeks to track your progress</span>
            </li>
            {result.severity_level.toLowerCase().includes("severe") && (
              <li className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <span className="font-semibold">
                  Consider speaking with a mental health professional for personalized support
                </span>
              </li>
            )}
          </ul>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 flex-wrap">
          <Button onClick={() => navigate("/exercises")} size="lg">
            Explore Exercises
          </Button>
          <Button onClick={() => navigate("/mood-calendar")} variant="secondary" size="lg">
            View Mood Calendar
          </Button>
          <Button onClick={() => navigate("/assessments")} variant="outline" size="lg">
            Take Another Assessment
          </Button>
        </div>

        {/* Crisis Alert */}
        {result.severity_level.toLowerCase().includes("severe") && (
          <Alert className="border-red-500 bg-red-500/10">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-500">
              If you're in crisis or having thoughts of self-harm, please reach out for immediate
              help. Call 988 (Suicide & Crisis Lifeline) or visit your nearest emergency room.
            </AlertDescription>
          </Alert>
        )}
      </motion.div>
    </div>
  );
}
