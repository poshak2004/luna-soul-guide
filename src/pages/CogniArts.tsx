import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  Palette, Eraser, Undo2, Redo2, Trash2, Circle, Square, 
  Star, Heart, Sparkles, Volume2, VolumeX 
} from "lucide-react";
import { Canvas as FabricCanvas, Circle as FabricCircle, PencilBrush, Path } from "fabric";
import { useToast } from "@/components/ui/use-toast";

type BrushType = "pen" | "paintbrush" | "marker" | "pencil" | "airbrush";
type Tool = "draw" | "erase" | "stamp";

const CogniArts = () => {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [activeTool, setActiveTool] = useState<Tool>("draw");
  const [brushType, setBrushType] = useState<BrushType>("paintbrush");
  const [brushSize, setBrushSize] = useState([5]);
  const [brushOpacity, setBrushOpacity] = useState([100]);
  const [activeColor, setActiveColor] = useState("#4A90E2");
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  const colors = [
    { name: "Calm Blue", hex: "#4A90E2" },
    { name: "Serene Teal", hex: "#50E3C2" },
    { name: "Joyful Yellow", hex: "#F5D76E" },
    { name: "Peaceful Green", hex: "#7ED321" },
    { name: "Passionate Red", hex: "#E24A4A" },
    { name: "Creative Purple", hex: "#9B51E0" },
    { name: "Gentle Pink", hex: "#FFB6D9" },
    { name: "Warm Orange", hex: "#FF9F4A" },
    { name: "Deep Indigo", hex: "#5856D6" },
    { name: "Soft Lavender", hex: "#C7B3E5" },
    { name: "Earthy Brown", hex: "#8B6F47" },
    { name: "Pure White", hex: "#FFFFFF" },
  ];

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: window.innerWidth - 400,
      height: window.innerHeight - 200,
      backgroundColor: "#F8F9FA",
      isDrawingMode: true,
    });

    canvas.freeDrawingBrush = new PencilBrush(canvas);
    canvas.freeDrawingBrush.color = activeColor;
    canvas.freeDrawingBrush.width = brushSize[0];

    setFabricCanvas(canvas);
    saveHistory(canvas);

    return () => {
      canvas.dispose();
    };
  }, []);

  // Initialize audio context
  useEffect(() => {
    if (soundEnabled && !audioContextRef.current) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContext();
      
      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();
      
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(220, audioContextRef.current.currentTime);
      gainNode.gain.setValueAtTime(0, audioContextRef.current.currentTime);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      oscillator.start();
      
      oscillatorRef.current = oscillator;
      gainNodeRef.current = gainNode;
    }
  }, [soundEnabled]);

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
        fabricCanvas.freeDrawingBrush.width = brushSize[0] * 0.5;
        break;
      case "paintbrush":
        fabricCanvas.freeDrawingBrush.width = brushSize[0];
        break;
      case "marker":
        fabricCanvas.freeDrawingBrush.width = brushSize[0] * 1.5;
        break;
      case "pencil":
        fabricCanvas.freeDrawingBrush.width = brushSize[0] * 0.7;
        break;
      case "airbrush":
        fabricCanvas.freeDrawingBrush.width = brushSize[0] * 2;
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
      
      if (soundEnabled && gainNodeRef.current && oscillatorRef.current) {
        const path = e.path as Path;
        const pathLength = path.path?.length || 1;
        const speed = Math.min(pathLength / 10, 10);
        
        // Adjust sound based on stroke speed
        const volume = Math.min(speed * 0.05, 0.3);
        const frequency = 220 + (speed * 20);
        
        gainNodeRef.current.gain.setValueAtTime(volume, audioContextRef.current!.currentTime);
        oscillatorRef.current.frequency.setValueAtTime(frequency, audioContextRef.current!.currentTime);
        
        setTimeout(() => {
          if (gainNodeRef.current) {
            gainNodeRef.current.gain.exponentialRampToValueAtTime(
              0.001,
              audioContextRef.current!.currentTime + 0.5
            );
          }
        }, 100);
      }
    };

    fabricCanvas.on("path:created", handlePathCreated);

    return () => {
      fabricCanvas.off("path:created", handlePathCreated);
    };
  }, [fabricCanvas, soundEnabled]);

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
    
    // Create a simple circle stamp (for demo - you can enhance with SVG paths)
    const stamp = new FabricCircle({
      radius: 30,
      fill: activeColor,
      left: fabricCanvas.width! / 2,
      top: fabricCanvas.height! / 2,
      opacity: brushOpacity[0] / 100,
    });
    
    fabricCanvas.add(stamp);
    fabricCanvas.setActiveObject(stamp);
    saveHistory(fabricCanvas);
    triggerHaptic();
    
    toast({
      title: `${type} stamp added`,
      description: "Drag to reposition or resize",
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
    <div className="min-h-screen pt-16 pb-8 px-4 bg-gradient-to-br from-background via-accent/5 to-background">
      <div className="container mx-auto max-w-[95vw]">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-display font-bold mb-2 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            🎨 CogniArts Studio
          </h1>
          <p className="text-muted-foreground">
            Multisensory creative therapy space
          </p>
        </div>

        <div className="flex gap-4">
          {/* Toolbar */}
          <Card className="w-80 p-4 glass space-y-4 h-fit">
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

              {activeTool === "draw" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Brush Style</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["pen", "paintbrush", "marker", "pencil", "airbrush"] as BrushType[]).map((type) => (
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
                </div>
              )}
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
              <h3 className="font-semibold mb-3">Color Palette</h3>
              <div className="grid grid-cols-4 gap-2">
                {colors.map((color) => (
                  <button
                    key={color.hex}
                    onClick={() => setActiveColor(color.hex)}
                    className="w-12 h-12 rounded-lg transition-all hover:scale-110 border-2"
                    style={{
                      backgroundColor: color.hex,
                      borderColor: activeColor === color.hex ? "#000" : "transparent",
                    }}
                    title={color.name}
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
              >
                <Undo2 className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={redo}
                disabled={historyStep >= history.length - 1}
              >
                <Redo2 className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={toggleSound}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>
              <Button
                variant="destructive"
                size="icon"
                onClick={clearCanvas}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </Card>

          {/* Canvas */}
          <Card className="flex-1 p-4 glass">
            <div className="rounded-lg overflow-hidden shadow-lg">
              <canvas ref={canvasRef} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CogniArts;
