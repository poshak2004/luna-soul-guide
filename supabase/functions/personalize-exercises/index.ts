import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation
function validateInput(body: any): { recentMoods: string[]; exerciseHistory: string[]; requestType: string; error?: string } {
  const validRequestTypes = ['suggestions', 'affirmation', 'journal'];
  
  if (!body.requestType || !validRequestTypes.includes(body.requestType)) {
    return { recentMoods: [], exerciseHistory: [], requestType: '', error: 'Invalid request type' };
  }

  const recentMoods = Array.isArray(body.recentMoods) ? body.recentMoods.slice(0, 10) : [];
  const exerciseHistory = Array.isArray(body.exerciseHistory) ? body.exerciseHistory.slice(0, 20) : [];

  return { recentMoods, exerciseHistory, requestType: body.requestType };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get and verify user authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate input
    const body = await req.json();
    const { recentMoods, exerciseHistory, requestType, error: validationError } = validateInput(body);
    if (validationError) {
      return new Response(
        JSON.stringify({ error: validationError }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Service temporarily unavailable' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[Personalize] User ${user.id} - ${requestType}`);

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
      return new Response(
        JSON.stringify({ error: 'Unable to generate personalized content. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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
        error: 'An error occurred. Please try again.'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});