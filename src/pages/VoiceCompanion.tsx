import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Phone, PhoneOff, Moon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const VoiceCompanion = () => {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const startSession = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to use Luna",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Connecting to Luna...",
        description: "Your AI voice companion is getting ready",
      });

      // Request microphone access
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Initialize audio context
      audioContextRef.current = new AudioContext({ sampleRate: 24000 });

      // Connect to WebSocket
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || "lqmlradyrdzrqdbinmlb";
      const ws = new WebSocket(`wss://${projectId}.supabase.co/functions/v1/luna-voice`);
      
      ws.onopen = () => {
        setIsConnected(true);
        setIsListening(true);
        toast({
          title: "Connected to Luna",
          description: "Start speaking—Luna is listening",
        });
      };

      ws.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === "response.audio.delta") {
            setIsSpeaking(true);
            // Handle audio playback
            const audioData = atob(data.delta);
            const bytes = new Uint8Array(audioData.length);
            for (let i = 0; i < audioData.length; i++) {
              bytes[i] = audioData.charCodeAt(i);
            }
            // TODO: Implement audio playback queue
          } else if (data.type === "response.audio.done") {
            setIsSpeaking(false);
          } else if (data.type === "response.audio_transcript.delta") {
            setTranscript(prev => [...prev, data.delta]);
          } else if (data.type === "input_audio_buffer.speech_started") {
            setIsListening(true);
          } else if (data.type === "input_audio_buffer.speech_stopped") {
            setIsListening(false);
          }
        } catch (error) {
          console.error("Error processing message:", error);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        toast({
          title: "Connection error",
          description: "Failed to connect to Luna",
          variant: "destructive",
        });
      };

      ws.onclose = () => {
        setIsConnected(false);
        setIsListening(false);
        setIsSpeaking(false);
      };

      wsRef.current = ws;
    } catch (error) {
      console.error("Error starting session:", error);
      toast({
        title: "Error",
        description: "Failed to start voice session. Please check microphone permissions.",
        variant: "destructive",
      });
    }
  };

  const endSession = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsConnected(false);
    setIsListening(false);
    setIsSpeaking(false);
    toast({
      title: "Session ended",
      description: "Come back anytime to talk with Luna",
    });
  };

  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-gradient-to-br from-background via-accent/5 to-background">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Moon className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-display font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Luna
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Your empathetic AI voice companion
          </p>
        </div>

        <Card className="p-8 glass">
          <div className="flex flex-col items-center gap-8">
            {/* Visual Status Indicator */}
            <div className="relative">
              <div
                className={`w-48 h-48 rounded-full flex items-center justify-center transition-all duration-500 ${
                  isSpeaking
                    ? "bg-primary shadow-2xl shadow-primary/50 scale-110"
                    : isListening
                    ? "bg-accent shadow-xl shadow-accent/50 scale-105"
                    : "bg-muted"
                }`}
              >
                <Moon className="w-24 h-24 text-white" />
              </div>
              {isConnected && (
                <div className="absolute -bottom-2 -right-2">
                  {isListening ? (
                    <div className="animate-pulse">
                      <Mic className="w-8 h-8 text-primary" />
                    </div>
                  ) : isSpeaking ? (
                    <div className="animate-pulse">
                      <Phone className="w-8 h-8 text-accent" />
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            {/* Status Text */}
            <div className="text-center space-y-2">
              <p className="text-xl font-semibold">
                {isSpeaking
                  ? "Luna is speaking..."
                  : isListening
                  ? "Luna is listening..."
                  : isConnected
                  ? "Connected"
                  : "Not connected"}
              </p>
              <p className="text-sm text-muted-foreground">
                {!isConnected
                  ? "Start a session to begin talking with Luna"
                  : "Speak naturally—Luna will respond with empathy and understanding"}
              </p>
            </div>

            {/* Controls */}
            <div className="flex gap-4">
              {!isConnected ? (
                <Button
                  onClick={startSession}
                  size="lg"
                  className="gap-2"
                >
                  <Phone className="w-5 h-5" />
                  Start Session
                </Button>
              ) : (
                <Button
                  onClick={endSession}
                  size="lg"
                  variant="destructive"
                  className="gap-2"
                >
                  <PhoneOff className="w-5 h-5" />
                  End Session
                </Button>
              )}
            </div>

            {/* Transcript */}
            {transcript.length > 0 && (
              <div className="w-full max-h-64 overflow-y-auto space-y-2 p-4 rounded-lg bg-muted/50">
                <h3 className="font-semibold mb-2">Conversation:</h3>
                {transcript.map((text, i) => (
                  <p key={i} className="text-sm">
                    {text}
                  </p>
                ))}
              </div>
            )}

            {/* Info Card */}
            <div className="w-full p-4 rounded-lg bg-primary/10 border border-primary/20">
              <h4 className="font-semibold mb-2">About Luna</h4>
              <p className="text-sm text-muted-foreground">
                Luna is your 24/7 mental health companion powered by advanced AI. 
                She provides empathetic support, active listening, and gentle guidance 
                whenever you need someone to talk to. Your conversations are private and secure.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default VoiceCompanion;
