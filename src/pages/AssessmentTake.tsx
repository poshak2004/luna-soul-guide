import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";

export default function AssessmentTake() {
  const { type } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [assessment, setAssessment] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAssessment();
  }, [type]);

  const fetchAssessment = async () => {
    const { data, error } = await supabase
      .from("assessments")
      .select("*")
      .eq("type", type?.toUpperCase())
      .single();

    if (error || !data) {
      toast({
        title: "Assessment not found",
        variant: "destructive",
      });
      navigate("/assessments");
      return;
    }

    setAssessment(data);
    const questions = data.questions as any[];
    setResponses(new Array(questions.length).fill(-1));
    setLoading(false);
  };

  const handleResponse = (value: number) => {
    const newResponses = [...responses];
    newResponses[currentQuestion] = value;
    setResponses(newResponses);
  };

  const calculateScore = () => {
    if (assessment.type === "DASS-21") {
      // DASS-21 has subscales
      const questions = assessment.questions;
      const subscales = { depression: 0, anxiety: 0, stress: 0 };

      responses.forEach((response, index) => {
        const subscale = questions[index].subscale;
        subscales[subscale as keyof typeof subscales] += response;
      });

      // Multiply by 2 for DASS-21
      const scoringRules = assessment.scoring_rules;
      const finalScores = {
        depression: subscales.depression * scoringRules.subscales.depression.multiplier,
        anxiety: subscales.anxiety * scoringRules.subscales.anxiety.multiplier,
        stress: subscales.stress * scoringRules.subscales.stress.multiplier,
      };

      // Determine severity levels
      const levels: any = {};
      Object.entries(finalScores).forEach(([key, score]) => {
        const ranges = scoringRules.subscales[key].ranges;
        const range = ranges.find((r: any) => score >= r.min && score <= r.max);
        levels[key] = range?.level || "Unknown";
      });

      return {
        total: finalScores.depression + finalScores.anxiety + finalScores.stress,
        subscales: finalScores,
        levels,
        interpretation: `Depression: ${levels.depression}, Anxiety: ${levels.anxiety}, Stress: ${levels.stress}`,
      };
    } else {
      // GAD-7 and PHQ-9
      const total = responses.reduce((sum, val) => sum + val, 0);
      const ranges = assessment.scoring_rules.ranges;
      const range = ranges.find((r: any) => total >= r.min && total <= r.max);

      return {
        total,
        level: range?.level || "Unknown",
        interpretation: range?.interpretation || "",
      };
    }
  };

  const handleSubmit = async () => {
    if (responses.some((r) => r === -1)) {
      toast({
        title: "Please answer all questions",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    const score = calculateScore();

    const { data, error } = await supabase
      .from("assessment_results")
      .insert({
        assessment_type: assessment.type,
        responses: responses as any,
        total_score: score.total,
        severity_level: score.level || JSON.stringify(score.levels),
        interpretation: score.interpretation,
      })
      .select()
      .single();

    setSubmitting(false);

    if (error) {
      toast({
        title: "Error saving results",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Assessment completed!",
      description: "Your results have been saved",
    });

    navigate(`/assessments/results/${data.id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const progress = ((currentQuestion + 1) / assessment.questions.length) * 100;
  const question = assessment.questions[currentQuestion];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="space-y-2">
          <Button variant="ghost" onClick={() => navigate("/assessments")} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Assessments
          </Button>
          <h1 className="text-3xl font-bold">{assessment.name}</h1>
          <p className="text-muted-foreground">
            Over the last 2 weeks, how often have you been bothered by the following?
          </p>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>
              Question {currentQuestion + 1} of {assessment.questions.length}
            </span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="glass p-8">
              <h2 className="text-2xl font-semibold mb-6">{question.text}</h2>

              <div className="space-y-3">
                {assessment.scoring_rules.scale.map((option: string, index: number) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleResponse(assessment.scoring_rules.points[index])}
                    className={`w-full p-4 rounded-xl text-left transition-all ${
                      responses[currentQuestion] === assessment.scoring_rules.points[index]
                        ? "bg-primary text-primary-foreground"
                        : "glass hover:bg-primary/10"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option}</span>
                      {responses[currentQuestion] === assessment.scoring_rules.points[index] && (
                        <CheckCircle2 className="w-5 h-5" />
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {currentQuestion < assessment.questions.length - 1 ? (
            <Button
              onClick={() => setCurrentQuestion(currentQuestion + 1)}
              disabled={responses[currentQuestion] === -1}
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={responses.some((r) => r === -1) || submitting}
            >
              {submitting ? "Submitting..." : "Submit Assessment"}
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
