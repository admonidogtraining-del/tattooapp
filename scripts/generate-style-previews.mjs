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
 *
 * To use a different model (e.g. when Imagen 4 quota is exhausted):
 *   MODEL=imagen-3.0-generate-001 npm run gen-previews
 * Default model: imagen-4.0-generate-001
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

const MODEL = process.env.MODEL || 'imagen-4.0-generate-001';
console.log(`Using model: ${MODEL}`);

const STYLES = [
  {
    slug: 'american-traditional',
    prompts: [
      'American Traditional old school flash art illustration of a bold eagle with banner scroll, pure white background, thick uniform black outlines, flat red yellow green fills, zero shading, classic sailor flash sheet style',
      'American Traditional old school flash art illustration of a snarling black panther wrapped around a dagger, pure white background, thick uniform black outlines, flat red and green fills, zero shading, classic sailor tattoo style',
      'American Traditional old school flash art illustration of a tall ship with full sails and anchor with rope, pure white background, thick uniform black outlines, flat blue red and yellow fills, zero shading, classic sailor flash style',
      'American Traditional old school flash art illustration of two swallows flanking a red heart with cherries, pure white background, thick uniform black outlines, flat vivid fills, zero shading, vintage flash sheet style',
    ],
  },
  {
    slug: 'neo-traditional',
    prompts: [
      'Neo-Traditional decorative illustration of an ornate rose with filigree scrollwork, white background, jewel tone purples and teals, varied bold line weights, crisp white highlights',
      'Neo-Traditional decorative illustration of a wolf portrait surrounded by an elaborate botanical wreath of leaves and berries, white background, deep forest greens and amber jewel tones, varied bold line weights, rich shading',
      'Neo-Traditional decorative illustration of an owl perched on a vintage pocket watch with trailing keys and feathers, white background, jewel tone golds and deep teals, ornate linework, crisp white highlights',
      'Neo-Traditional decorative illustration of a fox head framed by mushrooms ferns and wildflowers, white background, warm rust orange and violet jewel tones, bold varied line weights, decorative filigree details',
    ],
  },
  {
    slug: 'japanese-irezumi',
    prompts: [
      'Japanese Irezumi traditional art of a koi fish with waves and wind bars, white background, bold black outlines, vivid red and gold flat fills, flowing gakubori wave background elements',
      'Japanese Irezumi traditional art of a roaring tiger among chrysanthemum blooms with wind bars, white background, bold black outlines, vivid orange and gold flat fills, flowing gakubori cloud background',
      'Japanese Irezumi traditional art of a coiling dragon emerging from swirling clouds and flames, white background, bold black outlines, vivid green and gold flat fills, dynamic flowing composition',
      'Japanese Irezumi traditional art of a Hannya mask surrounded by cherry blossom branches and maple leaves, white background, bold black outlines, vivid red and gold flat fills, dramatic expression',
    ],
  },
  {
    slug: 'black-grey-realism',
    prompts: [
      'Black and grey realism illustration of a lion portrait, white background, zero outlines, smooth graywash shading only, single light source, photorealistic 3D volume, only black and grey tones',
      'Black and grey realism illustration of a howling wolf with a full moon behind it, white background, zero outlines, smooth graywash shading only, dramatic single light source, photorealistic fur texture, only black and grey tones',
      'Black and grey realism illustration of a photorealistic human eye with a rose reflection in the pupil, white background, zero outlines, ultra-smooth graywash shading, single light source, only black and grey tones',
      'Black and grey realism illustration of a bald eagle in flight with outstretched wings, white background, zero outlines, smooth graywash shading only, dramatic light source from above, photorealistic feather detail, only black and grey tones',
    ],
  },
  {
    slug: 'micro-realism',
    prompts: [
      'Micro realism single-needle illustration of a detailed moth with spread wings showing fine vein patterns, pure white background, ultra-fine hairline strokes only, miniature hyper-detailed precision, extreme contrast between fine ink and white, no thick outlines anywhere',
      'Micro realism single-needle illustration of a hummingbird hovering beside a tiny trumpet flower, pure white background, ultra-fine hairline strokes only, miniature hyper-detailed precision, extreme micro-detail on feathers, no thick outlines anywhere',
      'Micro realism single-needle illustration of a honey bee with transparent wings on a honeycomb section, pure white background, ultra-fine hairline strokes only, microscopic anatomical detail, extreme contrast, no thick outlines anywhere',
      'Micro realism single-needle illustration of a delicate butterfly with intricate wing pattern and fine antenna, pure white background, ultra-fine hairline strokes only, miniature hyper-detailed precision, visible wing scales, no thick outlines anywhere',
    ],
  },
  {
    slug: 'color-realism',
    prompts: [
      'Color realism painterly illustration of a vibrant tropical parrot portrait, pure white background, no black outlines anywhere, rich saturated luminous colors blending like oil paint, complementary orange and blue plumage, photorealistic feather texture',
      'Color realism painterly illustration of a koi fish underwater with shafts of light from above, pure white background, no black outlines anywhere, rich saturated luminous colors blending like oil paint, luminous gold and orange scales with teal water',
      'Color realism painterly illustration of a lush red rose bouquet with water droplets on petals, pure white background, no black outlines anywhere, rich saturated luminous colors, deep crimson and emerald green, photorealistic petal texture',
      'Color realism painterly illustration of a tiger eye extreme close-up filling the frame, pure white background, no black outlines anywhere, rich saturated amber and gold colors blending like oil paint, photorealistic iris detail and reflected light',
    ],
  },
  {
    slug: 'blackwork',
    prompts: [
      'Blackwork bold illustration of a geometric tiger face built entirely from solid black shapes and negative space, pure white background, only pure solid black ink no grey tones, sharp angular geometry, powerful negative space contrast, zero gradients zero color',
      'Blackwork bold illustration of a large mandala sun composed entirely of solid black geometric wedges and negative space rays, pure white background, only pure solid black ink, sharp geometric precision, zero gradients zero grey zero color',
      'Blackwork bold illustration of the Flower of Life sacred geometry pattern built from interlocking solid black circles and arcs, pure white background, only pure solid black ink, perfect geometric symmetry, bold fills and crisp negative space',
      'Blackwork bold illustration of a coiled serpent formed entirely from interlocking black geometric scales and triangular shapes, pure white background, only pure solid black ink no grey tones, sharp angular forms, powerful negative space, zero gradients',
    ],
  },
  {
    slug: 'cybersigilism',
    prompts: [
      'Cybersigilism biomechanical illustration of a vertebral spine merging with alien script circuits, pure white background, ultra-thin needle-sharp black lines only, aggressive organic geometry with long tapering stinger extensions, no fills anywhere, wiry alien calligraphy aesthetic',
      'Cybersigilism biomechanical illustration of a human eye transforming into a circuit board iris with alien sigil tendrils radiating outward, pure white background, ultra-thin needle-sharp black lines only, aggressive organic geometry, no fills anywhere',
      'Cybersigilism biomechanical illustration of a skeletal hand with fingers dissolving into alien script glyphs and circuit traces, pure white background, ultra-thin needle-sharp black lines only, long tapering organic extensions, no fills anywhere',
      'Cybersigilism biomechanical illustration of an abstract neural cluster with axon-like tendrils extending into alien calligraphy patterns, pure white background, ultra-thin needle-sharp black lines only, wiry organic geometry with barbed extensions, no fills anywhere',
    ],
  },
  {
    slug: 'dotwork',
    prompts: [
      'Dotwork pointillist illustration of a geometric compass rose, pure white background, entire design built ONLY from individual stippled dots of varying density, dense dots for shadows sparse dots for highlights, no solid lines or fills anywhere, sacred geometry',
      'Dotwork pointillist illustration of a lotus mandala with radiating geometric petals, pure white background, entire design built ONLY from individual stippled dots of varying density, dense dot clusters for dark areas fading to sparse dots, no solid lines or fills',
      'Dotwork pointillist illustration of a sequence of moon phases in a horizontal row, pure white background, entire design built ONLY from individual stippled dots of varying density, dense stippling for shadow sides fading to bare white, no solid lines or fills anywhere',
      'Dotwork pointillist illustration of a nautilus shell cross-section showing the Fibonacci spiral chambers, pure white background, entire design built ONLY from individual stippled dots of varying density, sacred geometry proportions, no solid lines or fills anywhere',
    ],
  },
  {
    slug: 'trash-polka',
    prompts: [
      'Trash Polka collage illustration of a realistic human skull overlaid with dripping red paint splatters and torn geometric shapes, pure white background, ONLY black and red ink, bold sans-serif text fragments, chaotic aggressive layering, high contrast',
      'Trash Polka collage illustration of a broken mechanical clock face overlaid with red ink drips and slashed geometric fragments, pure white background, ONLY black and red ink, bold stencil text fragments, chaotic aggressive layering, high contrast',
      'Trash Polka collage illustration of a realistic raven with wings spread overlaid with slashing red brushstrokes and torn paper textures, pure white background, ONLY black and red ink, angular text fragments, chaotic aggressive composition, high contrast',
      'Trash Polka collage illustration of a fragmented human face portrait overlaid with red paint explosions and collaged geometric shapes, pure white background, ONLY black and red ink, bold uppercase text blocks, chaotic aggressive layering, high contrast',
    ],
  },
  {
    slug: 'ignorant-style',
    prompts: [
      'Ignorant style hand-poked illustration of a wobbly cartoon cat face with big lopsided eyes, pure white background, intentionally shaky imperfect uneven lines, naive sharpie-on-skin aesthetic, flat 2D childlike drawing, wrong proportions, deliberately amateurish',
      'Ignorant style hand-poked illustration of a stick figure person under a lopsided smiling sun with uneven rays, pure white background, intentionally shaky imperfect uneven lines, naive sharpie-on-skin aesthetic, flat 2D childlike drawing, deliberately amateurish',
      'Ignorant style hand-poked illustration of a wobbly heart with crooked stars and squiggly lines around it, pure white background, intentionally shaky imperfect uneven lines, naive sharpie-on-skin aesthetic, flat 2D childlike drawing, wrong proportions, deliberately amateurish',
      'Ignorant style hand-poked illustration of a lopsided pizza slice with googly eyes and a big smile, pure white background, intentionally shaky imperfect uneven lines, naive sharpie-on-skin aesthetic, flat 2D childlike drawing, deliberately amateurish and endearing',
    ],
  },
  {
    slug: 'patchwork',
    prompts: [
      'Patchwork traditional flash sheet illustration, pure white background, six separate small classic tattoo designs in a grid, each piece fully enclosed in a thick white border outline, motifs include anchor heart dagger horseshoe rose and snake, old school sailor flash style',
      'Patchwork nautical flash sheet illustration, pure white background, six separate small classic nautical tattoo designs in a grid, each piece fully enclosed in a thick white border outline, motifs include compass ship wheel lighthouse mermaid trident and shark, old school sailor flash style',
      'Patchwork nature flash sheet illustration, pure white background, six separate small classic nature tattoo designs in a grid, each piece fully enclosed in a thick white border outline, motifs include mushroom frog butterfly crescent moon sunflower and bee, old school flash style',
      'Patchwork mystical flash sheet illustration, pure white background, six separate small classic occult tattoo designs in a grid, each piece fully enclosed in a thick white border outline, motifs include all-seeing eye pyramid crystals crescent moon ouroboros and tarot card, old school flash style',
    ],
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
    model: MODEL,
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
    const prompt = style.prompts[v - 1] ?? style.prompts[0];
    await generate(style.slug, prompt, v).catch(err =>
      console.error(`  ✗ ${style.slug}-${v}: ${err.message}`)
    );
    await new Promise(r => setTimeout(r, 600));
  }
}

console.log('\nDone! Commit public/style-previews/ and run `npm run dev`.\n');
