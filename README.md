# Luna: AI Mental-Wellness Companion

A full-stack wellness app built around **Luna**, an empathetic AI guide. It combines streaming chat, standardized self-assessments, mood tracking, journaling and guided exercises, with crisis resources one tap away.

> Luna is a self-help tool, **not** a substitute for professional care. The chat is instructed to point people in crisis to professional resources, and the app has a dedicated Crisis page (988, Crisis Text Line).

## Features

| Area | What's there |
|---|---|
| 💬 **Chat** | Streaming (SSE) conversations with Luna; input validation (1–50 messages); saved conversation history |
| 📋 **Assessments** | PHQ-9, GAD-7, DASS-21 with scoring and LLM-written interpretations, plus deterministic fallback text when the model is unavailable |
| 🙂 **Mood** | LLM mood analysis of free text via **structured tool-calling** (JSON schema), mood calendar, daily logs |
| 📓 **Journal** | Editor, mood picker, AI-generated reflective prompts |
| 🧘 **Exercises** | Therapy exercise library, LLM-personalized suggestions |
| 📈 **Insights** | 30-day mood trends, AI weekly summaries, wellness reports |
| 🎮 **Engagement** | Points, streaks, badges and a leaderboard, with real-time Supabase subscriptions |
| 🎙 **Voice** | Voice companion with speech input |
| 🎨 **Extras** | CogniArts (art-based reflection), sensory/sound healing with an admin sound manager |
| 🆘 **Crisis** | Hotline directory always reachable from navigation |

## Architecture

```
React + TypeScript (Vite, shadcn-ui, Tailwind)
   │  Supabase Auth · Postgres (RLS) · Realtime
   ▼
Supabase Edge Functions (Deno)
   ├─ chat                       streaming SSE responses
   ├─ analyze-mood               tool-calling → structured mood JSON
   ├─ interpret-assessment       PHQ-9 / GAD-7 / DASS-21 interpretation + fallback
   ├─ personalize-exercises
   ├─ generate-journal-prompts
   └─ generate-weekly-summary
   ▼
LLM: Gemini 2.5 Flash via an OpenAI-compatible gateway
```

- **20+ Postgres tables** across 16 migrations (profiles, conversations, mood logs, assessments, journal, badges, activities…) with row-level security
- Model keys live only in the edge functions; the client never sees them

## Run it

```bash
npm install
npm run dev
```

You'll need a Supabase project. Apply `supabase/migrations`, deploy `supabase/functions`, and set the gateway API key as a function secret.

---

<sub>Scaffolded with Lovable, then extended into a multi-feature app. Gamification details: <a href="INSIGHTS_GAMIFICATION_README.md">INSIGHTS_GAMIFICATION_README.md</a>.</sub>
