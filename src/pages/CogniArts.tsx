import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { 
  Palette, Eraser, Undo2, Redo2, Trash2, Circle, Square, 
  Star, Heart, Sparkles, Volume2, VolumeX, Save, Download, Image as ImageIcon
} from "lucide-react";
import { Canvas as FabricCanvas, Circle as FabricCircle, Rect, Polygon, PencilBrush, Path } from "fabric";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AmbientParticles } from "@/components/cogniarts/AmbientParticles";
import { useAudioReactive } from "@/hooks/useAudioReactive";

type BrushType = "pen" | "paintbrush" | "marker" | "watercolor" | "spray";
type Tool = "draw" | "erase" | "stamp";
type ColorPalette = "calm" | "healing" | "warm" | "sunrise" | "creative";

const CogniArts = () => {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [activeTool, setActiveTool] = useState<Tool>("draw");
  const [brushType, setBrushType] = useState<BrushType>("paintbrush");
  const [brushSize, setBrushSize] = useState([5]);
  const [brushOpacity, setBrushOpacity] = useState([100]);
  const [activeColor, setActiveColor] = useState("#4A90E2");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [history, setHistory] = useState<string[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const [colorPalette, setColorPalette] = useState<ColorPalette>("calm");
  const [artworkTitle, setArtworkTitle] = useState("Untitled Artwork");
  const [isSaving, setIsSaving] = useState(false);
  const [brushStrokes, setBrushStrokes] = useState(0);
  const [sessionStart] = useState(Date.now());
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  
  const { playStrokeSound } = useAudioReactive(soundEnabled);

  const colorPalettes: Record<ColorPalette, Array<{ name: string; hex: string }>> = {
    calm: [
      { name: "Ocean Blue", hex: "#4A90E2" },
      { name: "Serene Teal", hex: "#50E3C2" },
      { name: "Misty Gray", hex: "#A8D5E2" },
      { name: "Soft White", hex: "#F0F4F8" },
    ],
    healing: [
      { name: "Forest Green", hex: "#7ED321" },
      { name: "Mint Fresh", hex: "#50E3C2" },
      { name: "Sage", hex: "#9FE2BF" },
      { name: "Moss", hex: "#88B04B" },
    ],
    warm: [
      { name: "Sunset Orange", hex: "#FF9F4A" },
      { name: "Rose Pink", hex: "#FFB6D9" },
      { name: "Golden Yellow", hex: "#F5D76E" },
      { name: "Coral", hex: "#FF6B6B" },
    ],
    sunrise: [
      { name: "Dawn Orange", hex: "#FF9F4A" },
      { name: "Crimson", hex: "#E24A4A" },
      { name: "Amber", hex: "#F5D76E" },
      { name: "Peach", hex: "#FFDAB9" },
    ],
    creative: [
      { name: "Royal Purple", hex: "#9B51E0" },
      { name: "Lavender", hex: "#C7B3E5" },
      { name: "Pink Dream", hex: "#FFB6D9" },
      { name: "Indigo", hex: "#5856D6" },
    ],
  };

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: Math.min(window.innerWidth - 400, 1200),
      height: Math.min(window.innerHeight - 200, 800),
      backgroundColor: "#FAFBFC",
      isDrawingMode: true,
    });

    canvas.freeDrawingBrush = new PencilBrush(canvas);
    canvas.freeDrawingBrush.color = activeColor;
    canvas.freeDrawingBrush.width = brushSize[0];

    setFabricCanvas(canvas);
    saveHistory(canvas);

    const handleResize = () => {
      canvas.setDimensions({
        width: Math.min(window.innerWidth - 400, 1200),
        height: Math.min(window.innerHeight - 200, 800),
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      canvas.dispose();
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Apply color palette theme
  useEffect(() => {
    if (!fabricCanvas) return;
    const colors = colorPalettes[colorPalette];
    setActiveColor(colors[0].hex);
  }, [colorPalette, fabricCanvas]);

  // Update brush settings
  useEffect(() => {
    if (!fabricCanvas) return;

    fabricCanvas.freeDrawingBrush.color = activeColor;
    fabricCanvas.freeDrawingBrush.width = brushSize[0];
    
    // Apply opacity through RGBA
    const hexToRgba = (hex: string, opacity: number) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
    };
    
    fabricCanvas.freeDrawingBrush.color = hexToRgba(activeColor, brushOpacity[0]);

    // Adjust brush characteristics
    switch (brushType) {
      case "pen":
        fabricCanvas.freeDrawingBrush.width = brushSize[0] * 0.6;
        break;
      case "paintbrush":
        fabricCanvas.freeDrawingBrush.width = brushSize[0];
        break;
      case "marker":
        fabricCanvas.freeDrawingBrush.width = brushSize[0] * 1.8;
        break;
      case "watercolor":
        fabricCanvas.freeDrawingBrush.width = brushSize[0] * 1.3;
        fabricCanvas.freeDrawingBrush.color = hexToRgba(activeColor, brushOpacity[0] * 0.6);
        break;
      case "spray":
        fabricCanvas.freeDrawingBrush.width = brushSize[0] * 2.5;
        fabricCanvas.freeDrawingBrush.color = hexToRgba(activeColor, brushOpacity[0] * 0.4);
        break;
    }
  }, [fabricCanvas, activeColor, brushSize, brushOpacity, brushType]);

  // Handle tool changes
  useEffect(() => {
    if (!fabricCanvas) return;

    fabricCanvas.isDrawingMode = activeTool === "draw";
    
    if (activeTool === "erase") {
      fabricCanvas.isDrawingMode = true;
      const hexToRgba = (hex: string, opacity: number) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
      };
      fabricCanvas.freeDrawingBrush.color = hexToRgba("#F8F9FA", 100);
      fabricCanvas.freeDrawingBrush.width = brushSize[0] * 2;
    }
  }, [activeTool, fabricCanvas, brushSize]);

  // Drawing events for sound and haptics
  useEffect(() => {
    if (!fabricCanvas) return;

    const handlePathCreated = (e: any) => {
      saveHistory(fabricCanvas);
      triggerHaptic();
      setBrushStrokes((prev) => prev + 1);
      
      const path = e.path as Path;
      const pathLength = path.path?.length || 1;
      const speed = Math.min(pathLength / 10, 10);
      
      playStrokeSound(speed);
    };

    fabricCanvas.on("path:created", handlePathCreated);

    return () => {
      fabricCanvas.off("path:created", handlePathCreated);
    };
  }, [fabricCanvas, playStrokeSound]);

  const triggerHaptic = () => {
    if ("vibrate" in navigator) {
      navigator.vibrate(10);
    }
  };

  const saveHistory = (canvas: FabricCanvas) => {
    const json = JSON.stringify(canvas.toJSON());
    setHistory((prev) => [...prev.slice(0, historyStep + 1), json]);
    setHistoryStep((prev) => prev + 1);
  };

  const undo = () => {
    if (!fabricCanvas || historyStep <= 0) return;
    
    const newStep = historyStep - 1;
    setHistoryStep(newStep);
    fabricCanvas.loadFromJSON(history[newStep], () => {
      fabricCanvas.renderAll();
    });
  };

  const redo = () => {
    if (!fabricCanvas || historyStep >= history.length - 1) return;
    
    const newStep = historyStep + 1;
    setHistoryStep(newStep);
    fabricCanvas.loadFromJSON(history[newStep], () => {
      fabricCanvas.renderAll();
    });
  };

  const clearCanvas = () => {
    if (!fabricCanvas) return;
    
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = "#F8F9FA";
    fabricCanvas.renderAll();
    saveHistory(fabricCanvas);
    
    toast({
      title: "Canvas cleared",
      description: "Your canvas has been reset",
    });
  };

  const addStamp = (type: "circle" | "star" | "heart" | "sparkle") => {
    if (!fabricCanvas) return;
    
    setActiveTool("stamp");
    fabricCanvas.isDrawingMode = false;
    
    let stamp;
    const centerX = fabricCanvas.width! / 2;
    const centerY = fabricCanvas.height! / 2;
    
    switch (type) {
      case "circle":
        stamp = new FabricCircle({
          radius: 40,
          fill: activeColor,
          left: centerX,
          top: centerY,
          opacity: brushOpacity[0] / 100,
        });
        break;
      case "star":
        const points = [];
        const outerRadius = 40;
        const innerRadius = 20;
        for (let i = 0; i < 10; i++) {
          const radius = i % 2 === 0 ? outerRadius : innerRadius;
          const angle = (Math.PI / 5) * i - Math.PI / 2;
          points.push({
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle),
          });
        }
        stamp = new Polygon(points, {
          fill: activeColor,
          opacity: brushOpacity[0] / 100,
        });
        break;
      case "heart":
      case "sparkle":
      default:
        stamp = new Rect({
          width: 60,
          height: 60,
          fill: activeColor,
          left: centerX,
          top: centerY,
          opacity: brushOpacity[0] / 100,
          angle: type === "sparkle" ? 45 : 0,
        });
    }
    
    fabricCanvas.add(stamp);
    fabricCanvas.setActiveObject(stamp);
    saveHistory(fabricCanvas);
    triggerHaptic();
    setBrushStrokes((prev) => prev + 1);
    
    toast({
      title: `${type} stamp added`,
      description: "Drag to reposition or resize",
    });
  };

  const saveArtwork = async () => {
    if (!fabricCanvas) return;
    
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Not authenticated",
          description: "Please log in to save your artwork",
          variant: "destructive",
        });
        return;
      }

      // Generate image data
      const dataURL = fabricCanvas.toDataURL({ 
        format: "png", 
        quality: 0.9,
        multiplier: 1
      });
      const blob = await (await fetch(dataURL)).blob();
      
      // Upload to Supabase Storage
      const fileName = `${user.id}/${Date.now()}-${artworkTitle.replace(/\s+/g, "-")}.png`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("artworks")
        .upload(fileName, blob, { contentType: "image/png" });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("artworks")
        .getPublicUrl(fileName);

      // Save metadata to database
      const duration = Math.floor((Date.now() - sessionStart) / 1000);
      const { error: dbError } = await supabase.from("user_artworks").insert({
        user_id: user.id,
        title: artworkTitle,
        image_url: publicUrl,
        canvas_data: fabricCanvas.toJSON(),
        duration_seconds: duration,
        mood_tag: colorPalette,
        color_palette: colorPalette,
        brush_strokes: brushStrokes,
      });

      if (dbError) throw dbError;

      toast({
        title: "Artwork saved! 🎨",
        description: `"${artworkTitle}" has been saved to your gallery`,
      });
      
      setShowSaveDialog(false);
    } catch (error) {
      console.error("Error saving artwork:", error);
      toast({
        title: "Save failed",
        description: "Could not save your artwork. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const downloadArtwork = () => {
    if (!fabricCanvas) return;
    
    const dataURL = fabricCanvas.toDataURL({ 
      format: "png", 
      quality: 1.0,
      multiplier: 2
    });
    const link = document.createElement("a");
    link.download = `${artworkTitle}.png`;
    link.href = dataURL;
    link.click();
    
    toast({
      title: "Downloaded! 💾",
      description: `${artworkTitle}.png saved to your device`,
    });
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
    toast({
      title: soundEnabled ? "Sound disabled" : "Sound enabled",
      description: soundEnabled 
        ? "Therapeutic soundscape turned off" 
        : "Draw to hear calming tones",
    });
  };

  return (
    <div className="min-h-screen pt-16 pb-8 px-4 relative overflow-hidden">
      <AmbientParticles colorPalette={colorPalette} />
      
      <div className="container mx-auto max-w-[95vw] relative z-10">
        <motion.div 
          className="text-center mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl font-display font-bold mb-2 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent breathe">
            🎨 CogniArts Studio
          </h1>
          <p className="text-muted-foreground text-lg">
            Therapeutic digital art with ambient soundscapes
          </p>
        </motion.div>

        <div className="flex gap-6">
          {/* Toolbar */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="w-80 p-5 glass space-y-5 h-fit shadow-lg hover-lift">
              {/* Color Palette Theme Selector */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2 text-primary">
                  <Palette className="w-5 h-5" />
                  Color Palette
                </h3>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {(["calm", "healing", "warm", "sunrise", "creative"] as ColorPalette[]).map((palette) => (
                    <Button
                      key={palette}
                      variant={colorPalette === palette ? "default" : "outline"}
                      size="sm"
                      onClick={() => setColorPalette(palette)}
                      className="capitalize"
                    >
                      {palette}
                    </Button>
                  ))}
                </div>
              </div>
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Tools
              </h3>
              
              <div className="grid grid-cols-3 gap-2 mb-4">
                <Button
                  variant={activeTool === "draw" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTool("draw")}
                  className="w-full"
                >
                  Draw
                </Button>
                <Button
                  variant={activeTool === "erase" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTool("erase")}
                >
                  <Eraser className="w-4 h-4" />
                </Button>
                <Button
                  variant={activeTool === "stamp" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTool("stamp")}
                >
                  <Sparkles className="w-4 h-4" />
                </Button>
              </div>

              <AnimatePresence mode="wait">
                {activeTool === "draw" && (
                  <motion.div 
                    className="space-y-2"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <label className="text-sm font-medium">Brush Style</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(["pen", "paintbrush", "marker", "watercolor", "spray"] as BrushType[]).map((type) => (
                        <Button
                          key={type}
                          variant={brushType === type ? "default" : "outline"}
                          size="sm"
                          onClick={() => setBrushType(type)}
                          className="capitalize"
                        >
                          {type}
                        </Button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Brush Size: {brushSize[0]}px</label>
              <Slider
                value={brushSize}
                onValueChange={setBrushSize}
                min={1}
                max={50}
                step={1}
                className="mb-4"
              />

              <label className="text-sm font-medium mb-2 block">Opacity: {brushOpacity[0]}%</label>
              <Slider
                value={brushOpacity}
                onValueChange={setBrushOpacity}
                min={10}
                max={100}
                step={5}
              />
            </div>

            <div>
              <h3 className="font-semibold mb-3">Colors</h3>
              <div className="grid grid-cols-4 gap-2">
                {colorPalettes[colorPalette].map((color) => (
                  <motion.button
                    key={color.hex}
                    onClick={() => setActiveColor(color.hex)}
                    className="w-12 h-12 rounded-xl transition-all hover:scale-110 border-2 shadow-md"
                    style={{
                      backgroundColor: color.hex,
                      borderColor: activeColor === color.hex ? "hsl(var(--primary))" : "transparent",
                    }}
                    title={color.name}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  />
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Stamps</h3>
              <div className="grid grid-cols-4 gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => addStamp("circle")}
                >
                  <Circle className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => addStamp("star")}
                >
                  <Star className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => addStamp("heart")}
                >
                  <Heart className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => addStamp("sparkle")}
                >
                  <Sparkles className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <Button
                variant="outline"
                size="icon"
                onClick={undo}
                disabled={historyStep <= 0}
                title="Undo"
              >
                <Undo2 className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={redo}
                disabled={historyStep >= history.length - 1}
                title="Redo"
              >
                <Redo2 className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={toggleSound}
                title={soundEnabled ? "Disable sound" : "Enable sound"}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>
              <Button
                variant="destructive"
                size="icon"
                onClick={clearCanvas}
                title="Clear canvas"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Save & Export */}
            <div className="space-y-2 pt-4 border-t">
              <Button
                className="w-full"
                onClick={() => setShowSaveDialog(true)}
                disabled={brushStrokes === 0}
              >
                <Save className="w-4 h-4 mr-2" />
                Save to Gallery
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={downloadArtwork}
                disabled={brushStrokes === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Download PNG
              </Button>
            </div>

            {/* Stats */}
            <div className="pt-4 border-t text-sm text-muted-foreground space-y-1">
              <div className="flex justify-between">
                <span>Brush strokes:</span>
                <span className="font-semibold">{brushStrokes}</span>
              </div>
              <div className="flex justify-between">
                <span>Session time:</span>
                <span className="font-semibold">
                  {Math.floor((Date.now() - sessionStart) / 60000)}m
                </span>
              </div>
            </div>
            </Card>
          </motion.div>

          {/* Canvas */}
          <motion.div 
            className="flex-1"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="p-6 glass shadow-2xl glow">
              <div className="rounded-2xl overflow-hidden shadow-inner bg-white/50">
                <canvas ref={canvasRef} className="w-full h-full" />
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Save Dialog */}
      <AnimatePresence>
        {showSaveDialog && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSaveDialog(false)}
          >
            <motion.div
              className="bg-card p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-6">
                <ImageIcon className="w-8 h-8 text-primary" />
                <h2 className="text-2xl font-bold">Save Your Artwork</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Artwork Title</label>
                  <Input
                    value={artworkTitle}
                    onChange={(e) => setArtworkTitle(e.target.value)}
                    placeholder="Enter a title..."
                    className="w-full"
                  />
                </div>
                
                <div className="flex gap-3">
                  <Button
                    onClick={saveArtwork}
                    disabled={isSaving}
                    className="flex-1"
                  >
                    {isSaving ? "Saving..." : "Save to Gallery"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowSaveDialog(false)}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CogniArts;
