import { NextResponse } from 'next/server';

/**
 * Server-side image generation using HuggingFace Router API.
 *
 * Python equivalent being implemented:
 *   from huggingface_hub import InferenceClient
 *   client = InferenceClient(provider="wavespeed", api_key=HF_TOKEN)
 *   image = client.text_to_image("prompt", model="black-forest-labs/FLUX.1-dev")
 *
 * REST equivalent:
 *   POST https://router.huggingface.co/wavespeed/v1/images/generations
 *   Authorization: Bearer {HF_TOKEN}
 *   { "model": "black-forest-labs/FLUX.1-dev", "prompt": "...", "n": 1 }
 */

async function fetchWithTimeout(url, options = {}, timeoutMs = 30000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export async function POST(request) {
  try {
    const { prompt } = await request.json();

    if (!prompt || !prompt.trim()) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const cleanPrompt = prompt.trim();
    const seed = Math.floor(Math.random() * 9999999);
    const hfToken = process.env.HF_ACCESS_TOKEN || process.env.NEXT_PUBLIC_HF_ACCESS_TOKEN || '';

    let imageBuffer = null;
    let contentType = 'image/jpeg';
    let chosenProvider = '';

    // ─── Strategy 0: Pollinations AI (Server-side) ──────────
    const polKey = process.env.POLLINATIONS_API_KEY || '';
    if (!imageBuffer && polKey) {
      try {
        console.log('Trying Pollinations server-side with API key...');
        const url = `https://gen.pollinations.ai/image/${encodeURIComponent(cleanPrompt)}?nologo=true&seed=${seed}&model=flux`;
        const res = await fetchWithTimeout(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${polKey}`,
          }
        }, 30000);

        if (res.ok) {
          const ct = res.headers.get('content-type') || '';
          if (ct.startsWith('image/')) {
            const ab = await res.arrayBuffer();
            imageBuffer = Buffer.from(ab);
            contentType = ct;
            chosenProvider = 'Pollinations AI (Server-side)';
            console.log('Pollinations server-side succeeded!');
          } else {
            const txt = await res.text().catch(() => '');
            console.warn('Pollinations server-side non-image response:', txt.slice(0, 150));
          }
        } else {
          const errText = await res.text().catch(() => '');
          console.warn('Pollinations server-side failed:', res.status, errText.slice(0, 150));
        }
      } catch (e) {
        console.warn('Pollinations server-side error:', e.message);
      }
    }

    // ─── Strategy 1: Segmind (Server-side) ──────────
    const segmindKey = process.env.SEGMIND_API_KEY || process.env.NEXT_PUBLIC_SEGMIND_API_KEY || '';
    if (!imageBuffer && segmindKey && segmindKey.length > 5) {
      try {
        console.log('Trying Segmind server-side (FLUX.1-schnell)...');
        const res = await fetch('https://api.segmind.com/v1/fast-flux-schnell', {
          method: 'POST',
          headers: {
            'x-api-key': segmindKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: cleanPrompt,
            aspect_ratio: '1:1',
            steps: 4,
            seed: seed,
            base64: true
          }),
        });
        if (res.ok) {
          const json = await res.json();
          if (json.image) {
            imageBuffer = Buffer.from(json.image, 'base64');
            contentType = 'image/jpeg';
            chosenProvider = 'Segmind (FLUX.1-schnell)';
            console.log('Segmind server-side succeeded!');
          }
        } else {
          const errText = await res.text().catch(() => '');
          console.warn('Segmind server-side failed:', res.status, errText.slice(0, 150));
        }
      } catch (e) {
        console.warn('Segmind server-side error:', e.message);
      }
    }

    if (!imageBuffer && hfToken && hfToken.length > 10) {
      // ─── Strategy 2: HF Router → wavespeed provider → FLUX.1-dev ──────────
      // This is the JavaScript equivalent of:
      //   InferenceClient(provider="wavespeed").text_to_image(model="FLUX.1-dev")
      const routerAttempts = [
        {
          url: 'https://router.huggingface.co/together/v1/images/generations',
          body: JSON.stringify({
            model: 'black-forest-labs/FLUX.1-schnell',
            prompt: cleanPrompt,
            n: 1,
            size: '1024x1024',
          }),
          name: 'HF Router (together / FLUX.1-schnell)',
          expectJson: true,
        },
        {
          url: 'https://router.huggingface.co/together/v1/images/generations',
          body: JSON.stringify({
            model: 'black-forest-labs/FLUX.1-dev',
            prompt: cleanPrompt,
            n: 1,
            size: '1024x1024',
          }),
          name: 'HF Router (together / FLUX.1-dev)',
          expectJson: true,
        },
        {
          url: 'https://router.huggingface.co/wavespeed/v1/images/generations',
          body: JSON.stringify({
            model: 'black-forest-labs/FLUX.1-dev',
            prompt: cleanPrompt,
            n: 1,
            size: '1024x1024',
          }),
          name: 'HF Router (wavespeed / FLUX.1-dev)',
          expectJson: true,
        },
        {
          url: 'https://router.huggingface.co/wavespeed/v1/images/generations',
          body: JSON.stringify({
            model: 'black-forest-labs/FLUX.1-schnell',
            prompt: cleanPrompt,
            n: 1,
            size: '1024x1024',
          }),
          name: 'HF Router (wavespeed / FLUX.1-schnell)',
          expectJson: true,
        },
      ];

      for (const attempt of routerAttempts) {
        if (imageBuffer) break;
        try {
          console.log(`Trying ${attempt.name}...`);
          const res = await fetchWithTimeout(
            attempt.url,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${hfToken}`,
                'Content-Type': 'application/json',
              },
              body: attempt.body,
              cache: 'no-store',
            },
            35000
          );

          if (res.ok) {
            const ct = res.headers.get('content-type') || '';
            if (ct.startsWith('image/')) {
              // Some providers return raw image bytes
              const ab = await res.arrayBuffer();
              imageBuffer = Buffer.from(ab);
              contentType = ct;
              chosenProvider = attempt.name;
              console.log(`${attempt.name} succeeded (raw image)!`);
            } else if (ct.includes('json') || attempt.expectJson) {
              // OpenAI-compatible response: { data: [{ b64_json, url }] }
              const json = await res.json();
              const item = json?.data?.[0];
              if (item?.b64_json) {
                imageBuffer = Buffer.from(item.b64_json, 'base64');
                contentType = 'image/png';
                chosenProvider = attempt.name;
                console.log(`${attempt.name} succeeded (b64_json)!`);
              } else if (item?.url) {
                // Return CDN URL directly to prevent timeouts and speed up load time
                console.log(`${attempt.name} succeeded (returning URL directly):`, item.url);
                return NextResponse.json({ imageUrl: item.url, provider: attempt.name });
              } else {
                console.warn(`${attempt.name} returned unexpected JSON:`, JSON.stringify(json).slice(0, 200));
              }
            }
          } else {
            const errText = await res.text().catch(() => '');
            console.warn(`${attempt.name} failed ${res.status}:`, errText.slice(0, 150));
          }
        } catch (e) {
          console.warn(`${attempt.name} error:`, e.message);
        }
      }

      // ─── Strategy 3: Standard HF Inference API (serverless, no provider) ──
      if (!imageBuffer) {
        const hfModels = [
          'black-forest-labs/FLUX.1-schnell',
          'stabilityai/stable-diffusion-xl-base-1.0',
        ];
        for (const model of hfModels) {
          if (imageBuffer) break;
          try {
            console.log(`Trying HF serverless: ${model}...`);
            const res = await fetchWithTimeout(
              `https://api-inference.huggingface.co/models/${model}`,
              {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${hfToken}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ inputs: cleanPrompt }),
                cache: 'no-store',
              },
              40000
            );
            if (res.ok) {
              const ct = res.headers.get('content-type') || '';
              if (ct.startsWith('image/')) {
                const ab = await res.arrayBuffer();
                imageBuffer = Buffer.from(ab);
                contentType = ct;
                chosenProvider = `HF Serverless (${model})`;
                console.log(`HF serverless ${model} succeeded!`);
              } else {
                const txt = await res.text().catch(() => '');
                console.warn(`HF ${model} non-image response:`, txt.slice(0, 100));
              }
            } else {
              const err = await res.text().catch(() => '');
              console.warn(`HF ${model} failed ${res.status}:`, err.slice(0, 100));
            }
          } catch (e) {
            console.warn(`HF ${model} error:`, e.message);
          }
        }
      }
    } else if (!imageBuffer) {
      console.log('No HF token configured — skipping server-side HF generation.');
    }

    // ─── If server-side succeeded, return as base64 data URI ──────────────
    if (imageBuffer) {
      const base64 = imageBuffer.toString('base64');
      const dataUri = `data:${contentType};base64,${base64}`;
      console.log(`Returning base64 image from ${chosenProvider}`);
      return NextResponse.json({ imageUrl: dataUri, provider: chosenProvider });
    }

    const polQuery = polKey ? `&key=${polKey}` : '';
    // ─── Fallback: tell client to generate using its OWN residential IP ────
    console.warn('Server-side generation unavailable. Sending client-side URLs.');
    return NextResponse.json({
      imageUrl: `https://gen.pollinations.ai/image/${encodeURIComponent(cleanPrompt)}?nologo=true&seed=${seed}&model=flux${polQuery}`,
      provider: 'Pollinations (client-side fallback)',
      isClientFetch: true,
    });

  } catch (error) {
    console.error('Image generation error:', error);
    return NextResponse.json(
      { error: 'Image generation failed: ' + error.message },
      { status: 500 }
    );
  }
}
