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
    const { text } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `Analyze the emotional tone of the text and return a JSON object with:
{
  "mood": "happy" | "calm" | "anxious" | "sad" | "stressed" | "neutral",
  "intensity": 1-10,
  "keywords": ["emotion1", "emotion2"],
  "insight": "brief supportive insight (1 sentence)"
}`,
          },
          {
            role: "user",
            content: text,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "analyze_mood",
              description: "Analyze the mood and emotional content of text",
              parameters: {
                type: "object",
                properties: {
                  mood: {
                    type: "string",
                    enum: ["happy", "calm", "anxious", "sad", "stressed", "neutral"],
                  },
                  intensity: {
                    type: "number",
                    minimum: 1,
                    maximum: 10,
                  },
                  keywords: {
                    type: "array",
                    items: { type: "string" },
                  },
                  insight: {
                    type: "string",
                  },
                },
                required: ["mood", "intensity", "keywords", "insight"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "analyze_mood" } },
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to analyze mood");
    }

    const data = await response.json();
    const toolCall = data.choices[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error("No mood analysis returned");
    }

    const analysis = JSON.parse(toolCall.function.arguments);
    
    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Mood analysis error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
