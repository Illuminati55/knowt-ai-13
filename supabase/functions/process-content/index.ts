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
    console.log('Starting content processing...');
    
    const { url, userId, contentId } = await req.json();
    
    if (!url || !userId || !contentId) {
      throw new Error('Missing required parameters: url, userId, or contentId');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Update status to processing
    await supabase
      .from('content')
      .update({ processing_status: 'processing' })
      .eq('id', contentId);

    console.log('Updated status to processing');

    // Extract thumbnail in parallel
    const thumbnailPromise = extractThumbnail(url);

    // Fetch and analyze content with Gemini
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not found');
    }

    // Fetch content from URL
    let pageContent = '';
    try {
      const response = await fetch(url);
      pageContent = await response.text();
      
      // Simple content extraction (removing HTML tags)
      pageContent = pageContent
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]*>/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 8000); // Limit content length
        
    } catch (error) {
      console.error('Error fetching content:', error);
      throw new Error('Failed to fetch content from URL');
    }

    console.log('Content fetched, length:', pageContent.length);

    // Analyze content with Gemini
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
                  text: `Analyze the following content and provide a structured response in JSON format with these fields:
                  - title: A clear, concise title for this content
                  - summary: A 2-3 sentence summary
                  - tags: An array of 3-5 relevant tags/keywords
                  - key_takeaways: An array of 2-4 key insights or important points
                  - source_type: Determine if this is "web", "youtube", "linkedin", or "document"

                  Content: ${pageContent}
                  
                  Respond with valid JSON only.`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.1,
            topK: 32,
            topP: 1,
            maxOutputTokens: 1000,
          }
        })
      }
    );

    console.log('Gemini API response status:', geminiResponse.status);

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API error: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    console.log('Gemini response received');

    // Parse the AI response
    let analysisResult;
    try {
      const textResponse = geminiData.candidates[0].content.parts[0].text;
      // Clean up the response to extract JSON
      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (error) {
      console.error('Error parsing AI response:', error);
      // Fallback analysis
      analysisResult = {
        title: 'Extracted Content',
        summary: 'Content extracted and processed successfully.',
        tags: ['content', 'web'],
        key_takeaways: ['Content was successfully processed'],
        source_type: 'web'
      };
    }

    console.log('Analysis result:', analysisResult);

    // Wait for thumbnail extraction to complete
    const thumbnailUrl = await thumbnailPromise;
    console.log('Thumbnail extracted:', thumbnailUrl);

    // Update content in database
    const { error: updateError } = await supabase
      .from('content')
      .update({
        title: analysisResult.title,
        summary: analysisResult.summary,
        content_text: pageContent.slice(0, 2000), // Store first 2000 chars
        tags: analysisResult.tags || [],
        key_takeaways: analysisResult.key_takeaways || [],
        source: analysisResult.source_type || 'web',
        thumbnail_url: thumbnailUrl,
        processing_status: 'completed'
      })
      .eq('id', contentId);

    if (updateError) {
      console.error('Database update error:', updateError);
      throw updateError;
    }

    console.log('Content updated successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Content processed successfully',
        result: analysisResult 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error processing content:', error);
    
    // Update status to failed if we have the contentId
    try {
      const { contentId } = await req.json().catch(() => ({}));
      if (contentId) {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        await supabase
          .from('content')
          .update({ processing_status: 'failed' })
          .eq('id', contentId);
      }
    } catch (e) {
      console.error('Failed to update error status:', e);
    }
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

async function extractThumbnail(url: string): Promise<string | null> {
  try {
    console.log('Extracting thumbnail for:', url);
    
    const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/extract-thumbnail`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
      },
      body: JSON.stringify({ url })
    });

    if (response.ok) {
      const result = await response.json();
      return result.success ? result.thumbnailUrl : null;
    }
    
    console.log('Thumbnail extraction failed:', response.status);
    return null;
  } catch (error) {
    console.error('Error extracting thumbnail:', error);
    return null;
  }
}