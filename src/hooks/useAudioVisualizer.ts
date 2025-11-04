import { useEffect, useRef, useState } from 'react';

export const useAudioVisualizer = (audioElement: HTMLAudioElement | null) => {
  const [frequencyData, setFrequencyData] = useState<Uint8Array>(new Uint8Array(128));
  const [amplitude, setAmplitude] = useState(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number>();

  useEffect(() => {
    if (!audioElement) return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.8;

    const source = audioContext.createMediaElementSource(audioElement);
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    analyserRef.current = analyser;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const updateData = () => {
      if (analyserRef.current) {
        analyserRef.current.getByteFrequencyData(dataArray);
        setFrequencyData(new Uint8Array(dataArray));
        
        // Calculate average amplitude
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        setAmplitude(avg / 255);
      }
      rafRef.current = requestAnimationFrame(updateData);
    };

    updateData();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      audioContext.close();
    };
  }, [audioElement]);

  return { frequencyData, amplitude };
};
