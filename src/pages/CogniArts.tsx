import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Palette, Music, Pen, Save, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const CogniArts = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("draw");
  const [poetryText, setPoetryText] = useState("");
  const [journalText, setJournalText] = useState("");
  const [canvasColor, setCanvasColor] = useState("#000000");
  const [isSaving, setIsSaving] = useState(false);

  const colors = [
    { name: "Calm Blue", hex: "#4A90E2", emotion: "peace" },
    { name: "Energizing Yellow", hex: "#F5D76E", emotion: "joy" },
    { name: "Grounding Green", hex: "#7ED321", emotion: "balance" },
    { name: "Passionate Red", hex: "#E24A4A", emotion: "energy" },
    { name: "Healing Purple", hex: "#9B51E0", emotion: "healing" },
    { name: "Soothing Pink", hex: "#FFB6D9", emotion: "comfort" },
  ];

  const saveCreation = async (type: string, content: string) => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to save your creations",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from("journal_entries").insert([{
        user_id: user.id,
        content: content,
        tags: [type, "creative-therapy"],
        mood_label: "creative"
      }]);

      if (error) throw error;

      toast({
        title: "Creation saved!",
        description: "Your creative work has been saved to your journal",
      });

      if (type === "poetry") setPoetryText("");
      if (type === "journal") setJournalText("");
    } catch (error) {
      console.error("Error saving creation:", error);
      toast({
        title: "Error",
        description: "Failed to save your creation",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-gradient-to-br from-background via-accent/5 to-background">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-display font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            🎨 CogniArts Studio
          </h1>
          <p className="text-lg text-muted-foreground">
            Express your emotions through creative therapy
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="draw" className="gap-2">
              <Palette className="w-4 h-4" />
              Color Canvas
            </TabsTrigger>
            <TabsTrigger value="poetry" className="gap-2">
              <Pen className="w-4 h-4" />
              Poetry
            </TabsTrigger>
            <TabsTrigger value="journal" className="gap-2">
              <Music className="w-4 h-4" />
              Creative Journal
            </TabsTrigger>
          </TabsList>

          <TabsContent value="draw" className="space-y-6">
            <Card className="p-6 glass">
              <h3 className="text-xl font-semibold mb-4">Emotional Color Canvas</h3>
              <p className="text-muted-foreground mb-6">
                Choose colors that represent your current emotions. Each color has healing properties.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {colors.map((color) => (
                  <button
                    key={color.hex}
                    onClick={() => setCanvasColor(color.hex)}
                    className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all hover:scale-105"
                    style={{
                      borderColor: canvasColor === color.hex ? color.hex : "transparent",
                      backgroundColor: `${color.hex}20`,
                    }}
                  >
                    <div
                      className="w-16 h-16 rounded-full shadow-lg"
                      style={{ backgroundColor: color.hex }}
                    />
                    <div className="text-center">
                      <p className="font-medium text-sm">{color.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{color.emotion}</p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="relative">
                <div
                  className="w-full h-64 rounded-lg shadow-inner transition-all duration-500"
                  style={{ backgroundColor: canvasColor }}
                />
                <p className="text-center text-sm text-muted-foreground mt-4">
                  Take a moment to breathe and reflect on this color's energy
                </p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="poetry" className="space-y-6">
            <Card className="p-6 glass">
              <h3 className="text-xl font-semibold mb-4">Express Through Poetry</h3>
              <p className="text-muted-foreground mb-6">
                Write poetry to process your emotions. There are no rules—just authentic expression.
              </p>

              <Textarea
                value={poetryText}
                onChange={(e) => setPoetryText(e.target.value)}
                placeholder="Let your emotions flow into words...&#10;&#10;Perhaps a haiku?&#10;Or free verse?&#10;The choice is yours."
                className="min-h-[300px] font-serif text-lg"
              />

              <div className="flex gap-3 mt-4">
                <Button
                  onClick={() => saveCreation("poetry", poetryText)}
                  disabled={!poetryText.trim() || isSaving}
                  className="flex-1"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Poetry
                </Button>
                <Button
                  onClick={() => setPoetryText("")}
                  variant="outline"
                  disabled={!poetryText.trim()}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="journal" className="space-y-6">
            <Card className="p-6 glass">
              <h3 className="text-xl font-semibold mb-4">Creative Journal</h3>
              <p className="text-muted-foreground mb-6">
                Express yourself freely. Write, draw, or describe your creative vision.
              </p>

              <Textarea
                value={journalText}
                onChange={(e) => setJournalText(e.target.value)}
                placeholder="What creative ideas are flowing through your mind today?&#10;&#10;Describe a scene, a feeling, a dream, or anything that brings you joy..."
                className="min-h-[300px] text-lg"
              />

              <div className="flex gap-3 mt-4">
                <Button
                  onClick={() => saveCreation("journal", journalText)}
                  disabled={!journalText.trim() || isSaving}
                  className="flex-1"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Entry
                </Button>
                <Button
                  onClick={() => setJournalText("")}
                  variant="outline"
                  disabled={!journalText.trim()}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CogniArts;
