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

  // ── 1. HuggingFace Router API (runs from browser → residential IP works!)
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

  // ── 2. Pollinations — direct fetch
  const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(displayPrompt)}?width=1024&height=1024&nologo=true&enhance=false&seed=${seed}&model=flux`;
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
  return translated.length > 0 ? translated.slice(0, 5).join(',') : 'image';
}

export function handleImgError(e, prompt) {
  const cleanPrompt = translatePrompt(prompt || 'AI art');
  const seed = Math.floor(Math.random() * 9999999);

  if (!e.target.dataset.fallbackStep) {
    // Step 1: Fresh Pollinations flux URL with new seed
    e.target.dataset.fallbackStep = '1';
    const rawUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt)}?width=1024&height=1024&nologo=true&enhance=false&seed=${seed}&model=flux`;
    e.target.src = rawUrl;
  } else if (e.target.dataset.fallbackStep === '1') {
    // Step 2: Pollinations turbo model with different seed
    e.target.dataset.fallbackStep = '2';
    const rawUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt)}?width=768&height=768&nologo=true&enhance=false&seed=${seed}&model=turbo`;
    e.target.src = rawUrl;
  } else if (e.target.dataset.fallbackStep === '2') {
    // Step 3: Simple Pollinations URL without heavy params
    e.target.dataset.fallbackStep = '3';
    const rawUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt)}?seed=${seed}`;
    e.target.src = rawUrl;
  } else {
    // Final: Styled placeholder
    e.target.onerror = null;
    e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="100%" height="100%" fill="%230f0f10"/><text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" fill="%23555" font-family="sans-serif" font-size="13">Image loading failed</text><text x="50%" y="58%" dominant-baseline="middle" text-anchor="middle" fill="%23444" font-family="sans-serif" font-size="11">Check your internet connection</text></svg>';
  }
}
