import { useState, useEffect, useCallback } from 'react';
import { useStreak } from './useStreak';
import { usePoints } from './usePoints';
import { useGamification } from './useGamification';
import { supabase } from '@/integrations/supabase/client';
import { 
  lunaMessages, 
  getRandomMessage, 
  getTimeBasedGreeting, 
  getStreakMessage,
  getPageMessage 
} from '@/components/luna/LunaMessages';
import type { LunaEmotion } from '@/components/luna/LunaCompanion';

interface LunaState {
  emotion: LunaEmotion;
  message: string;
  showMessage: boolean;
  level: number;
}

type PageContext = 
  | 'dashboard' 
  | 'journal' 
  | 'exercises' 
  | 'chat' 
  | 'sensoryHealing' 
  | 'cogniarts' 
  | 'insights' 
  | 'assessments' 
  | 'moodCalendar' 
  | 'crisis' 
  | 'leaderboard' 
  | 'settings';

export const useLuna = (pageContext?: PageContext) => {
  const { streak } = useStreak();
  const { totalPoints } = usePoints();
  const { profile } = useGamification();
  const [lunaState, setLunaState] = useState<LunaState>({
    emotion: 'calm',
    message: '',
    showMessage: false,
    level: 1,
  });
  const [lastActivityDate, setLastActivityDate] = useState<string | null>(null);
  const [recentMoodScore, setRecentMoodScore] = useState<number | null>(null);
  const [hasShownPageMessage, setHasShownPageMessage] = useState(false);

  // Update level when profile changes
  useEffect(() => {
    if (profile?.current_level) {
      setLunaState(prev => ({ ...prev, level: profile.current_level }));
    }
    if (profile?.last_activity_date) {
      setLastActivityDate(profile.last_activity_date);
    }
  }, [profile?.current_level, profile?.last_activity_date]);

  // Fetch recent mood data
  useEffect(() => {
    const fetchRecentMood = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('mood_calendar')
        .select('mood_score')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data) {
        setRecentMoodScore(data.mood_score);
      }
    };

    fetchRecentMood();
  }, []);

  // Check inactivity and set appropriate emotion
  useEffect(() => {
    if (!lastActivityDate) return;

    const lastDate = new Date(lastActivityDate);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff >= 5) {
      // Long inactivity - Luna is worried
      setLunaState(prev => ({
        ...prev,
        emotion: 'worried',
        message: getRandomMessage(lunaMessages.inactivity.long),
        showMessage: true,
      }));
    } else if (daysDiff >= 2) {
      // Short inactivity - Luna is sleepy
      setLunaState(prev => ({
        ...prev,
        emotion: 'sleepy',
        message: getRandomMessage(lunaMessages.inactivity.short),
        showMessage: true,
      }));
    }
  }, [lastActivityDate]);

  // React to recent mood
  useEffect(() => {
    if (recentMoodScore === null) return;

    if (recentMoodScore <= 3) {
      // Low mood - Luna becomes worried and supportive
      setLunaState(prev => ({
        ...prev,
        emotion: 'worried',
        message: getRandomMessage(lunaMessages.lowMood),
        showMessage: true,
      }));
    } else if (recentMoodScore >= 8) {
      // High mood - Luna is happy
      setLunaState(prev => ({
        ...prev,
        emotion: 'happy',
        message: "You're feeling great today! That makes me so happy! 🌟",
        showMessage: true,
      }));
    }
  }, [recentMoodScore]);

  // React to user progress (streaks)
  useEffect(() => {
    const streakMessage = getStreakMessage(streak);
    if (streakMessage) {
      setLunaState(prev => ({
        ...prev,
        emotion: streak >= 7 ? 'proud' : 'happy',
        message: streakMessage,
        showMessage: true,
      }));
    }
  }, [streak]);

  // React to points milestones
  useEffect(() => {
    if (totalPoints >= 1000) {
      setLunaState(prev => ({
        ...prev,
        emotion: 'proud',
        message: "1000 points! 👑 You're a wellness legend!",
        showMessage: true,
      }));
    } else if (totalPoints >= 500) {
      setLunaState(prev => ({
        ...prev,
        emotion: 'proud',
        message: "500 points reached! 🏆 Incredible journey!",
        showMessage: true,
      }));
    } else if (totalPoints >= 100) {
      setLunaState(prev => ({
        ...prev,
        emotion: 'happy',
        message: "You're doing wonderful! 100 points earned! 💫",
        showMessage: true,
      }));
    }
  }, [totalPoints]);

  // Page-specific messages
  useEffect(() => {
    if (!pageContext || hasShownPageMessage) return;

    // Crisis page gets special handling
    if (pageContext === 'crisis') {
      setLunaState(prev => ({
        ...prev,
        emotion: 'worried',
        message: getPageMessage('crisis'),
        showMessage: true,
      }));
      setHasShownPageMessage(true);
      return;
    }

    // Show page-specific message after a brief delay
    const timer = setTimeout(() => {
      setLunaState(prev => ({
        ...prev,
        emotion: 'calm',
        message: getPageMessage(pageContext),
        showMessage: true,
      }));
      setHasShownPageMessage(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, [pageContext, hasShownPageMessage]);

  const celebrate = useCallback((achievement: string) => {
    const celebrationMsg = getRandomMessage(lunaMessages.achievement);
    setLunaState(prev => ({
      ...prev,
      emotion: 'proud',
      message: `${celebrationMsg} ${achievement}!`,
      showMessage: true,
    }));

    // Auto-hide after 5 seconds
    setTimeout(() => {
      setLunaState(prev => ({ ...prev, showMessage: false }));
    }, 5000);
  }, []);

  const levelUp = useCallback((newLevel: number) => {
    setLunaState(prev => ({
      ...prev,
      emotion: 'proud',
      message: getRandomMessage(lunaMessages.levelUp),
      showMessage: true,
      level: newLevel,
    }));

    setTimeout(() => {
      setLunaState(prev => ({ ...prev, showMessage: false }));
    }, 5000);
  }, []);

  const encourage = useCallback(() => {
    setLunaState(prev => ({
      ...prev,
      emotion: 'calm',
      message: getRandomMessage(lunaMessages.encouragement),
      showMessage: true,
    }));
  }, []);

  const comfort = useCallback(() => {
    setLunaState(prev => ({
      ...prev,
      emotion: 'worried',
      message: getRandomMessage(lunaMessages.crisis),
      showMessage: true,
    }));
  }, []);

  const greet = useCallback(() => {
    setLunaState(prev => ({
      ...prev,
      emotion: 'happy',
      message: getTimeBasedGreeting(),
      showMessage: true,
    }));
  }, []);

  const showCrisisSupport = useCallback(() => {
    setLunaState(prev => ({
      ...prev,
      emotion: 'worried',
      message: getRandomMessage(lunaMessages.crisis),
      showMessage: true,
    }));
  }, []);

  const dismiss = useCallback(() => {
    setLunaState(prev => ({ ...prev, showMessage: false }));
  }, []);

  const setEmotion = useCallback((emotion: LunaEmotion) => {
    setLunaState(prev => ({ ...prev, emotion }));
  }, []);

  const displayMessage = useCallback((message: string, emotion?: LunaEmotion) => {
    setLunaState(prev => ({
      ...prev,
      emotion: emotion || prev.emotion,
      message,
      showMessage: true,
    }));
  }, []);

  return {
    ...lunaState,
    celebrate,
    levelUp,
    encourage,
    comfort,
    greet,
    showCrisisSupport,
    dismiss,
    setEmotion,
    displayMessage,
    level: lunaState.level,
  };
};
