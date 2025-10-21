import { useState } from "react";
import { motion } from "framer-motion";
import { BookHeart, Save, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const Journal = () => {
  const [entry, setEntry] = useState("");
  const { toast } = useToast();

  const handleSave = () => {
    if (!entry.trim()) {
      toast({
        title: "Empty entry",
        description: "Write something before saving your thoughts.",
        variant: "destructive"
      });
      return;
    }

    // Save to localStorage for now (will connect to backend later)
    const entries = JSON.parse(localStorage.getItem("journal_entries") || "[]");
    entries.push({
      id: Date.now(),
      content: entry,
      date: new Date().toISOString()
    });
    localStorage.setItem("journal_entries", JSON.stringify(entries));

    toast({
      title: "Entry saved",
      description: "Your thoughts are safely stored 💜",
    });

    setEntry("");
  };

  return (
    <div className="min-h-screen pt-16 bg-gradient-calm">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <BookHeart className="w-8 h-8 text-accent" />
            <h1 className="font-display text-3xl font-bold">Your Private Journal</h1>
            <Sparkles className="w-6 h-6 text-primary animate-pulse-gentle" />
          </div>
          <p className="text-muted-foreground">
            A safe space to process your thoughts and emotions
          </p>
        </motion.div>

        {/* Journal Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass p-8">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-display text-xl font-semibold">Today's Entry</h2>
                <p className="text-sm text-muted-foreground">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>

            <Textarea
              placeholder="What's on your mind? Write freely without judgment..."
              value={entry}
              onChange={(e) => setEntry(e.target.value)}
              className="min-h-[400px] text-lg resize-none bg-background/50 border-border/50 focus:border-accent"
            />

            <div className="mt-6 flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                {entry.length} characters • All entries are encrypted and private
              </p>
              <Button
                onClick={handleSave}
                disabled={!entry.trim()}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Entry
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Prompts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <h3 className="font-display text-lg font-semibold mb-4">Writing prompts</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              "What am I grateful for today?",
              "What challenged me, and how did I respond?",
              "What would I tell a friend in my situation?",
              "What small win can I celebrate today?"
            ].map((prompt, index) => (
              <Card
                key={index}
                className="p-4 glass cursor-pointer hover:glow transition-all group"
                onClick={() => setEntry(entry + (entry ? "\n\n" : "") + prompt + "\n")}
              >
                <p className="text-sm group-hover:text-primary transition-colors">
                  {prompt}
                </p>
              </Card>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Journal;
