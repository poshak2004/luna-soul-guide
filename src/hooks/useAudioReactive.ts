import { useRef, useCallback, useEffect } from "react";

interface AudioSample {
  name: string;
  url: string;
  frequency: number;
}

const audioSamples: AudioSample[] = [
  { name: "chime", url: "/sounds/chime.mp3", frequency: 523.25 },
  { name: "bowl", url: "/sounds/bowl.mp3", frequency: 293.66 },
  { name: "wave", url: "/sounds/wave.mp3", frequency: 196.00 },
  { name: "wind", url: "/sounds/wind.mp3", frequency: 329.63 },
];

export const useAudioReactive = (enabled: boolean) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBuffersRef = useRef<Map<string, AudioBuffer>>(new Map());
  const gainNodeRef = useRef<GainNode | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    audioContextRef.current = new AudioContext();
    gainNodeRef.current = audioContextRef.current.createGain();
    gainNodeRef.current.connect(audioContextRef.current.destination);
    gainNodeRef.current.gain.value = 0.3;

    // Preload audio samples
    audioSamples.forEach(async (sample) => {
      try {
        const response = await fetch(sample.url);
        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          const audioBuffer = await audioContextRef.current!.decodeAudioData(arrayBuffer);
          audioBuffersRef.current.set(sample.name, audioBuffer);
        }
      } catch (error) {
        console.log(`Audio sample ${sample.name} not available, using fallback`);
      }
    });

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [enabled]);

  const playStrokeSound = useCallback((speed: number) => {
    if (!enabled || !audioContextRef.current || !gainNodeRef.current) return;

    const sampleIndex = Math.min(Math.floor(speed / 3), audioSamples.length - 1);
    const sample = audioSamples[sampleIndex];
    const buffer = audioBuffersRef.current.get(sample.name);

    if (buffer) {
      // Play audio sample
      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;
      const gain = audioContextRef.current.createGain();
      gain.gain.value = Math.min(speed * 0.05, 0.4);
      
      source.connect(gain);
      gain.connect(gainNodeRef.current);
      source.start(0);

      // Fade out
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        audioContextRef.current.currentTime + 0.8
      );
    } else {
      // Fallback to oscillator
      const oscillator = audioContextRef.current.createOscillator();
      const gain = audioContextRef.current.createGain();
      
      oscillator.type = "sine";
      oscillator.frequency.value = sample.frequency + (speed * 10);
      gain.gain.value = Math.min(speed * 0.03, 0.2);
      
      oscillator.connect(gain);
      gain.connect(gainNodeRef.current);
      
      oscillator.start();
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        audioContextRef.current.currentTime + 0.5
      );
      oscillator.stop(audioContextRef.current.currentTime + 0.5);
    }
  }, [enabled]);

  return { playStrokeSound };
};
