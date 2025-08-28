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
    console.log('🚀 Starting content processing...');
    
    const { url, userId, contentId } = await req.json();
    console.log('📝 Processing request:', { url, userId, contentId });
    
    if (!url || !userId || !contentId) {
      throw new Error('Missing required parameters: url, userId, or contentId');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Update status to processing
    console.log('📊 Updating status to processing...');
    await supabase
      .from('content')
      .update({ processing_status: 'processing' })
      .eq('id', contentId);

    // Fetch Gemini API key
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not found in environment');
    }

    // Extract thumbnail in parallel
    const thumbnailPromise = extractThumbnail(url);

    // Fetch content from URL with robust handling
    let pageContent = '';
    let useWebSearch = false;
    
    try {
      console.log('🌐 Fetching content from URL:', url);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; CuratorAI/1.0; +https://curator.ai/bot)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Cache-Control': 'no-cache',
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.log('❌ Failed to fetch URL, status:', response.status);
        useWebSearch = true;
      } else {
        pageContent = await response.text();
        console.log('✅ Content fetched, raw length:', pageContent.length);
        
        // Simple content extraction (removing HTML tags)
        pageContent = pageContent
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
          .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
          .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
          .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, '')
          .replace(/<[^>]*>/g, ' ')
          .replace(/\s+/g, ' ')
          .replace(/\t+/g, ' ')
          .trim();

        // Check for problematic content patterns
        const problematicPatterns = [
          'copyright information',
          'contact information', 
          'privacy policy',
          'terms of service',
          'youtube footer',
          'standard youtube footer',
          'all rights reserved',
          'this content displays the standard',
          'please enable javascript',
          'javascript is required'
        ];
        
        const hasProblematicContent = problematicPatterns.some(pattern => 
          pageContent.toLowerCase().includes(pattern.toLowerCase())
        );
        
        const isContentTooShort = pageContent.length < 200;
        const isContentMostlyRepeated = pageContent.split(' ').length < 50;
        
        if (hasProblematicContent || isContentTooShort || isContentMostlyRepeated) {
          console.log('🔄 Problematic content detected, switching to web search');
          console.log('Reasons:', { hasProblematicContent, isContentTooShort, isContentMostlyRepeated });
          useWebSearch = true;
        } else {
          // Limit content length for processing
          pageContent = pageContent.slice(0, 8000);
          console.log('📄 Content cleaned, final length:', pageContent.length);
        }
      }
        
    } catch (error) {
      console.error('❌ Error fetching content:', error);
      useWebSearch = true; // Fallback to web search
    }

    // Analyze content with Gemini (with web search if needed)
    console.log('🤖 Starting Gemini analysis, useWebSearch:', useWebSearch);
    
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
                  text: useWebSearch 
                    ? `Search the web for information about this URL and analyze it: ${url}
                       
                       Provide a structured response in JSON format with these exact fields:
                       - title: A clear, concise title for this content
                       - summary: A 2-3 sentence summary of what this content is about
                       - tags: An array of 3-5 relevant tags/keywords
                       - key_takeaways: An array of 2-4 key insights or important points
                       - source_type: Determine if this is "web", "youtube", "linkedin", "medium", "substack", or "document"
                       
                       Return ONLY the JSON object, no additional text.`
                    : `Analyze the following content and provide a structured response in JSON format with these exact fields:
                       - title: A clear, concise title for this content
                       - summary: A 2-3 sentence summary
                       - tags: An array of 3-5 relevant tags/keywords  
                       - key_takeaways: An array of 2-4 key insights or important points
                       - source_type: Determine if this is "web", "youtube", "linkedin", "medium", "substack", or "document"

                       Content to analyze: ${pageContent}
                       
                       Return ONLY the JSON object, no additional text.`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.1,
            topK: 32,
            topP: 1,
            maxOutputTokens: 1000,
          },
          tools: useWebSearch ? [
            {
              googleSearchRetrieval: {}
            }
          ] : []
        })
      }
    );

    console.log('🤖 Gemini API response status:', geminiResponse.status);

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('❌ Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${geminiResponse.status} - ${errorText}`);
    }

    const geminiData = await geminiResponse.json();
    console.log('✅ Gemini response received');

    // Parse the AI response with robust error handling
    let analysisResult;
    try {
      const textResponse = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!textResponse) {
        throw new Error('No text response from Gemini API');
      }
      
      console.log('📋 Raw Gemini response:', textResponse.substring(0, 500) + '...');
      
      // Multiple attempts to extract JSON
      let jsonText = textResponse;
      
      // Try to extract JSON from code blocks
      const codeBlockMatch = textResponse.match(/```json\n([\s\S]*?)\n```/);
      if (codeBlockMatch) {
        jsonText = codeBlockMatch[1];
      }
      
      // Try to extract JSON object
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonText = jsonMatch[0];
      }
      
      // Clean up common issues
      jsonText = jsonText
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .replace(/^\s*/, '')
        .replace(/\s*$/, '');
      
      analysisResult = JSON.parse(jsonText);
      console.log('✅ Successfully parsed analysis result:', analysisResult);
      
      // Validate required fields
      if (!analysisResult.title || !analysisResult.source_type) {
        throw new Error('Missing required fields in analysis result');
      }
      
    } catch (parseError) {
      console.error('❌ Error parsing AI response:', parseError);
      
      // Enhanced fallback analysis based on URL
      const urlLower = url.toLowerCase();
      let sourceType = 'web';
      let titlePrefix = 'Content';
      
      if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) {
        sourceType = 'youtube';
        titlePrefix = 'YouTube Video';
      } else if (urlLower.includes('linkedin.com')) {
        sourceType = 'linkedin';
        titlePrefix = 'LinkedIn Post';
      } else if (urlLower.includes('medium.com')) {
        sourceType = 'medium';
        titlePrefix = 'Medium Article';
      } else if (urlLower.includes('substack.com')) {
        sourceType = 'substack';
        titlePrefix = 'Substack Post';
      }
      
      // Try to extract title from URL
      let urlTitle = url.split('/').pop() || '';
      urlTitle = urlTitle.replace(/[-_]/g, ' ').replace(/\.[^/.]+$/, '');
      
      analysisResult = {
        title: urlTitle ? `${titlePrefix}: ${urlTitle}` : `${titlePrefix} from ${sourceType}`,
        summary: 'AI processing encountered an issue, but the content has been saved successfully. You can still access the original content.',
        tags: [sourceType, 'content', 'saved'],
        key_takeaways: ['Content saved for later review', 'Original URL preserved for access'],
        source_type: sourceType
      };
      
      console.log('🔄 Using fallback analysis:', analysisResult);
    }

    // Wait for thumbnail extraction to complete
    const thumbnailUrl = await thumbnailPromise;
    console.log('🖼️ Thumbnail extraction result:', thumbnailUrl ? 'Success' : 'Failed');

    // Update content in database with detailed logging
    console.log('💾 Updating database with results...');
    const { data: updateData, error: updateError } = await supabase
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
      .eq('id', contentId)
      .select();

    if (updateError) {
      console.error('❌ Database update error:', updateError);
      throw updateError;
    }

    console.log('✅ Content updated successfully:', updateData);

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
    console.error('💥 Fatal error processing content:', error);
    
    // Parse request to get contentId for error handling
    let contentId: string | null = null;
    try {
      const requestClone = req.clone();
      const requestBody = await requestClone.json();
      contentId = requestBody.contentId;
    } catch (e) {
      console.error('Could not parse request for error handling:', e);
    }
    
    // Update status to failed if we have the contentId
    if (contentId) {
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        console.log('📝 Updating content to failed status:', contentId);
        await supabase
          .from('content')
          .update({ 
            processing_status: 'failed',
            title: 'Processing Failed',
            summary: `Failed to process content: ${error.message}`
          })
          .eq('id', contentId);
          
        console.log('✅ Error status updated successfully');
      } catch (updateError) {
        console.error('❌ Failed to update error status:', updateError);
      }
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
    console.log('🖼️ Extracting thumbnail for:', url);
    
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
      console.log('✅ Thumbnail extraction successful:', result.success);
      return result.success ? result.thumbnailUrl : null;
    }
    
    console.log('❌ Thumbnail extraction failed:', response.status);
    return null;
  } catch (error) {
    console.error('💥 Error extracting thumbnail:', error);
    return null;
  }
}