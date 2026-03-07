/**
 * Generates style preview images for all 12 tattoo styles and saves them
 * to public/style-previews/ so the app can load them instantly without
 * generating them at runtime.
 *
 * Usage:
 *   npm run gen-previews
 *
 * Already-existing images are skipped — safe to re-run after adding new styles.
 */

import { GoogleGenAI } from '@google/genai';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUTPUT_DIR = join(ROOT, 'public', 'style-previews');

if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });

const apiKey = process.env.VITE_GEMINI_API_KEY;
if (!apiKey || apiKey === 'your_gemini_api_key_here') {
  console.error('Error: VITE_GEMINI_API_KEY is not set. Copy .env.example to .env and add your key.');
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

// Must stay in sync with TATTOO_STYLES in App.tsx
const STYLES = [
  {
    id: 'American Traditional',
    slug: 'american-traditional',
    prompt: 'American traditional old school tattoo flash: bold eagle clutching anchor surrounded by red roses, thick black outlines, flat red yellow green black only, white background.',
  },
  {
    id: 'Neo-Traditional',
    slug: 'neo-traditional',
    prompt: 'Neo-traditional tattoo: ornate purple rose bouquet with decorative filigree flourishes, jewel tones, bold and thin line variation, white background.',
  },
  {
    id: 'Japanese (Irezumi)',
    slug: 'japanese-irezumi',
    prompt: 'Japanese Irezumi tattoo: koi fish leaping through waves with cherry blossoms, bold black outlines, vivid red gold blue ink, traditional style, white background.',
  },
  {
    id: 'Black & Grey Realism',
    slug: 'black-grey-realism',
    prompt: 'Black and grey realism tattoo: photorealistic wolf portrait with grey wash shading, single light source from upper left, zero outlines, no color, white background.',
  },
  {
    id: 'Micro-Realism',
    slug: 'micro-realism',
    prompt: 'Micro realism single-needle tattoo: tiny detailed hummingbird in flight, ultra-thin delicate lines only, miniature scale, high contrast, white background.',
  },
  {
    id: 'Color Realism',
    slug: 'color-realism',
    prompt: 'Color realism tattoo: vibrant painterly sunflower, no black outlines anywhere, saturated pigments blending, impressionistic and photorealistic, white background.',
  },
  {
    id: 'Blackwork',
    slug: 'blackwork',
    prompt: 'Blackwork tattoo: intricate solid black geometric mandala, pure black ink only, bold negative space, no grey or color, white background.',
  },
  {
    id: 'Cybersigilism',
    slug: 'cybersigilism',
    prompt: 'Cybersigilism tattoo: ultra-thin sharp alien sigil with long tapering lines, needle-thin aggressive shapes, no fills, dark background.',
  },
  {
    id: 'Dotwork',
    slug: 'dotwork',
    prompt: 'Dotwork stipple tattoo: sacred geometry mandala made entirely of stippled dots, no lines only dots of varying density, white background.',
  },
  {
    id: 'Trash Polka',
    slug: 'trash-polka',
    prompt: 'Trash polka tattoo: chaotic collage using only black and red, realistic skull mixed with red paint splatters and bold graphic text, white background.',
  },
  {
    id: 'Ignorant Style',
    slug: 'ignorant-style',
    prompt: 'Ignorant style hand-poked tattoo: shaky naive smiley face drawing, intentionally imperfect lines, flat childlike 2D, marker aesthetic, white background.',
  },
  {
    id: 'Patchwork',
    slug: 'patchwork',
    prompt: 'Patchwork tattoo flash sheet: multiple small unrelated traditional flash designs arranged together — heart, star, dagger, rose, horseshoe — each with white border, white background.',
  },
];

async function generate(style) {
  const filepath = join(OUTPUT_DIR, `${style.slug}.png`);

  if (existsSync(filepath)) {
    console.log(`  ✓ ${style.id} — already exists, skipping`);
    return;
  }

  console.log(`  ⏳ ${style.id}…`);
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: style.prompt }] },
    config: { responseModalities: ['TEXT', 'IMAGE'] },
  });

  const parts = response.candidates?.[0]?.content?.parts ?? [];
  for (const part of parts) {
    if (part.inlineData?.data) {
      writeFileSync(filepath, Buffer.from(part.inlineData.data, 'base64'));
      console.log(`  ✅ ${style.id} → public/style-previews/${style.slug}.png`);
      return;
    }
  }
  throw new Error('No image in response');
}

const BATCH = 3;
console.log(`\nGenerating style previews → ${OUTPUT_DIR}\n`);

for (let i = 0; i < STYLES.length; i += BATCH) {
  const batch = STYLES.slice(i, i + BATCH);
  await Promise.allSettled(
    batch.map(s =>
      generate(s).catch(err => console.error(`  ✗ ${s.id}: ${err.message}`))
    )
  );
  if (i + BATCH < STYLES.length) {
    // Small pause between batches to stay within rate limits
    await new Promise(r => setTimeout(r, 1500));
  }
}

console.log('\nDone! Run `npm run dev` to see the new previews.\n');
