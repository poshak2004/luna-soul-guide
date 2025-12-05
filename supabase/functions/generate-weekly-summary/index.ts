import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { moodData, activityData, streakDays, totalPoints } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const prompt = `You are Luna, a warm and empathetic AI wellness companion. Generate a personalized weekly wellness summary based on this data:

Mood Data (last 7 days): ${JSON.stringify(moodData || [])}
Activities Completed: ${JSON.stringify(activityData || [])}
Current Streak: ${streakDays || 0} days
Total Points: ${totalPoints || 0}

Please provide:
1. A warm greeting and acknowledgment of their progress
2. Key mood patterns you noticed (be specific but gentle)
3. What activities seemed to help most
4. One gentle suggestion for next week
5. An encouraging closing message

Keep the tone warm, supportive, and celebratory of any progress. Use emojis sparingly. Response should be 150-200 words.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are Luna, a compassionate AI wellness guide." },
          { role: "user", content: prompt },
        ],
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const summary = data.choices?.[0]?.message?.content || "Keep up the great work on your wellness journey!";

    return new Response(JSON.stringify({ summary }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Weekly summary error:", error);
    return new Response(
      JSON.stringify({ 
        summary: "You're making progress on your wellness journey. Keep going! 🌸",
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
