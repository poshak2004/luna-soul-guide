import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Heart, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

const Onboarding = () => {
  const [step, setStep] = useState(0);
  const [responses, setResponses] = useState<string[]>(["", "", ""]);
  const navigate = useNavigate();

  const questions = [
    {
      title: "How are you feeling today?",
      placeholder: "Take a moment... there's no right or wrong answer.",
      subtitle: "Let's start with what's present for you right now."
    },
    {
      title: "What's on your mind lately?",
      placeholder: "Anything you've been thinking about or dealing with...",
      subtitle: "Sometimes naming what's weighing on us helps lighten the load."
    },
    {
      title: "How can I support you?",
      placeholder: "What would make this space most helpful for you?",
      subtitle: "This is your journey, and I'm here to walk alongside you."
    }
  ];

  const handleNext = () => {
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      navigate("/chat");
    }
  };

  const handleResponse = (value: string) => {
    const newResponses = [...responses];
    newResponses[step] = value;
    setResponses(newResponses);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero pt-16">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto"
        >
          {/* Progress */}
          <div className="mb-8">
            <div className="flex gap-2 justify-center mb-2">
              {questions.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all duration-500 ${
                    index <= step ? "bg-primary w-16" : "bg-primary/20 w-8"
                  }`}
                />
              ))}
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Step {step + 1} of {questions.length}
            </p>
          </div>

          <Card className="glass p-8 md:p-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
              >
                {/* Icon */}
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <Heart className="w-16 h-16 text-primary fill-primary glow" />
                    <Sparkles className="w-6 h-6 text-accent absolute -top-1 -right-1 animate-pulse-gentle" />
                  </div>
                </div>

                {/* Question */}
                <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-3">
                  {questions[step].title}
                </h2>
                <p className="text-center text-muted-foreground mb-8">
                  {questions[step].subtitle}
                </p>

                {/* Input */}
                <Textarea
                  placeholder={questions[step].placeholder}
                  value={responses[step]}
                  onChange={(e) => handleResponse(e.target.value)}
                  className="min-h-[200px] text-lg resize-none bg-background/50 border-border/50 focus:border-primary"
                />

                {/* Actions */}
                <div className="flex gap-4 mt-8">
                  {step > 0 && (
                    <Button
                      variant="outline"
                      onClick={() => setStep(step - 1)}
                      className="flex-1"
                    >
                      Back
                    </Button>
                  )}
                  <Button
                    onClick={handleNext}
                    disabled={!responses[step].trim()}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {step === questions.length - 1 ? "Start Journey" : "Continue"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>

                {/* Skip */}
                <button
                  onClick={() => navigate("/chat")}
                  className="w-full text-sm text-muted-foreground hover:text-foreground mt-4 transition-colors"
                >
                  Skip for now
                </button>
              </motion.div>
            </AnimatePresence>
          </Card>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-sm text-muted-foreground mt-6"
          >
            Your responses are private and help Luna understand how to support you better
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};

export default Onboarding;
