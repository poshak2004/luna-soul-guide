import { z } from 'zod';

// Comprehensive input validation schemas for security

export const JournalInputSchema = z.object({
  content: z.string()
    .trim()
    .min(1, 'Journal entry cannot be empty')
    .max(10000, 'Journal entry too long (max 10,000 characters)'),
  mood: z.enum(['happy', 'calm', 'neutral', 'anxious', 'sad', 'stressed', 'joyful']),
  tags: z.array(z.string().max(50)).max(10).optional(),
});

export const ChatMessageSchema = z.object({
  content: z.string()
    .trim()
    .min(1, 'Message cannot be empty')
    .max(4000, 'Message too long (max 4,000 characters)'),
});

export const MoodCalendarSchema = z.object({
  mood_label: z.enum(['happy', 'calm', 'neutral', 'anxious', 'sad', 'stressed']),
  mood_score: z.number().min(1).max(10),
  notes: z.string().max(2000, 'Notes too long (max 2,000 characters)').optional(),
  stress_level: z.number().min(1).max(10).optional(),
  energy_level: z.number().min(1).max(10).optional(),
  sleep_hours: z.number().min(0).max(24).optional(),
  activities: z.array(z.string().max(50)).max(10).optional(),
});

export const ExerciseCompleteSchema = z.object({
  exercise_type: z.enum(['breathing_exercise', 'meditation_exercise', 'grounding_exercise', 'progressive_exercise']),
  duration_seconds: z.number().min(60, 'Minimum 60 seconds required').max(7200).optional(),
});

export const SettingsSchema = z.object({
  sound_haptics: z.object({
    enabled: z.boolean(),
    volume: z.number().min(0).max(100),
  }),
  notifications: z.object({
    email: z.boolean(),
    push: z.boolean(),
    quiet_hours: z.object({
      enabled: z.boolean(),
      start: z.string(),
      end: z.string(),
    }),
  }),
  privacy: z.object({
    leaderboard_visible: z.boolean(),
    profile_public: z.boolean(),
  }),
  appearance: z.object({
    theme: z.enum(['light', 'dark', 'auto']),
    reduced_motion: z.boolean(),
  }),
});

export type JournalInput = z.infer<typeof JournalInputSchema>;
export type ExerciseComplete = z.infer<typeof ExerciseCompleteSchema>;
export type Settings = z.infer<typeof SettingsSchema>;