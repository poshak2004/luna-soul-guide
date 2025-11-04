import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation
function validateInput(body: any): { valid: boolean; error?: string; data?: any } {
  const validAssessmentTypes = ['DASS-21', 'PHQ-9', 'GAD-7'];
  
  if (!body.assessmentType || !validAssessmentTypes.includes(body.assessmentType)) {
    return { valid: false, error: 'Invalid assessment type' };
  }

  if (typeof body.totalScore !== 'number' || body.totalScore < 0 || body.totalScore > 100) {
    return { valid: false, error: 'Invalid total score' };
  }

  if (!body.severityLevel) {
    return { valid: false, error: 'Severity level required' };
  }

  return { 
    valid: true, 
    data: {
      assessmentType: body.assessmentType,
      totalScore: body.totalScore,
      severityLevel: body.severityLevel,
      subscales: body.subscales || null,
    }
  };
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
    const validation = validateInput(body);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { assessmentType, totalScore, severityLevel, subscales } = validation.data!;

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ 
          success: true, 
          interpretation: getFallbackInterpretation(assessmentType, severityLevel)
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[Interpret] User ${user.id} - ${assessmentType} score: ${totalScore}`);

    let systemPrompt = `You are Luna, a warm and empathetic mental wellness guide specializing in clinical assessment interpretation. 
Your role is to provide compassionate, clear, and actionable insights based on assessment results. 
Always be gentle, understanding, and encouraging while being honest about the results.
Keep your response to 3-4 paragraphs maximum.`;

    let userPrompt = '';

    if (assessmentType === 'DASS-21') {
      userPrompt = `A user has completed the DASS-21 assessment with the following results:
- Depression: ${subscales.depression} (${severityLevel.depression || 'Unknown'})
- Anxiety: ${subscales.anxiety} (${severityLevel.anxiety || 'Unknown'})
- Stress: ${subscales.stress} (${severityLevel.stress || 'Unknown'})
- Total Score: ${totalScore}

Please provide a compassionate interpretation that:
1. Acknowledges their results with empathy
2. Explains what these scores mean in everyday terms
3. Offers gentle encouragement and next steps
4. Suggests specific coping strategies relevant to their scores`;
    } else if (assessmentType === 'PHQ-9') {
      userPrompt = `A user has completed the PHQ-9 (depression screening) with:
- Total Score: ${totalScore}
- Severity Level: ${severityLevel}

Please provide a caring interpretation that:
1. Validates their experience with compassion
2. Explains the severity level in relatable terms
3. Offers hope and concrete next steps
4. Suggests specific self-care activities`;
    } else if (assessmentType === 'GAD-7') {
      userPrompt = `A user has completed the GAD-7 (anxiety screening) with:
- Total Score: ${totalScore}
- Severity Level: ${severityLevel}

Please provide a supportive interpretation that:
1. Acknowledges their anxiety with understanding
2. Explains what this level means for daily life
3. Offers reassurance and practical strategies
4. Suggests grounding and calming techniques`;
    }

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
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          interpretation: getFallbackInterpretation(assessmentType, severityLevel)
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const interpretation = data.choices[0].message.content;

    console.log('AI interpretation generated successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        interpretation 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in interpret-assessment:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'An error occurred',
        interpretation: 'Thank you for completing this assessment. Your results have been recorded and can help you track your mental wellness journey over time.'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function getFallbackInterpretation(assessmentType: string, severityLevel: any): string {
  const level = typeof severityLevel === 'string' ? severityLevel.toLowerCase() : '';
  
  if (level.includes('minimal') || level.includes('normal')) {
    return `Your ${assessmentType} results indicate you're experiencing minimal symptoms at this time. This is a positive sign that your current coping strategies are working well. Continue with your self-care practices, maintain healthy routines, and remember that it's always okay to seek support if things change.`;
  } else if (level.includes('mild')) {
    return `Your ${assessmentType} results show mild symptoms. This is common and manageable with the right tools. Consider incorporating daily mindfulness exercises, regular physical activity, and maintaining a consistent sleep schedule. Our guided exercises can help you build resilience and develop healthy coping mechanisms.`;
  } else if (level.includes('moderate')) {
    return `Your ${assessmentType} results indicate moderate symptoms that may be affecting your daily life. This is an important time to prioritize your mental wellness. Consider exploring our therapeutic exercises, maintaining connections with supportive people, and if symptoms persist, speaking with a mental health professional could provide valuable support.`;
  } else if (level.includes('severe')) {
    return `Your ${assessmentType} results show severe symptoms that likely impact your daily functioning significantly. Please know that you're not alone, and help is available. We strongly encourage you to reach out to a mental health professional for personalized support. In the meantime, our crisis resources are always available, and small steps like breathing exercises can provide immediate relief.`;
  }
  
  return `Thank you for completing this assessment. Your results provide valuable insight into your current mental wellness. We encourage you to explore our guided exercises and track your progress over time. Remember, seeking support is a sign of strength.`;
}