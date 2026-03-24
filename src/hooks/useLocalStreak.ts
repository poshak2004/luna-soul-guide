import { useState, useCallback } from 'react';

const STREAK_KEY = 'wellness_streak';
const LAST_SESSION_KEY = 'wellness_last_session';
const WEEKLY_LOG_KEY = 'wellness_weekly_log';

const getToday = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const getDateDiffDays = (a: string, b: string): number => {
  const da = new Date(a + 'T00:00:00');
  const db = new Date(b + 'T00:00:00');
  return Math.round((da.getTime() - db.getTime()) / (1000 * 60 * 60 * 24));
};

const getLast7Days = (): string[] => {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
  }
  return days;
};

export interface StreakResult {
  increased: boolean;
  reset: boolean;
  currentStreak: number;
}

export const useLocalStreak = () => {
  const [streak, setStreak] = useState(() => parseInt(localStorage.getItem(STREAK_KEY) || '0', 10));
  const [lastSession, setLastSession] = useState(() => localStorage.getItem(LAST_SESSION_KEY) || '');
  const [weeklyDays, setWeeklyDays] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(WEEKLY_LOG_KEY) || '[]'); } catch { return []; }
  });

  const weeklyCount = (() => {
    const last7 = getLast7Days();
    return weeklyDays.filter(d => last7.includes(d)).length;
  })();

  const recordSession = useCallback((): StreakResult => {
    const today = getToday();
    const prev = localStorage.getItem(LAST_SESSION_KEY) || '';

    // Already recorded today
    if (prev === today) {
      return { increased: false, reset: false, currentStreak: streak };
    }

    let newStreak: number;
    let increased = false;
    let reset = false;

    if (prev && getDateDiffDays(today, prev) === 1) {
      // Consecutive day
      newStreak = streak + 1;
      increased = true;
    } else if (!prev || getDateDiffDays(today, prev) > 1) {
      // Missed a day or first session
      newStreak = 1;
      reset = prev !== '';
    } else {
      newStreak = streak;
    }

    localStorage.setItem(STREAK_KEY, String(newStreak));
    localStorage.setItem(LAST_SESSION_KEY, today);

    // Update weekly log (keep last 14 days max)
    const updated = [...new Set([...weeklyDays, today])].slice(-14);
    localStorage.setItem(WEEKLY_LOG_KEY, JSON.stringify(updated));

    setStreak(newStreak);
    setLastSession(today);
    setWeeklyDays(updated);

    return { increased, reset, currentStreak: newStreak };
  }, [streak, weeklyDays]);

  return { streak, lastSession, weeklyCount, recordSession };
};
