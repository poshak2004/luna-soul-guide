import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Mic, MicOff, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useChat } from "@/hooks/useChat";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { AuthGate } from "@/components/AuthGate";
import { Logo } from "@/components/Logo";
import { useToast } from "@/hooks/use-toast";
import { SuggestionButtons } from "@/components/chat/SuggestionButtons";
import { EmotionIndicator } from "@/components/chat/EmotionIndicator";
import { MicroIntervention } from "@/components/chat/MicroIntervention";
import { supabase } from "@/integrations/supabase/client";

const Chat = () => {
  const { messages, sendMessage, isLoading } = useChat();
  const [input, setInput] = useState("");
  const [detectedEmotion, setDetectedEmotion] = useState<{ emotion: string; intensity: string } | null>(null);
  const [intervention, setIntervention] = useState<'breathing' | 'grounding' | 'affirmation' | null>(null);
  const [showCrisisAlert, setShowCrisisAlert] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const { isListening, isSupported, toggleListening } = useVoiceInput({
    onTranscript: (text) => {
      setInput((prev) => prev + " " + text);
    },
    continuous: false,
  });

  // Analyze emotion after user sends a message
  const analyzeEmotion = async (text: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase.functions.invoke('analyze-mood', {
        body: { message: text },
      });

      if (error) throw error;

      if (data?.emotion) {
        setDetectedEmotion({ emotion: data.emotion, intensity: data.intensity || 'mild' });
        
        // Auto-suggest intervention based on emotion
        if (data.intensity === 'severe' || data.intensity === 'moderate') {
          if (data.emotion === 'anxious') {
            setIntervention('breathing');
          } else if (data.emotion === 'angry') {
            setIntervention('grounding');
          } else if (data.emotion === 'sad' || data.emotion === 'numb') {
            setIntervention('affirmation');
          }
        }

        // Check for crisis language
        if (data.crisis) {
          setShowCrisisAlert(true);
        }
      }
    } catch (error) {
      console.error('Emotion analysis error:', error);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    const messageText = input;
    sendMessage(messageText);
    setInput("");
    analyzeEmotion(messageText);
  };

  const handleVoiceClick = () => {
    if (!isSupported) {
      toast({
        title: "Not Supported",
        description: "Voice input is not supported in your browser.",
        variant: "destructive",
      });
      return;
    }
    toggleListening();
  };

  return (
    <AuthGate>
    <div className="min-h-screen pt-16 bg-gradient-calm">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Crisis Alert */}
        {showCrisisAlert && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 rounded-lg bg-destructive/10 border border-destructive/30"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-destructive">Need immediate support?</p>
                <p className="text-sm text-muted-foreground mt-1">
                  If you're in crisis, please reach out: National Suicide Prevention Lifeline: 988 | Crisis Text Line: Text HOME to 741741
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => setShowCrisisAlert(false)}
                >
                  I'm okay, dismiss
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <Logo size="lg" />
            <h1 className="font-display text-3xl font-bold">Chat with Luna</h1>
            {detectedEmotion && (
              <EmotionIndicator 
                emotion={detectedEmotion.emotion} 
                intensity={detectedEmotion.intensity} 
              />
            )}
          </div>
          <p className="text-muted-foreground">Your safe space for honest conversation</p>
        </motion.div>

        {/* Chat Container */}
        <Card className="glass h-[600px] flex flex-col overflow-hidden">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-8 space-y-4">
                <div className="mb-4">
                  <Logo size="lg" />
                  <p className="text-muted-foreground mt-2">Hi there! 🌸 How can I support you today?</p>
                </div>
                <SuggestionButtons 
                  onSelectSuggestion={(text) => {
                    setInput(text);
                    setTimeout(() => handleSend(), 100);
                  }}
                  disabled={isLoading}
                />
              </div>
            )}
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`rounded-2xl p-4 shadow-sm ${
                    message.role === "user"
                      ? "bg-gradient-to-br from-primary to-accent text-white max-w-[80%]"
                      : "bg-gradient-to-br from-card to-muted/30 border border-primary/20 max-w-[85%]"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="flex items-center gap-2 mb-2">
                      <Logo size="sm" />
                      <span className="text-xs font-semibold text-primary">Luna</span>
                    </div>
                  )}
                  <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  <span className="text-xs opacity-70 mt-2 block">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-card border border-border rounded-2xl p-4">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}
            {/* Micro Intervention */}
            {intervention && (
              <div className="mx-auto max-w-sm">
                <MicroIntervention
                  type={intervention}
                  onComplete={() => {
                    setIntervention(null);
                    toast({
                      title: "Great job! 🌟",
                      description: "You completed the exercise. How are you feeling now?",
                    });
                  }}
                  onDismiss={() => setIntervention(null)}
                />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-border/50 p-4 bg-card/50">
            <div className="flex gap-2">
              <Input
                placeholder="Share what's on your mind..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                className="flex-1 bg-background border-border/50"
                disabled={isLoading}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleVoiceClick}
                className={`border-border/50 ${
                  isListening ? "bg-destructive/20 hover:bg-destructive/30" : "hover:bg-primary/10"
                }`}
                disabled={!isSupported}
              >
                {isListening ? (
                  <MicOff className="w-5 h-5 animate-pulse text-destructive" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </Button>
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Luna is an AI companion. For emergencies, please contact crisis services.
            </p>
          </div>
        </Card>

        {/* Quick Actions - Only show when chat has started */}
        {messages.length > 0 && (
          <SuggestionButtons 
            onSelectSuggestion={(text) => {
              setInput(text);
              setTimeout(() => handleSend(), 100);
            }}
            disabled={isLoading}
          />
        )}
      </div>
    </div>
    </AuthGate>
  );
};

export default Chat;
