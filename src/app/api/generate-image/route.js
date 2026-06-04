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

    if (hfToken && hfToken.length > 10) {
      // ─── Strategy 1: HF Router → wavespeed provider → FLUX.1-dev ──────────
      // This is the JavaScript equivalent of:
      //   InferenceClient(provider="wavespeed").text_to_image(model="FLUX.1-dev")
      const wavespeedAttempts = [
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

      for (const attempt of wavespeedAttempts) {
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
                // Fetch the image URL
                const imgRes = await fetchWithTimeout(item.url, {}, 20000);
                if (imgRes.ok) {
                  const ab = await imgRes.arrayBuffer();
                  imageBuffer = Buffer.from(ab);
                  contentType = imgRes.headers.get('content-type') || 'image/jpeg';
                  chosenProvider = attempt.name + ' (URL)';
                  console.log(`${attempt.name} succeeded (URL fetch)!`);
                }
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

      // ─── Strategy 2: Standard HF Inference API (serverless, no provider) ──
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
    } else {
      console.log('No HF token configured — skipping server-side HF generation.');
    }

    // ─── If server-side succeeded, return as base64 data URI ──────────────
    if (imageBuffer) {
      const base64 = imageBuffer.toString('base64');
      const dataUri = `data:${contentType};base64,${base64}`;
      console.log(`Returning base64 image from ${chosenProvider}`);
      return NextResponse.json({ imageUrl: dataUri, provider: chosenProvider });
    }

    // ─── Fallback: tell client to generate using its OWN residential IP ────
    console.warn('Server-side generation unavailable. Sending client-side URLs.');
    return NextResponse.json({
      imageUrl: `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt)}?width=1024&height=1024&nologo=true&enhance=false&seed=${seed}&model=flux`,
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
