import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting AI insights generation...');
    
    const { userId, contentIds = [], query = '' } = await req.json();
    
    if (!userId) {
      throw new Error('Missing userId parameter');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get user's content for analysis
    let contentQuery = supabase
      .from('content')
      .select('title, summary, content_text, tags, key_takeaways')
      .eq('user_id', userId)
      .eq('processing_status', 'completed');
    
    if (contentIds.length > 0) {
      contentQuery = contentQuery.in('id', contentIds);
    } else {
      contentQuery = contentQuery.limit(20); // Limit to recent content
    }

    const { data: userContent, error: contentError } = await contentQuery;
    
    if (contentError) {
      throw contentError;
    }

    if (!userContent || userContent.length === 0) {
      return new Response(
        JSON.stringify({ 
          insights: 'No processed content found to analyze. Please add and process some content first.',
          patterns: [],
          recommendations: []
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`Analyzing ${userContent.length} content items`);

    // Prepare content for AI analysis
    const contentSummary = userContent.map(item => ({
      title: item.title,
      summary: item.summary,
      tags: item.tags,
      takeaways: item.key_takeaways
    }));

    // Generate insights with Gemini
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not found');
    }

    const prompt = query ? 
      `Based on the user's content collection, answer this specific question: "${query}"

Content collection: ${JSON.stringify(contentSummary)}

Provide insights and recommendations based on their saved content.` :
      
      `Analyze this user's content collection and provide insights in JSON format with these fields:
- insights: A comprehensive analysis of their interests and knowledge patterns
- patterns: An array of 3-4 key patterns you notice in their content
- recommendations: An array of 3-4 actionable recommendations for further learning
- topics: An array of the main topics they're interested in

Content collection: ${JSON.stringify(contentSummary)}

Respond with valid JSON only.`;

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.3,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1500,
          }
        })
      }
    );

    console.log('Gemini API response status:', geminiResponse.status);

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API error: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    console.log('Gemini insights response received');

    // Parse the AI response
    let insightsResult;
    try {
      const textResponse = geminiData.candidates[0].content.parts[0].text;
      
      if (query) {
        // For query responses, return as plain text
        insightsResult = {
          insights: textResponse,
          patterns: [],
          recommendations: [],
          topics: []
        };
      } else {
        // For general analysis, expect JSON
        const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          insightsResult = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      }
    } catch (error) {
      console.error('Error parsing AI response:', error);
      // Fallback insights
      const topTags = userContent
        .flatMap(item => item.tags || [])
        .reduce((acc, tag) => {
          acc[tag] = (acc[tag] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
      const topTopics = Object.entries(topTags)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([tag]) => tag);

      insightsResult = {
        insights: `Based on your ${userContent.length} saved items, you show strong interests in ${topTopics.slice(0, 3).join(', ')}. Your content suggests a focus on learning and professional development.`,
        patterns: [
          'Consistent focus on technology and innovation',
          'Interest in practical, actionable content',
          'Preference for in-depth analysis'
        ],
        recommendations: [
          'Explore advanced topics in your areas of interest',
          'Consider creating content to share your knowledge',
          'Connect with others in your field of expertise'
        ],
        topics: topTopics
      };
    }

    console.log('Insights generated successfully');

    return new Response(
      JSON.stringify(insightsResult),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error generating insights:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        insights: 'Unable to generate insights at this time. Please try again later.',
        patterns: [],
        recommendations: []
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});