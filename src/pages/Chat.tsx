import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Mic, Heart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hi there 💜 I'm Luna, your companion in this space. I'm here to listen without judgment and support you however you need. How are you feeling today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");

    // Simulate Luna's response (will be replaced with AI later)
    setTimeout(() => {
      const responses = [
        "I hear you. That sounds really challenging. Would you like to tell me more about what you're experiencing?",
        "Thank you for sharing that with me. Your feelings are completely valid. What do you think would help you feel better right now?",
        "I'm glad you're opening up about this. It takes courage to express these feelings. How long have you been feeling this way?",
        "That's a lot to carry. Remember, you're not alone in this. What kind of support would be most helpful for you right now?",
      ];
      
      const lunaMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date()
      };

      setMessages(prev => [...prev, lunaMessage]);
    }, 1000);
  };

  return (
    <div className="min-h-screen pt-16 bg-gradient-calm">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Heart className="w-8 h-8 text-primary fill-primary" />
            <h1 className="font-display text-3xl font-bold">Chat with Luna</h1>
            <Sparkles className="w-6 h-6 text-accent animate-pulse-gentle" />
          </div>
          <p className="text-muted-foreground">Your safe space for honest conversation</p>
        </motion.div>

        {/* Chat Container */}
        <Card className="glass h-[600px] flex flex-col overflow-hidden">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-4 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="w-4 h-4 text-primary fill-primary" />
                      <span className="text-xs font-semibold text-primary">Luna</span>
                    </div>
                  )}
                  <p className="leading-relaxed">{message.content}</p>
                  <span className="text-xs opacity-70 mt-2 block">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Input Area */}
          <div className="border-t border-border/50 p-4 bg-card/50">
            <div className="flex gap-2">
              <Input
                placeholder="Share what's on your mind..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                className="flex-1 bg-background border-border/50"
              />
              <Button
                variant="outline"
                size="icon"
                className="border-border/50 hover:bg-primary/10"
              >
                <Mic className="w-5 h-5" />
              </Button>
              <Button
                onClick={handleSend}
                disabled={!input.trim()}
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

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 flex flex-wrap gap-2 justify-center"
        >
          {[
            "I'm feeling anxious",
            "I need to talk",
            "Help me reflect",
            "I'm stressed",
            "Feeling lonely"
          ].map((suggestion, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => setInput(suggestion)}
              className="border-primary/30 hover:bg-primary/10"
            >
              {suggestion}
            </Button>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Chat;
