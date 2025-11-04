import { useState } from "react";
import { motion } from "framer-motion";
import { BookHeart, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useJournal } from "@/hooks/useJournal";
import { AuthGate } from "@/components/AuthGate";
import { Logo } from "@/components/Logo";

const Journal = () => {
  const [entry, setEntry] = useState("");
  const [mood, setMood] = useState("neutral");
  const { entries, saveEntry, deleteEntry } = useJournal();
  const { toast } = useToast();

  const handleSave = async () => {
    try {
      // Import and validate with Zod
      const { JournalInputSchema } = await import('@/schemas/zodSchemas');
      JournalInputSchema.parse({ content: entry, mood });

      const moodScore = { happy: 8, calm: 7, neutral: 5, anxious: 3, sad: 2, stressed: 3 }[mood] || 5;
      await saveEntry(entry, mood, moodScore);
      setEntry("");
      setMood("neutral");
      
      toast({
        title: "Entry saved",
        description: "Your journal entry has been saved securely.",
      });
    } catch (error: any) {
      toast({
        title: "Validation error",
        description: error.errors?.[0]?.message || "Invalid entry",
        variant: "destructive"
      });
    }
  };

  const moodOptions = [
    { value: "happy", label: "😊 Happy", color: "text-yellow-500" },
    { value: "calm", label: "😌 Calm", color: "text-blue-500" },
    { value: "neutral", label: "😐 Neutral", color: "text-gray-500" },
    { value: "anxious", label: "😰 Anxious", color: "text-orange-500" },
    { value: "sad", label: "😢 Sad", color: "text-blue-600" },
    { value: "stressed", label: "😫 Stressed", color: "text-red-500" },
  ];

  return (
    <AuthGate>
    <div className="min-h-screen pt-16 bg-gradient-calm">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <BookHeart className="w-8 h-8 text-accent" />
            <h1 className="font-display text-3xl font-bold">Your Private Journal</h1>
            <Logo size="md" />
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
              <Select value={mood} onValueChange={setMood}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {moodOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <span className={option.color}>{option.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

        {/* Previous Entries */}
        {entries.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8"
          >
            <h3 className="font-display text-lg font-semibold mb-4">Previous Entries</h3>
            <div className="space-y-4">
              {entries.slice(0, 5).map((e, index) => (
                <Card key={e.id} className="glass p-4 hover:shadow-lg transition-all group">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(e.created_at).toLocaleDateString()}
                      </p>
                      <span className="text-2xl">
                        {moodOptions.find(m => m.value === e.mood_label)?.label.split(' ')[0] || '😐'}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteEntry(e.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-sm line-clamp-2">{e.content}</p>
                </Card>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
    </AuthGate>
  );
};

export default Journal;
