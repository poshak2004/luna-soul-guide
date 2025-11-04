import { z } from 'zod';

export const JournalInputSchema = z.object({
  mood: z.enum(['joyful', 'calm', 'neutral', 'sad', 'anxious', 'stressed']),
  content: z.string().min(1, 'Journal entry cannot be empty').max(5000),
  tags: z.array(z.string()).optional(),
});

export const ExerciseCompleteSchema = z.object({
  exercise_type: z.string(),
  duration_seconds: z.number().min(60, 'Minimum 60 seconds required'),
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
