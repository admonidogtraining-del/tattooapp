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
      // v1 — EXISTING
      'American Traditional old school flash art illustration of a bold eagle with banner scroll, pure white background, thick uniform black outlines, flat red yellow green fills, zero shading, classic sailor flash sheet style',
      // v2 — skeleton/character (subject first, style last)
      'A skeleton Grim Reaper in flowing hooded robes gripping a large scythe in one hand and an hourglass in the other hand, tattoo flash art with thick bold black outlines, flat black red and yellow fills, pure white background, zero shading, old school American Traditional style',
      // v3 — object (subject first, style last)
      'A glass bottle with a fully rigged tall sailing ship and tiny crashing waves visible inside the glass, tattoo flash art with thick bold black outlines, flat blue yellow and red fills, pure white background, zero shading, old school American Traditional style',
      // v4 — human portrait (subject first, style last)
      'A womans face in side profile with long flowing hair made entirely of red roses and thorned vines with a single teardrop on her cheek, tattoo flash art with thick bold black outlines, flat red green and yellow fills, pure white background, zero shading, old school American Traditional style',
    ],
  },
  {
    slug: 'neo-traditional',
    prompts: [
      // v1 — EXISTING
      'Neo-Traditional decorative illustration of an ornate rose with filigree scrollwork, white background, jewel tone purples and teals, varied bold line weights, crisp white highlights',
      // v2 — animal portrait (subject first)
      'A proud stag head portrait with wide branching antlers completely overgrown with blooming wildflowers ivy and berries, tattoo illustration with jewel tone deep forest greens and warm amber, varied bold line weights, ornate botanical detail, white background, Neo-Traditional style',
      // v3 — figure (subject first)
      'A mermaid upper-body emerging from foaming ocean waves under a large full moon with flowing hair and a scaled tail curling into the water, tattoo illustration with jewel tone teals and coral pink, varied bold line weights, ornate wave detail, white background, Neo-Traditional style',
      // v4 — reptile/scene (subject first)
      'A coiled cobra with its hood fully flared centered inside an Art Nouveau arch of blooming flowers and curling leaves, tattoo illustration with jewel tone emerald green and deep gold, varied bold line weights, decorative filigree, white background, Neo-Traditional style',
    ],
  },
  {
    slug: 'japanese-irezumi',
    prompts: [
      // v1 — EXISTING
      'Japanese Irezumi traditional art of a koi fish with waves and wind bars, white background, bold black outlines, vivid red and gold flat fills, flowing gakubori wave background elements',
      // v2 — human portrait (subject first)
      'A geisha portrait from shoulders up with elaborate kanzashi hair ornaments and peony hairpins against a large full moon with maple leaf motifs, traditional Japanese tattoo art with bold black outlines, vivid crimson and gold flat fills, gakubori cloud elements, white background, Irezumi style',
      // v3 — mythological bird (subject first)
      'A phoenix bird rising with wings fully spread through billowing fire and storm clouds with feathers trailing into flame tendrils, traditional Japanese tattoo art with bold black outlines, vivid crimson and gold flat fills, dramatic gakubori flame background, white background, Irezumi style',
      // v4 — warrior (subject first)
      'A samurai warrior in full lacquered armor in a dynamic battle stance gripping a raised katana with cherry blossom petals falling all around, traditional Japanese tattoo art with bold black outlines, vivid navy and deep red flat fills, white background, Irezumi style',
    ],
  },
  {
    slug: 'black-grey-realism',
    prompts: [
      // v1 — EXISTING
      'Black and grey realism illustration of a lion portrait, white background, zero outlines, smooth graywash shading only, single light source, photorealistic 3D volume, only black and grey tones',
      // v2 — skull/roses (subject first)
      'A human skull with deep surface cracks and rose blooms growing outward through the eye sockets and fissures, photorealistic tattoo illustration with smooth graywash shading only, zero outlines, pure white background, only black and grey tones, black and grey realism style',
      // v3 — landscape (subject first)
      'A stone lighthouse on a jagged rocky cliff battered by a violent ocean storm with enormous crashing waves and turbulent clouds and a single beam of light cutting through the darkness, photorealistic tattoo illustration with smooth atmospheric graywash shading, zero outlines, pure white background, only black and grey tones, black and grey realism style',
      // v4 — surreal object (subject first)
      'An ornate pocket watch melting and dripping off the edge of a surface like liquid pooling below it, surrealist Dali-inspired composition, photorealistic tattoo illustration with ultra-smooth graywash shading, zero outlines, pure white background, only black and grey tones, black and grey realism style',
    ],
  },
  {
    slug: 'micro-realism',
    prompts: [
      // v1 — EXISTING
      'Micro realism single-needle illustration of a detailed moth with spread wings showing fine vein patterns, pure white background, ultra-fine hairline strokes only, miniature hyper-detailed precision, extreme contrast between fine ink and white, no thick outlines anywhere',
      // v2 — botanical (subject first)
      'A single dandelion flower with seeds scattering in the wind becoming tinier and sparser until they dissolve into bare white space, ultra-fine single-needle tattoo with hairline strokes only, miniature botanical precision, no thick outlines, pure white background, micro realism style',
      // v3 — object (subject first)
      'An antique brass pocket compass with worn engraving marks a cracked crystal face and a delicate needle, ultra-fine single-needle tattoo with hairline strokes only, miniature mechanical detail and extreme precision, no thick outlines, pure white background, micro realism style',
      // v4 — architecture (subject first)
      'A small stone lighthouse with individually rendered rock-course texture tiny arched windows and a detailed lantern room at the top, ultra-fine single-needle tattoo with hairline strokes only, miniature architectural precision, no thick outlines, pure white background, micro realism style',
    ],
  },
  {
    slug: 'color-realism',
    prompts: [
      // v1 — EXISTING
      'Color realism painterly illustration of a vibrant tropical parrot portrait, pure white background, no black outlines anywhere, rich saturated luminous colors blending like oil paint, complementary orange and blue plumage, photorealistic feather texture',
      // v2 — flower (subject first)
      'A fully open peony flower head filling the entire frame with densely layered ruffled petals catching soft directional light, painterly tattoo illustration with no black outlines, rich luminous deep pink and soft coral oil paint colors, photorealistic petal texture, pure white background, color realism style',
      // v3 — sky/landscape (subject first)
      'A dramatic golden-hour sunset sky with towering storm clouds lit in deep gold orange magenta and violet layers, painterly tattoo illustration with no black outlines, rich luminous atmospheric oil paint colors, painterly cloud texture, pure white background, color realism style',
      // v4 — amphibian (subject first)
      'A vivid poison dart frog sitting on a large wet tropical leaf with beaded water droplets covering the surface, painterly tattoo illustration with no black outlines, rich luminous electric blue and vivid yellow oil paint colors, photorealistic skin and droplet texture, pure white background, color realism style',
    ],
  },
  {
    slug: 'blackwork',
    prompts: [
      // v1 — EXISTING
      'Blackwork bold illustration of a geometric tiger face built entirely from solid black shapes and negative space, pure white background, only pure solid black ink no grey tones, sharp angular geometry, powerful negative space contrast, zero gradients zero color',
      // v2 — landscape silhouette (subject first)
      'A dense pine forest silhouette with trees of dramatically varying heights forming a jagged negative-space skyline, bold tattoo illustration using only pure solid black ink, crisp edges, powerful negative space, pure white background, zero gradients zero grey, blackwork style',
      // v3 — anatomical (subject first)
      'An anatomical human heart with arteries and veins abstracted into bold interlocking geometric black shapes with hard negative space channels between them, bold tattoo illustration using only pure solid black ink, geometric abstraction of organic form, pure white background, zero gradients, blackwork style',
      // v4 — knotwork geometry (subject first)
      'A large six-pointed star built from interlocking Celtic knotwork bands rendered as solid black fills with precise negative-space channels weaving between the bands, bold tattoo illustration using only pure solid black ink, complex woven geometric symmetry, pure white background, zero gradients, blackwork style',
    ],
  },
  {
    slug: 'cybersigilism',
    prompts: [
      // v1 — EXISTING
      'Cybersigilism biomechanical illustration of a vertebral spine merging with alien script circuits, pure white background, ultra-thin needle-sharp black lines only, aggressive organic geometry with long tapering stinger extensions, no fills anywhere, wiry alien calligraphy aesthetic',
      // v2 — skull (subject first)
      'A human skull with the top of the cranium opened and dense alien circuit-script tendrils erupting upward like exploding data streams, biomechanical tattoo with ultra-thin needle-sharp black lines only, no fills anywhere, aggressive wiry geometry with long barbed extensions, pure white background, cybersigilism style',
      // v3 — wings (subject first)
      'A symmetrical pair of spread wings composed entirely of layered alien sigil glyphs and branching circuit traces with long tapering stinger feather-tips, biomechanical tattoo with ultra-thin needle-sharp black lines only, no fills anywhere, pure white background, cybersigilism style',
      // v4 — ouroboros (subject first)
      'An ouroboros serpent biting its own tail whose entire coiling body is formed from flowing alien script characters and winding circuit traces with barbed extensions, biomechanical tattoo with ultra-thin needle-sharp black lines only, no fills anywhere, circular composition, pure white background, cybersigilism style',
    ],
  },
  {
    slug: 'dotwork',
    prompts: [
      // v1 — EXISTING
      'Dotwork pointillist illustration of a geometric compass rose, pure white background, entire design built ONLY from individual stippled dots of varying density, dense dots for shadows sparse dots for highlights, no solid lines or fills anywhere, sacred geometry',
      // v2 — animal portrait (subject first)
      'A grizzly bear face portrait with detailed fur texture and a direct forward gaze, pointillist tattoo built entirely from individual stippled dots of varying density, dense dots for dark fur and shadows fading to sparse dots for highlights, no solid lines or fills anywhere, pure white background, dotwork style',
      // v3 — sacred geometry mandala (subject first)
      'A Sri Yantra sacred geometry mandala with precisely nested interlocking triangles and outer lotus petals, pointillist tattoo built entirely from individual stippled dots of varying density, dense clusters for structure fading to sparse highlights, no solid lines or fills, pure white background, dotwork style',
      // v4 — tree/landscape (subject first)
      'A towering redwood tree with a full root system spreading symmetrically below the ground line, pointillist tattoo built entirely from individual stippled dots of varying density with atmospheric perspective shown through dot density, no solid lines or fills, pure white background, dotwork style',
    ],
  },
  {
    slug: 'trash-polka',
    prompts: [
      // v1 — EXISTING
      'Trash Polka collage illustration of a realistic human skull overlaid with dripping red paint splatters and torn geometric shapes, pure white background, ONLY black and red ink, bold sans-serif text fragments, chaotic aggressive layering, high contrast',
      // v2 — heart/organic (subject first)
      'A detailed anatomical human heart with exposed arteries and veins overlaid with explosive red ink splatter bursts and aggressive black angular shapes and bold uppercase stencil text fragments, chaotic collage tattoo using ONLY black and red ink, pure white background, Trash Polka style',
      // v3 — broken object (subject first)
      'A camera lens with a shattered spider-cracked face radiating from the center overlaid with red paint drips and aggressive black slashing mark-making and torn text collage elements, chaotic collage tattoo using ONLY black and red ink, pure white background, Trash Polka style',
      // v4 — hourglass (subject first)
      'An hourglass with sand streaming through it overlaid with violent diagonal red brushstroke slashes and torn black angular geometric shapes and bold stencil number and text fragments, chaotic collage tattoo using ONLY black and red ink, pure white background, Trash Polka style',
    ],
  },
  {
    slug: 'ignorant-style',
    prompts: [
      // v1 — EXISTING
      'Ignorant style hand-poked illustration of a wobbly cartoon cat face with big lopsided eyes, pure white background, intentionally shaky imperfect uneven lines, naive sharpie-on-skin aesthetic, flat 2D childlike drawing, wrong proportions, deliberately amateurish',
      // v2 — alien figure (subject first)
      'A crudely drawn alien creature with a giant egg-shaped head a tiny body and stick arms waving, with three uneven eyes and a lopsided mouth, naive hand-poked tattoo with intentionally shaky imperfect uneven lines, sharpie-on-skin aesthetic, wrong proportions, pure white background, ignorant style',
      // v3 — skull (subject first)
      'A lopsided skull face with mismatched hollow eye sockets a crooked row of teeth and an off-center nose hole and wobbly uneven outline, naive hand-poked tattoo with intentionally shaky imperfect lines, sharpie-on-skin aesthetic, flat 2D childlike, pure white background, ignorant style',
      // v4 — absurd animal (subject first)
      'A wobbly cartoon shark with a huge bulbous body tiny mismatched fins and comically small human-like legs wearing little boots underneath it and a big goofy grin, naive hand-poked tattoo with intentionally shaky imperfect lines, sharpie-on-skin aesthetic, wrong proportions, pure white background, ignorant style',
    ],
  },
  {
    slug: 'patchwork',
    prompts: [
      // v1 — EXISTING
      'Patchwork traditional flash sheet illustration, pure white background, six separate small classic tattoo designs in a grid, each piece fully enclosed in a thick white border outline, motifs include anchor heart dagger horseshoe rose and snake, old school sailor flash style',
      // v2 — occult theme (subject-first grid description)
      'Six small occult tattoo designs arranged in a grid each enclosed in its own thick border box: all-seeing eye, crescent moon, crystal ball, ouroboros snake, pentagram star, tarot card — patchwork tattoo flash sheet, old school style, pure white background',
      // v3 — animal theme (subject-first grid description)
      'Six small animal face tattoo designs arranged in a grid each enclosed in its own thick border box: roaring bear head, wolf face, eagle head, coiled rattlesnake, snarling panther, koi fish — patchwork tattoo flash sheet, old school style, pure white background',
      // v4 — botanical theme (subject-first grid description)
      'Six small botanical tattoo designs arranged in a grid each enclosed in its own thick border box: red rose, daisy, sunflower, cherry blossom branch, spotted mushroom, wildflower sprig — patchwork tattoo flash sheet, old school style, pure white background',
    ],
  },
];

const VARIANTS = 4; // number of preview images per style

async function generate(slug, prompt, variantNum) {
  const suffix = variantNum === 1 ? '' : `-${variantNum}`;
  const filepath = join(OUTPUT_DIR, `${slug}${suffix}.png`);
  if (existsSync(filepath)) {
    console.log(`  ✓ ${slug}${suffix} — already exists`);
    return false; // not newly generated
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
  return true; // newly generated
}

const TEST_MODE = process.argv.includes('--test');
const total = STYLES.length * VARIANTS;
console.log(`\nGenerating ${TEST_MODE ? '1 test image' : `${total} style preview images (${VARIANTS} per style)`} → ${OUTPUT_DIR}\n`);

outer: for (const style of STYLES) {
  for (let v = 1; v <= VARIANTS; v++) {
    const prompt = style.prompts[v - 1] ?? style.prompts[0];
    const generated = await generate(style.slug, prompt, v).catch(err => {
      console.error(`  ✗ ${style.slug}-${v}: ${err.message}`);
      return false;
    });
    await new Promise(r => setTimeout(r, 600));
    if (TEST_MODE && generated) break outer; // stop after first newly generated image
  }
}

console.log('\nDone! Commit public/style-previews/ and run `npm run dev`.\n');
