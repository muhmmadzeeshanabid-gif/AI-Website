import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get('url');

    if (!targetUrl) {
      return new Response('URL is required', { status: 400 });
    }

    // Allow data: URIs to pass through (base64 images don't need proxying)
    if (targetUrl.startsWith('data:')) {
      return new Response('data: URIs do not need proxying', { status: 400 });
    }

    // Allow both Pollinations and LoremFlickr
    const isAllowed =
      targetUrl.startsWith('https://image.pollinations.ai/') ||
      targetUrl.startsWith('https://gen.pollinations.ai/') ||
      targetUrl.startsWith('https://loremflickr.com/');

    if (!isAllowed) {
      return new Response('Invalid target URL', { status: 400 });
    }

    try {
      const res = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        cache: 'no-store',
        signal: AbortSignal.timeout(25000),
      });

      if (!res.ok) {
        return new Response(`Remote fetch failed: ${res.status}`, { status: res.status });
      }

      const ct = res.headers.get('content-type') || 'image/jpeg';
      if (!ct.startsWith('image/')) {
        return new Response('Remote URL did not return an image', { status: 502 });
      }

      const arrayBuffer = await res.arrayBuffer();
      return new Response(arrayBuffer, {
        headers: {
          'Content-Type': ct,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch (err) {
      console.error('Proxy fetch error:', err.message);
      return new Response('Failed to load remote image', { status: 502 });
    }
  } catch (error) {
    console.error('Proxy image error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
