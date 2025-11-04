import { useEffect, useRef, useState } from 'react';

export const useAudioVisualizer = (audioElement: HTMLAudioElement | null) => {
  const [frequencyData, setFrequencyData] = useState<Uint8Array>(new Uint8Array(128));
  const [amplitude, setAmplitude] = useState(0);
  const [bass, setBass] = useState(0);
  const [mid, setMid] = useState(0);
  const [treble, setTreble] = useState(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const rafRef = useRef<number>();

  useEffect(() => {
    if (!audioElement) return;

    // Prevent creating multiple sources from the same element
    if (sourceRef.current) return;

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;
      
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.75;
      analyser.minDecibels = -90;
      analyser.maxDecibels = -10;

      // Only create source once
      const source = audioContext.createMediaElementSource(audioElement);
      sourceRef.current = source;
      
      source.connect(analyser);
      analyser.connect(audioContext.destination);

      analyserRef.current = analyser;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateData = () => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
          setFrequencyData(new Uint8Array(dataArray));
          
          // Calculate frequency bands
          const bassRange = dataArray.slice(0, 32);
          const midRange = dataArray.slice(32, 96);
          const trebleRange = dataArray.slice(96, 128);
          
          const bassAvg = bassRange.reduce((a, b) => a + b, 0) / bassRange.length;
          const midAvg = midRange.reduce((a, b) => a + b, 0) / midRange.length;
          const trebleAvg = trebleRange.reduce((a, b) => a + b, 0) / trebleRange.length;
          
          setBass(bassAvg / 255);
          setMid(midAvg / 255);
          setTreble(trebleAvg / 255);
          
          const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
          setAmplitude(avg / 255);
        }
        rafRef.current = requestAnimationFrame(updateData);
      };

      updateData();

      return () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        if (audioContextRef.current?.state !== 'closed') {
          audioContextRef.current?.close();
        }
      };
    } catch (error) {
      console.error('Audio visualization error:', error);
      // Don't block audio playback if visualization fails
    }
  }, [audioElement]);

  return { frequencyData, amplitude, bass, mid, treble };
};
