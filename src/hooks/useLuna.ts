import { useState, useEffect } from 'react';
import { useStreak } from './useStreak';
import { usePoints } from './usePoints';
import { useGamification } from './useGamification';
import type { LunaEmotion } from '@/components/luna/LunaCompanion';

interface LunaState {
  emotion: LunaEmotion;
  message: string;
  showMessage: boolean;
  level: number;
}

export const useLuna = () => {
  const { streak } = useStreak();
  const { totalPoints } = usePoints();
  const { profile } = useGamification();
  const [lunaState, setLunaState] = useState<LunaState>({
    emotion: 'calm',
    message: '',
    showMessage: false,
    level: 1,
  });

  // Update level when profile changes
  useEffect(() => {
    if (profile?.current_level) {
      setLunaState(prev => ({ ...prev, level: profile.current_level }));
    }
  }, [profile?.current_level]);

  // React to user progress
  useEffect(() => {
    if (streak >= 7) {
      setLunaState(prev => ({
        ...prev,
        emotion: 'proud',
        message: "Wow! 7 days in a row! You're unstoppable! 🌟",
        showMessage: true,
      }));
    } else if (streak >= 3) {
      setLunaState(prev => ({
        ...prev,
        emotion: 'happy',
        message: "Great streak! Keep up the amazing work! ✨",
        showMessage: true,
      }));
    } else if (totalPoints >= 100) {
      setLunaState(prev => ({
        ...prev,
        emotion: 'happy',
        message: "You're doing wonderful! So proud of you! 💫",
        showMessage: true,
      }));
    }
  }, [streak, totalPoints]);

  const celebrate = (achievement: string) => {
    setLunaState(prev => ({
      ...prev,
      emotion: 'proud',
      message: `🎉 ${achievement}! You're amazing!`,
      showMessage: true,
    }));

    // Auto-hide after 5 seconds
    setTimeout(() => {
      setLunaState((prev) => ({ ...prev, showMessage: false }));
    }, 5000);
  };

  const encourage = () => {
    const messages = [
      "You've got this! One step at a time. 💙",
      "I'm here with you. You're not alone. 🌸",
      "Every small step counts. I believe in you! ✨",
      "Take a deep breath. You're doing great. 🌊",
    ];

    setLunaState(prev => ({
      ...prev,
      emotion: 'calm',
      message: messages[Math.floor(Math.random() * messages.length)],
      showMessage: true,
    }));
  };

  const comfort = () => {
    setLunaState(prev => ({
      ...prev,
      emotion: 'worried',
      message: "I'm here for you. Let's take this moment together. 💜",
      showMessage: true,
    }));
  };

  const dismiss = () => {
    setLunaState((prev) => ({ ...prev, showMessage: false }));
  };

  return {
    ...lunaState,
    celebrate,
    encourage,
    comfort,
    dismiss,
    level: lunaState.level,
  };
};
