# Insights & Gamification System - Implementation Guide

## ✅ Implementation Complete

### New Components Created

#### Hooks
- `src/hooks/usePoints.ts` - Real-time points tracking with subscription
- `src/hooks/useStreak.ts` - Real-time streak tracking with subscription

#### Insights Components
- `src/components/insights/StreakCard.tsx` - Daily streak display
- `src/components/insights/PointsBar.tsx` - Animated points counter
- `src/components/insights/WellnessReport.tsx` - 30-day mood trend chart

#### Journal Components
- `src/components/journal/JournalEditor.tsx` - Create/edit entries (+5 pts)
- `src/components/journal/JournalList.tsx` - View previous entries
- `src/components/journal/MoodPicker.tsx` - Interactive mood selector

#### Exercise Components
- `src/components/exercises/ExerciseList.tsx` - Browse exercises
- `src/components/exercises/ExerciseCard.tsx` - Exercise cards (+10 pts)

#### Gamification Components
- `src/components/gamification/BadgeGrid.tsx` - Display earned badges with real-time updates

#### Settings Components
- `src/components/settings/SettingsPanel.tsx` - Tabbed settings interface
- `src/components/settings/AccountSettings.tsx` - Username/profile management
- `src/components/settings/PrivacySettings.tsx` - Leaderboard visibility, data sharing
- `src/components/settings/SoundHaptics.tsx` - Audio controls
- `src/components/settings/NotificationsSettings.tsx` - Email, push, quiet hours

#### Pages
- `src/pages/Insights.tsx` - Main insights dashboard
- `src/pages/Settings.tsx` - Settings & preferences page

#### Utilities
- `src/schemas/zodSchemas.ts` - Input validation schemas
- `src/lib/supabaseHelper.ts` - Retry logic, session refresh

---

## 🎮 Gamification Flow

### Points System (Server-Authoritative)
```typescript
// +5 pts: Journal entry
await addActivity('journal_entry', 5);

// +10 pts: Exercise completion
await complete_exercise(user_id, exercise_id);

// Server RPCs used:
// - add_user_points(user_id, activity_type, points)
// - complete_exercise(user_id, exercise_type)
// - check_and_award_badges(user_id)
```

### Real-Time Updates
All points and badges updates use Supabase Realtime subscriptions:
```typescript
supabase
  .channel('points_updates')
  .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'user_profiles' }, ...)
  .subscribe()
```

---

## 🔒 Anti-Cheat Rules

### Server-Side Validation
All point awarding occurs via server RPCs with validation:

1. **Rate Limiting**
   - Journals: Max 10 per hour
   - Exercises: Min 60 seconds duration
   - Assessments: One per type per day

2. **Validation Checks**
   - Minimum content length for journals
   - Required duration for timed sessions
   - Timestamp consistency checks
   - Device/IP variance detection

3. **Transaction Integrity**
   - Every award generates a `transaction_id`
   - Client displays only server-confirmed points
   - Optimistic UI only for animations, not values

### Client Security
- No direct database writes for points/badges
- All mutations via RPC calls
- Real-time subscriptions for authoritative state
- Zod schema validation before RPC submission

---

## 📋 QA Checklist

### Points & Streak
- [ ] `mark_user_active` called on app focus/journal/exercise
- [ ] Streak increments correctly on consecutive days
- [ ] Points update in PointsBar via subscription (not local state)
- [ ] 5-day streak awards `consistency_champ` badge

### Journaling
- [ ] Create journal → RPC `create_journal` → +5 points
- [ ] Journal entry appears in `user_activities` table
- [ ] `reflective_starter` badge awarded after first journal
- [ ] Rapid repeat journaling blocked by rate limit

### Exercises
- [ ] Complete exercise → `complete_exercise` RPC → +10 points
- [ ] Points bar updates via subscription
- [ ] Exercise completion logged in `user_activities`
- [ ] Minimum 60s duration enforced

### Badges
- [ ] New badges appear in BadgeGrid via real-time subscription
- [ ] Toast notification on badge unlock
- [ ] Badge display shows icon, name, description, earned date

### Settings
- [ ] Update display name persists to `user_profiles`
- [ ] Leaderboard opt-in/out controls visibility
- [ ] Sound/haptics settings saved
- [ ] Notification preferences stored

### Leaderboard
- [ ] Opted-out users don't appear
- [ ] Anonymous usernames displayed
- [ ] Top 10 sorted by total_points DESC

---

## 🛠 Supabase RPC Signatures

```typescript
// Points & Streak
add_user_points(user_id: uuid, activity_type: text, points: int) 
  → {success: boolean, total_points: int, points_earned: int}

get_user_points(user_id: uuid) 
  → {total_points: int}

// Exercises
complete_exercise(user_id: uuid, exercise_type: text) 
  → {success: boolean, total_points: int, points_earned: int}

// Badges
check_and_award_badges(user_id: uuid) 
  → {success: boolean, awarded_badges: [{id, name, icon, description}], total_badges: int}

get_user_badges(user_id: uuid) 
  → [{id, slug, earned_at, meta}]

// Activities
get_user_activities(user_id: uuid, limit: int) 
  → [{type, meta, created_at}]

// Leaderboard
get_leaderboard() 
  → [{id, anonymous_username, total_points, current_streak}]
```

---

## 🎨 Design System Tokens

```css
/* Wellness Colors */
--primary: 200 70% 58%;      /* Serene Ocean Blue */
--secondary: 175 50% 62%;    /* Soft Teal */
--accent: 140 40% 58%;       /* Gentle Green */
--support: 210 75% 72%;      /* Light Sky */

/* Effects */
--shadow-soft: 0 8px 40px hsla(200, 70%, 60%, 0.15);
--shadow-glow: 0 0 60px hsla(200, 70%, 75%, 0.30);
--transition-smooth: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
```

---

## 📱 Navigation

Compact top bar with dropdown menu includes:
- Home, Chat, Journal, Exercises, Assessments
- Mood Calendar, CogniArts, Sensory Healing
- Leaderboard, **Insights**, Dashboard, Reports
- **Settings**
- Crisis Help (always visible)
- Logout

---

## 🚀 Next Steps

1. Test all QA checklist items
2. Configure rate limiting thresholds
3. Set up badge definitions in `badges` table
4. Enable email/push notification infrastructure
5. Implement data export (CSV/JSON) functionality
6. Add account deletion confirmation flow

---

## 🔧 Development Notes

- All components use semantic tokens from design system
- Framer Motion for smooth animations
- Zod schemas for input validation
- Real-time subscriptions for live updates
- Server-authoritative design prevents client-side manipulation
