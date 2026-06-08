/**
 * Client-side image generation utility.
 * All fetches happen from the USER'S BROWSER using their residential IP,
 * completely bypassing server-side rate limits / network restrictions.
 */

// ─── Roman Urdu → English translation dictionary ──────────────────────────────
const URDU_DICT = {
  // Animals
  billi: 'cat', billiyan: 'cats', kutta: 'dog', kutte: 'dogs',
  gari: 'car', gaari: 'car', gadi: 'car', gadya: 'cars',
  larka: 'boy', ladka: 'boy', larki: 'girl', ladki: 'girl',
  ghar: 'house', makan: 'house', darakht: 'tree', ped: 'tree',
  phool: 'flower', phul: 'flower', suraj: 'sun', chand: 'moon',
  sitare: 'stars', tara: 'star', pani: 'water', samundar: 'sea',
  darya: 'river', pahad: 'mountain', badal: 'clouds', parinda: 'bird',
  chidiya: 'bird', sher: 'lion', hathi: 'elephant', ghoda: 'horse',
  machli: 'fish', kitab: 'book', rotii: 'food', roti: 'food', khana: 'food',
  seb: 'apple', aam: 'mango', kela: 'banana', pyara: 'beautiful',
  pyari: 'beautiful', khoobsurat: 'beautiful', safed: 'white', kala: 'black',
  laal: 'red', neela: 'blue', peela: 'yellow', hara: 'green',
  asman: 'sky', zameen: 'ground', shehar: 'city', gaon: 'village',
  rasta: 'road', sadak: 'road', gali: 'street', dost: 'friend',
  abbu: 'father', ammi: 'mother', bhai: 'brother', behan: 'sister',
  mard: 'man', aurat: 'woman', bacha: 'child', log: 'people',
  roshni: 'light', aag: 'fire', hawa: 'wind', barish: 'rain',
  barf: 'snow', din: 'day', raat: 'night', subah: 'morning',
  mouse: 'mouse', chawal: 'rice', chawal: 'rice',
  // Actions / helpers (will be stripped as stop words)
  mujye: '', mujhe: '', bana: '', banao: '', chahiye: '', ak: '', ek: '',
  ki: '', ka: '', ko: '', kar: '', ke: '', kr: '', doo: '', do: '',
  please: '', plz: '', aur: '', yar: '', yr: '', akr: '',
};

function translatePrompt(text) {
  return text
    .toLowerCase()
    .split(/\s+/)
    .map(w => URDU_DICT[w] !== undefined ? URDU_DICT[w] : w)
    .filter(w => w.length > 1)
    .join(' ')
    .trim() || text;
}

// ─── Main client-side generation function ─────────────────────────────────────
/**
 * Generate an image entirely from the browser.
 * Returns a Promise<{ url: string, provider: string }>
 *
 * Strategy (all run from browser residential IP):
 *   1. Pollinations AI (flux model) — direct browser fetch
 *   2. Pollinations AI (turbo model) — different seed
 */
export async function generateImageClientSide(prompt, hfToken = '') {
  const englishPrompt = translatePrompt(prompt);
  const seed = Math.floor(Math.random() * 9999999);
  const displayPrompt = englishPrompt || prompt;

  console.log(`[ImageGen] Generating: "${displayPrompt}" (seed: ${seed})`);

  // ── 1. Segmind — direct browser fetch (if key is configured)
  const segmindKey = process.env.NEXT_PUBLIC_SEGMIND_API_KEY || '';
  if (segmindKey && segmindKey.length > 5) {
    try {
      console.log(`[ImageGen] Trying Segmind from browser...`);
      const res = await fetch('https://api.segmind.com/v1/fast-flux-schnell', {
        method: 'POST',
        headers: {
          'x-api-key': segmindKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: displayPrompt,
          aspect_ratio: '1:1',
          steps: 4,
          seed: seed,
          base64: true
        }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.image) {
          const url = `data:image/jpeg;base64,${json.image}`;
          console.log('[ImageGen] Segmind succeeded!');
          return { url, provider: 'Segmind (FLUX.1-schnell)' };
        }
      } else {
        const errText = await res.text().catch(() => '');
        console.warn(`[ImageGen] Segmind failed ${res.status}:`, errText.slice(0, 100));
      }
    } catch (e) {
      console.warn('[ImageGen] Segmind error:', e.message);
    }
  }

  // ── 2. HuggingFace Router API (runs from browser → residential IP works!)
  if (hfToken && hfToken.length > 10) {
    // 'together' provider confirmed working with FLUX.1-schnell
    const hfAttempts = [
      {
        url: 'https://router.huggingface.co/together/v1/images/generations',
        body: { model: 'black-forest-labs/FLUX.1-schnell', prompt: displayPrompt, n: 1 },
        name: 'HF-Router/together/FLUX.1-schnell',
      },
      {
        url: 'https://router.huggingface.co/together/v1/images/generations',
        body: { model: 'black-forest-labs/FLUX.1-dev', prompt: displayPrompt, n: 1 },
        name: 'HF-Router/together/FLUX.1-dev',
      },
      {
        url: 'https://router.huggingface.co/wavespeed/v1/images/generations',
        body: { model: 'black-forest-labs/FLUX.1-dev', prompt: displayPrompt, n: 1 },
        name: 'HF-Router/wavespeed/FLUX.1-dev',
      },
      {
        url: 'https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell',
        body: { inputs: displayPrompt },
        name: 'HF-Serverless/FLUX.1-schnell',
        rawImage: true,
      },
    ];

    for (const attempt of hfAttempts) {
      try {
        console.log(`[ImageGen] Trying ${attempt.name} from browser...`);
        let res;
        for (let retry = 0; retry < 2; retry++) {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 45000);

          res = await fetch(attempt.url, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${hfToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(attempt.body),
            signal: controller.signal,
          });
          clearTimeout(timer);

          if (res.status === 503) {
            const text = await res.text().catch(() => '');
            try {
              const json = JSON.parse(text);
              if (json.estimated_time && retry === 0) {
                console.log(`[ImageGen] Model loading, waiting ${json.estimated_time}s...`);
                await new Promise(r => setTimeout(r, (json.estimated_time * 1000) + 500));
                continue;
              }
            } catch(e) {}
            console.warn(`[ImageGen] ${attempt.name} failed 503:`, text.slice(0, 100));
            break;
          }
          break; // success or non-503 error
        }

        if (res && res.ok) {
          const ct = res.headers.get('content-type') || '';

          if (ct.startsWith('image/') || attempt.rawImage) {
            // Raw image bytes (standard HF inference)
            const blob = await res.blob();
            if (blob.size > 1000) {
              const url = URL.createObjectURL(blob);
              console.log(`[ImageGen] ${attempt.name} succeeded (raw image, ${blob.size} bytes)!`);
              return { url, provider: `Hugging Face (${attempt.name})` };
            }
          } else if (ct.includes('json')) {
            // OpenAI-compatible response: { data: [{ url, b64_json }] }
            const json = await res.json();
            const item = json?.data?.[0];
            if (item?.b64_json) {
              const url = `data:image/png;base64,${item.b64_json}`;
              console.log(`[ImageGen] ${attempt.name} succeeded (b64_json)!`);
              return { url, provider: `Hugging Face (${attempt.name})` };
            } else if (item?.url) {
              // together returns a CDN URL — use directly
              console.log(`[ImageGen] ${attempt.name} succeeded (CDN URL): ${item.url}`);
              return { url: item.url, provider: `Hugging Face (${attempt.name})` };
            } else {
              console.warn(`[ImageGen] ${attempt.name} unexpected JSON:`, JSON.stringify(json).slice(0, 150));
            }
          }
        } else if (res) {
          const txt = await res.text().catch(() => '');
          console.warn(`[ImageGen] ${attempt.name} failed ${res.status}:`, txt.slice(0, 100));
        }
      } catch (e) {
        console.warn(`[ImageGen] ${attempt.name} error:`, e.message);
      }
    }
  }

  const polKey = process.env.NEXT_PUBLIC_POLLINATIONS_API_KEY || '';
  const polQuery = polKey ? `&key=${polKey}` : '';
  // ── 3. Pollinations — direct browser fallback to bypass rate-limited proxy
  const pollinationsUrl = `https://gen.pollinations.ai/image/${encodeURIComponent(displayPrompt)}?nologo=true&seed=${seed}&model=flux${polQuery}`;
  console.log(`[ImageGen] Falling back to Pollinations directly:`, pollinationsUrl);
  return { url: pollinationsUrl, provider: 'Pollinations AI' };
}



// ─── Re-export helpers ────────────────────────────────────────────────────────
export function translateRomanUrduWord(word) {
  return URDU_DICT[word] || word;
}

export function extractKeywords(prompt) {
  if (!prompt) return 'image';
  const words = prompt.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, '').split(/\s+/);
  const stopWords = new Set(['mujye','mujhe','ak','ek','bana','banao','chahiye','ki','ka',
    'ko','kar','ke','kr','doo','do','please','plz','photo','image','pic','picture',
    'tasveer','drawing','generate','create','draw','make','show','me','a','an','the',
    'of','in','on','with','at','by','for','akr','aur','yar','yr']);
  const filtered = words.filter(w => !stopWords.has(w) && w.length > 2);
  const translated = (filtered.length > 0 ? filtered : words.slice(0, 3))
    .map(w => URDU_DICT[w] || w)
    .filter(w => w && w.length > 2);
  return translated.length > 0 ? translated.slice(0, 2).join(',') : 'image';
}

export function handleImgError(e, prompt) {
  const cleanPrompt = translatePrompt(prompt || 'AI art');
  const seed = Math.floor(Math.random() * 9999999);
  const polKey = (typeof window !== 'undefined' && window.process?.env?.NEXT_PUBLIC_POLLINATIONS_API_KEY) || 'sk_D3ihoHuYaXwWarpRYWSJLEpyfzYPHzC4';
  const polQuery = polKey ? `&key=${polKey}` : '';

  if (!e.target.dataset.fallbackStep) {
    // Step 1: Fresh Pollinations flux URL with new seed directly
    e.target.dataset.fallbackStep = '1';
    const rawUrl = `https://gen.pollinations.ai/image/${encodeURIComponent(cleanPrompt)}?nologo=true&seed=${seed}&model=flux${polQuery}`;
    e.target.src = rawUrl;
  } else if (e.target.dataset.fallbackStep === '1') {
    // Step 2: Pollinations turbo model with different seed directly
    e.target.dataset.fallbackStep = '2';
    const rawUrl = `https://gen.pollinations.ai/image/${encodeURIComponent(cleanPrompt)}?nologo=true&seed=${seed}&model=turbo${polQuery}`;
    e.target.src = rawUrl;
  } else {
    // Final Bulletproof Fallback: Use LoremFlickr to fetch a high-quality matching stock image
    e.target.onerror = null;
    const keywords = extractKeywords(prompt);
    const fallbackUrl = `https://loremflickr.com/800/800/${encodeURIComponent(keywords)}?random=${seed}`;
    console.log(`[ImageGen] All AI fallbacks failed. Loading matching stock photo from LoremFlickr: ${fallbackUrl}`);
    e.target.src = fallbackUrl;
  }
}
