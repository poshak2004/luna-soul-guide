import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useChat } from "@/hooks/useChat";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { AuthGate } from "@/components/AuthGate";
import { Logo } from "@/components/Logo";
import { useToast } from "@/hooks/use-toast";
import { SuggestionButtons } from "@/components/chat/SuggestionButtons";

const Chat = () => {
  const { messages, sendMessage, isLoading } = useChat();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const { isListening, isSupported, toggleListening } = useVoiceInput({
    onTranscript: (text) => {
      setInput((prev) => prev + " " + text);
    },
    continuous: false,
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput("");
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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <Logo size="lg" />
            <h1 className="font-display text-3xl font-bold">Chat with Luna</h1>
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
