/**
 * Generates style preview images for all 12 tattoo styles and saves them
 * to public/style-previews/ so the app can load them instantly without
 * generating them at runtime.
 *
 * Usage:
 *   VITE_GEMINI_API_KEY=your_key node scripts/generate-style-previews.mjs
 *   — or —
 *   npm run gen-previews   (reads .env automatically via --env-file flag)
 *
 * Already-existing images are skipped — safe to re-run.
 */

import { GoogleGenAI } from '@google/genai';
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUTPUT_DIR = join(ROOT, 'public', 'style-previews');

if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });

// Try to read API key from env, then from .env file
let apiKey = process.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
  try {
    const env = readFileSync(join(ROOT, '.env'), 'utf8');
    const match = env.match(/VITE_GEMINI_API_KEY=(.+)/);
    if (match) apiKey = match[1].trim().replace(/^["']|["']$/g, '');
  } catch {}
}
if (!apiKey) {
  console.error('Error: VITE_GEMINI_API_KEY not found in env or .env file.');
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

const STYLES = [
  {
    slug: 'american-traditional',
    prompt: 'American Traditional old school flash art illustration of a bold eagle with banner scroll, pure white background, thick uniform black outlines, flat red yellow green fills, zero shading, classic sailor flash sheet style',
  },
  {
    slug: 'neo-traditional',
    prompt: 'Neo-Traditional decorative illustration of an ornate rose with filigree scrollwork, white background, jewel tone purples and teals, varied bold line weights, crisp white highlights',
  },
  {
    slug: 'japanese-irezumi',
    prompt: 'Japanese Irezumi traditional art of a koi fish with waves and wind bars, white background, bold black outlines, vivid red and gold flat fills, flowing gakubori wave background elements',
  },
  {
    slug: 'black-grey-realism',
    prompt: 'Black and grey realism illustration of a lion portrait, white background, zero outlines, smooth graywash shading only, single light source, photorealistic 3D volume, only black and grey tones',
  },
  {
    slug: 'micro-realism',
    prompt: 'Micro realism single-needle illustration of a detailed moth with spread wings showing fine vein patterns, pure white background, ultra-fine hairline strokes only, miniature hyper-detailed precision, extreme contrast between fine ink and white, no thick outlines anywhere',
  },
  {
    slug: 'color-realism',
    prompt: 'Color realism painterly illustration of a vibrant tropical parrot portrait, pure white background, no black outlines anywhere, rich saturated luminous colors blending like oil paint, complementary orange and blue plumage, photorealistic feather texture',
  },
  {
    slug: 'blackwork',
    prompt: 'Blackwork bold illustration of a geometric tiger face built entirely from solid black shapes and negative space, pure white background, only pure solid black ink no grey tones, sharp angular geometry, powerful negative space contrast, zero gradients zero color',
  },
  {
    slug: 'cybersigilism',
    prompt: 'Cybersigilism biomechanical illustration of a vertebral spine merging with alien script circuits, pure white background, ultra-thin needle-sharp black lines only, aggressive organic geometry with long tapering stinger extensions, no fills anywhere, wiry alien calligraphy aesthetic',
  },
  {
    slug: 'dotwork',
    prompt: 'Dotwork pointillist illustration of a geometric compass rose, pure white background, entire design built ONLY from individual stippled dots of varying density, dense dots for shadows sparse dots for highlights, no solid lines or fills anywhere, sacred geometry',
  },
  {
    slug: 'trash-polka',
    prompt: 'Trash Polka collage illustration of a realistic human skull overlaid with dripping red paint splatters and torn geometric shapes, pure white background, ONLY black and red ink, bold sans-serif text fragments, chaotic aggressive layering, high contrast',
  },
  {
    slug: 'ignorant-style',
    prompt: 'Ignorant style hand-poked illustration of a wobbly cartoon cat face with big lopsided eyes, pure white background, intentionally shaky imperfect uneven lines, naive sharpie-on-skin aesthetic, flat 2D childlike drawing, wrong proportions, deliberately amateurish',
  },
  {
    slug: 'patchwork',
    prompt: 'Patchwork traditional flash sheet illustration, pure white background, six separate small classic tattoo designs in a grid, each piece fully enclosed in a thick white border outline, motifs include anchor heart dagger horseshoe rose and snake, old school sailor flash style',
  },
];

const VARIANTS = 4; // number of preview images per style

async function generate(slug, prompt, variantNum) {
  const suffix = variantNum === 1 ? '' : `-${variantNum}`;
  const filepath = join(OUTPUT_DIR, `${slug}${suffix}.png`);
  if (existsSync(filepath)) {
    console.log(`  ✓ ${slug}${suffix} — already exists`);
    return;
  }

  console.log(`  ⏳ ${slug}${suffix}…`);
  const response = await ai.models.generateImages({
    model: 'imagen-4.0-generate-001',
    prompt,
    config: { numberOfImages: 1, aspectRatio: '1:1' },
  });

  const img = response.generatedImages?.[0]?.image;
  if (!img?.imageBytes) throw new Error('No image in response');
  writeFileSync(filepath, Buffer.from(img.imageBytes, 'base64'));
  console.log(`  ✅ saved public/style-previews/${slug}${suffix}.png`);
}

const total = STYLES.length * VARIANTS;
console.log(`\nGenerating ${total} style preview images (${VARIANTS} per style) → ${OUTPUT_DIR}\n`);

for (const style of STYLES) {
  for (let v = 1; v <= VARIANTS; v++) {
    await generate(style.slug, style.prompt, v).catch(err =>
      console.error(`  ✗ ${style.slug}-${v}: ${err.message}`)
    );
    await new Promise(r => setTimeout(r, 600));
  }
}

console.log('\nDone! Commit public/style-previews/ and run `npm run dev`.\n');
