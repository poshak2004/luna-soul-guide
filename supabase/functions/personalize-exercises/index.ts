import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { recentMoods, exerciseHistory, requestType } = await req.json();

    console.log('Personalization request:', { requestType, recentMoods, exerciseHistory });

    const systemPrompt = requestType === 'suggestions' 
      ? `You are a mindful wellness coach. Based on the user's recent mood patterns and exercise history, suggest 2-3 exercises that would be most beneficial right now. Be empathetic, encouraging, and specific.`
      : requestType === 'affirmation'
      ? `You are a compassionate affirmation generator. Create a personalized, uplifting affirmation based on the user's current emotional state. Keep it concise (1-2 sentences), positive, and empowering.`
      : `You are a reflective journaling assistant. Provide a gentle, thought-provoking prompt or reflection based on the user's journal entry. Be supportive and help them explore their thoughts deeper.`;

    const userPrompt = requestType === 'suggestions'
      ? `Recent moods: ${recentMoods.join(', ')}. Exercise history: ${exerciseHistory.join(', ')}. What exercises would help me most right now?`
      : requestType === 'affirmation'
      ? `My current mood is ${recentMoods[0] || 'neutral'}. Generate a personalized affirmation for me.`
      : `Here's my journal entry: "${recentMoods[0]}". Provide a reflective prompt to help me explore this further.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error('Failed to get AI response');
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('AI response generated successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        response: aiResponse,
        requestType 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in personalize-exercises:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
