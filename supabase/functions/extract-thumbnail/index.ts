import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ThumbnailRequest {
  url: string;
  contentType?: string;
}

interface ThumbnailResponse {
  success: boolean;
  thumbnailUrl?: string;
  error?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, contentType }: ThumbnailRequest = await req.json();
    console.log('Extracting thumbnail for URL:', url);

    let thumbnailUrl: string | null = null;

    // YouTube thumbnail extraction
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      thumbnailUrl = extractYouTubeThumbnail(url);
    }
    // LinkedIn posts
    else if (url.includes('linkedin.com')) {
      thumbnailUrl = await extractLinkedInThumbnail(url);
    }
    // Vimeo videos
    else if (url.includes('vimeo.com')) {
      thumbnailUrl = await extractVimeoThumbnail(url);
    }
    // Twitter/X posts
    else if (url.includes('twitter.com') || url.includes('x.com')) {
      thumbnailUrl = await extractTwitterThumbnail(url);
    }
    // Generic web scraping for articles and other content
    else {
      thumbnailUrl = await extractGenericThumbnail(url);
    }

    console.log('Extracted thumbnail URL:', thumbnailUrl);

    return new Response(
      JSON.stringify({ 
        success: true, 
        thumbnailUrl: thumbnailUrl || undefined 
      } as ThumbnailResponse),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error extracting thumbnail:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      } as ThumbnailResponse),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

function extractYouTubeThumbnail(url: string): string | null {
  try {
    // Extract video ID from various YouTube URL formats
    let videoId = null;
    
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1]?.split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    } else if (url.includes('youtube.com/embed/')) {
      videoId = url.split('/embed/')[1]?.split('?')[0];
    }

    if (videoId) {
      // Return high quality thumbnail
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting YouTube thumbnail:', error);
    return null;
  }
}

async function extractVimeoThumbnail(url: string): Promise<string | null> {
  try {
    // Extract Vimeo video ID
    const match = url.match(/vimeo\.com\/(\d+)/);
    if (!match) return null;
    
    const videoId = match[1];
    
    // Use Vimeo oEmbed API
    const oembedUrl = `https://vimeo.com/api/oembed.json?url=https://vimeo.com/${videoId}`;
    const response = await fetch(oembedUrl);
    
    if (response.ok) {
      const data = await response.json();
      return data.thumbnail_url || null;
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting Vimeo thumbnail:', error);
    return null;
  }
}

async function extractLinkedInThumbnail(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) return null;
    
    const html = await response.text();
    
    // Look for Open Graph image
    const ogImageMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);
    if (ogImageMatch) {
      return ogImageMatch[1];
    }
    
    // Look for LinkedIn specific image patterns
    const linkedinImageMatch = html.match(/"image":\s*"([^"]+)"/);
    if (linkedinImageMatch) {
      return linkedinImageMatch[1].replace(/\\u002F/g, '/');
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting LinkedIn thumbnail:', error);
    return null;
  }
}

async function extractTwitterThumbnail(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) return null;
    
    const html = await response.text();
    
    // Look for Twitter card image
    const twitterImageMatch = html.match(/<meta\s+name="twitter:image"\s+content="([^"]+)"/i);
    if (twitterImageMatch) {
      return twitterImageMatch[1];
    }
    
    // Look for Open Graph image as fallback
    const ogImageMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);
    if (ogImageMatch) {
      return ogImageMatch[1];
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting Twitter thumbnail:', error);
    return null;
  }
}

async function extractGenericThumbnail(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) return null;
    
    const html = await response.text();
    
    // Priority order for image extraction
    const imageSelectors = [
      // Open Graph image (most reliable)
      /<meta\s+property="og:image"\s+content="([^"]+)"/i,
      // Twitter card image
      /<meta\s+name="twitter:image"\s+content="([^"]+)"/i,
      // Article image
      /<meta\s+property="article:image"\s+content="([^"]+)"/i,
      // Schema.org image
      /<meta\s+itemprop="image"\s+content="([^"]+)"/i,
      // Generic meta image
      /<meta\s+name="image"\s+content="([^"]+)"/i,
    ];
    
    for (const selector of imageSelectors) {
      const match = html.match(selector);
      if (match && match[1]) {
        const imageUrl = match[1];
        // Validate that it's a proper image URL
        if (isValidImageUrl(imageUrl)) {
          return resolveUrl(imageUrl, url);
        }
      }
    }
    
    // If no meta tags, look for first significant image in content
    const imgTagMatch = html.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
    if (imgTagMatch && imgTagMatch[1]) {
      const imageUrl = imgTagMatch[1];
      if (isValidImageUrl(imageUrl)) {
        return resolveUrl(imageUrl, url);
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting generic thumbnail:', error);
    return null;
  }
}

function isValidImageUrl(url: string): boolean {
  if (!url) return false;
  
  // Check if it's a valid URL
  try {
    new URL(url.startsWith('http') ? url : `https:${url}`);
  } catch {
    return false;
  }
  
  // Check for common image extensions or patterns
  const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?|$)/i;
  const commonImagePatterns = /(image|img|photo|picture|thumbnail|avatar)/i;
  
  return imageExtensions.test(url) || 
         commonImagePatterns.test(url) ||
         url.includes('images') ||
         url.includes('media');
}

function resolveUrl(imageUrl: string, baseUrl: string): string {
  try {
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    if (imageUrl.startsWith('//')) {
      return `https:${imageUrl}`;
    }
    
    if (imageUrl.startsWith('/')) {
      const base = new URL(baseUrl);
      return `${base.protocol}//${base.host}${imageUrl}`;
    }
    
    // Relative URL
    const base = new URL(baseUrl);
    const resolved = new URL(imageUrl, base);
    return resolved.toString();
  } catch (error) {
    console.error('Error resolving URL:', error);
    return imageUrl;
  }
}