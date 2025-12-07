import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ClipboardList, TrendingUp, Brain, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLuna } from "@/hooks/useLuna";
import { LunaCompanion } from "@/components/luna/LunaCompanion";

export default function Assessments() {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [recentResults, setRecentResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const luna = useLuna('assessments');

  useEffect(() => {
    fetchAssessments();
    fetchRecentResults();
  }, []);

  const fetchAssessments = async () => {
    const { data, error } = await supabase
      .from("assessments")
      .select("*")
      .order("type");

    if (error) {
      toast({
        title: "Error loading assessments",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setAssessments(data || []);
    setLoading(false);
  };

  const fetchRecentResults = async () => {
    const { data, error } = await supabase
      .from("assessment_results")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) {
      console.error("Error fetching results:", error);
      return;
    }

    setRecentResults(data || []);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "GAD-7":
        return <Brain className="w-8 h-8" />;
      case "PHQ-9":
        return <Heart className="w-8 h-8" />;
      case "DASS-21":
        return <TrendingUp className="w-8 h-8" />;
      default:
        return <ClipboardList className="w-8 h-8" />;
    }
  };

  const getGradient = (type: string) => {
    switch (type) {
      case "GAD-7":
        return "from-accent/20 to-primary/20";
      case "PHQ-9":
        return "from-secondary/20 to-accent/20";
      case "DASS-21":
        return "from-primary/20 to-support/20";
      default:
        return "from-primary/20 to-secondary/20";
    }
  };

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
            Clinical Assessments
          </h1>
          <p className="text-muted-foreground text-lg">
            Science-backed tools to understand your mental wellness
          </p>
        </div>

        {/* Available Assessments */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Available Assessments</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {assessments.map((assessment, index) => (
              <motion.div
                key={assessment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={`glass hover-lift p-6 cursor-pointer bg-gradient-to-br ${getGradient(
                    assessment.type
                  )} border-primary/20`}
                  onClick={() => navigate(`/assessments/${assessment.type.toLowerCase()}`)}
                >
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="text-primary">{getIcon(assessment.type)}</div>
                      <div>
                        <h3 className="font-semibold text-lg">{assessment.type}</h3>
                        <p className="text-sm text-muted-foreground">
                          {assessment.questions.length} questions
                        </p>
                      </div>
                    </div>
                    <p className="text-sm">{assessment.description}</p>
                    <Button className="w-full" variant="secondary">
                      Start Assessment
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent Results */}
        {recentResults.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Recent Results</h2>
              <Button variant="outline" onClick={() => navigate("/assessments/history")}>
                View All
              </Button>
            </div>
            <div className="space-y-3">
              {recentResults.map((result) => (
                <Card key={result.id} className="glass p-4 hover-lift cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{result.assessment_type}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(result.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{result.total_score}</p>
                      <p className="text-sm text-muted-foreground">{result.severity_level}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

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
