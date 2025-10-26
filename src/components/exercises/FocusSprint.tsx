import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw, Check, X, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface FocusSprintProps {
  onComplete: () => void;
  onExit: () => void;
}

const challenges = [
  {
    type: "memory",
    question: "Remember this sequence:",
    sequence: [3, 7, 2, 9, 1],
    instruction: "Type the sequence when ready",
  },
  {
    type: "math",
    question: "Quick mental math:",
    problem: "17 + 23 - 8 = ?",
    answer: "32",
  },
  {
    type: "pattern",
    question: "What comes next?",
    pattern: "2, 4, 8, 16, __",
    answer: "32",
  },
  {
    type: "word",
    question: "Unscramble:",
    scrambled: "IINATTOMED",
    answer: "MEDITATION",
  },
  {
    type: "count",
    question: "How many 'E's?",
    text: "SERENITY AND PEACE BRING ETERNAL ENERGY",
    answer: "8",
  },
];

export const FocusSprint = ({ onComplete, onExit }: FocusSprintProps) => {
  const [isActive, setIsActive] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [showSequence, setShowSequence] = useState(true);
  const [timer, setTimer] = useState(60);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);

  const challenge = challenges[currentChallenge];

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          handleComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive]);

  useEffect(() => {
    if (challenge?.type === "memory" && showSequence && isActive) {
      setTimeout(() => setShowSequence(false), 3000);
    }
  }, [challenge, showSequence, isActive]);

  const handleStart = () => {
    setIsActive(true);
    setCurrentChallenge(0);
    setScore(0);
    setTimer(60);
    setUserAnswer("");
    setShowSequence(true);
    setFeedback(null);
  };

  const handleSubmit = useCallback(() => {
    if (!challenge) return;

    let isCorrect = false;
    
    if (challenge.type === "memory") {
      isCorrect = userAnswer === challenge.sequence.join("");
    } else if (challenge.answer) {
      isCorrect = userAnswer.toUpperCase() === challenge.answer;
    }

    setFeedback(isCorrect ? "correct" : "incorrect");
    
    if (isCorrect) {
      setScore((prev) => prev + 20);
    }

    setTimeout(() => {
      if (currentChallenge < challenges.length - 1) {
        setCurrentChallenge((prev) => prev + 1);
        setUserAnswer("");
        setShowSequence(true);
        setFeedback(null);
      } else {
        handleComplete();
      }
    }, 1500);
  }, [challenge, userAnswer, currentChallenge]);

  const handleComplete = () => {
    setIsActive(false);
    setTimeout(() => {
      onComplete();
    }, 2000);
  };

  const progress = ((currentChallenge + 1) / challenges.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="max-w-4xl mx-auto"
    >
      <div className="glass rounded-3xl p-12 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Zap className="w-8 h-8 text-accent" />
            <h2 className="text-4xl font-bold bg-gradient-to-r from-accent via-primary to-secondary bg-clip-text text-transparent">
              Focus Sprint
            </h2>
          </div>
          <p className="text-muted-foreground">
            Quick mental challenges to sharpen your focus
          </p>
        </div>

        {!isActive ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            <div className="bg-gradient-to-br from-accent/10 to-primary/10 rounded-2xl p-8 space-y-4 border border-accent/20">
              <h3 className="text-2xl font-bold text-center">Ready to Focus?</h3>
              <p className="text-center text-muted-foreground leading-relaxed">
                Complete 5 quick mental challenges in 60 seconds. Each correct answer earns you 20 points!
              </p>
              <ul className="space-y-2 max-w-md mx-auto text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-accent" />
                  Memory sequences
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-accent" />
                  Quick math
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-accent" />
                  Pattern recognition
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-accent" />
                  Word puzzles
                </li>
              </ul>
            </div>

            <div className="flex gap-3 justify-center flex-wrap">
              <Button size="lg" onClick={handleStart} className="min-w-[200px]">
                <Play className="w-5 h-5 mr-2" />
                Start Sprint
              </Button>

              <Button variant="outline" size="lg" onClick={onExit}>
                <RotateCcw className="w-5 h-5 mr-2" />
                Exit
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Timer and progress */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-3xl font-bold">{timer}s</div>
                <Progress value={(timer / 60) * 100} className="w-32" />
              </div>
              <div className="text-2xl font-bold text-accent">
                {score} pts
              </div>
            </div>

            <Progress value={progress} className="h-3" />
            <p className="text-center text-sm text-muted-foreground">
              Challenge {currentChallenge + 1} of {challenges.length}
            </p>

            {/* Challenge */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentChallenge}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 min-h-[300px] flex flex-col items-center justify-center"
              >
                <h3 className="text-2xl font-bold text-center">
                  {challenge.question}
                </h3>

                {challenge.type === "memory" && showSequence && (
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="flex gap-4"
                  >
                    {challenge.sequence?.map((num, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.2 }}
                        className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center text-3xl font-bold text-white shadow-xl"
                      >
                        {num}
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {challenge.type === "memory" && !showSequence && (
                  <p className="text-lg text-muted-foreground">{challenge.instruction}</p>
                )}

                {challenge.problem && (
                  <div className="text-4xl font-bold text-primary">
                    {challenge.problem}
                  </div>
                )}

                {challenge.pattern && (
                  <div className="text-3xl font-bold">
                    {challenge.pattern}
                  </div>
                )}

                {challenge.scrambled && (
                  <div className="text-4xl font-bold tracking-widest text-primary">
                    {challenge.scrambled}
                  </div>
                )}

                {challenge.text && (
                  <div className="bg-muted/50 rounded-xl p-6 text-xl font-mono text-center max-w-2xl">
                    {challenge.text}
                  </div>
                )}

                {(!showSequence || challenge.type !== "memory") && (
                  <div className="space-y-4 w-full max-w-md">
                    <input
                      type="text"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
                      placeholder="Your answer..."
                      className="w-full px-6 py-4 text-2xl text-center rounded-xl glass border-2 border-primary/30 focus:border-primary outline-none"
                      autoFocus
                      disabled={feedback !== null}
                    />
                    
                    <Button
                      size="lg"
                      onClick={handleSubmit}
                      disabled={!userAnswer || feedback !== null}
                      className="w-full text-lg py-6"
                    >
                      {feedback === null ? (
                        <>
                          <Check className="w-5 h-5 mr-2" />
                          Submit Answer
                        </>
                      ) : feedback === "correct" ? (
                        <>
                          <Check className="w-5 h-5 mr-2" />
                          Correct! +20 pts
                        </>
                      ) : (
                        <>
                          <X className="w-5 h-5 mr-2" />
                          Try again next time
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}

        {!isActive && score > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-4 py-8"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5 }}
              className="text-6xl"
            >
              🎯
            </motion.div>
            <h3 className="text-3xl font-bold">Focus Sprint Complete!</h3>
            <p className="text-2xl text-accent font-bold">Final Score: {score} points</p>
            <p className="text-muted-foreground">
              Great work! Your focus is sharp today.
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
