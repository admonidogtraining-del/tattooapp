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
      // v1 — animal portrait (EXISTING — do not change)
      'American Traditional old school flash art illustration of a bold eagle with banner scroll, pure white background, thick uniform black outlines, flat red yellow green fills, zero shading, classic sailor flash sheet style',
      // v2 — human/character figure
      'American Traditional old school flash art illustration of a Grim Reaper full figure in flowing hooded robes holding a scythe in one hand and an hourglass in the other, pure white background, thick uniform black outlines, flat black red and yellow fills, zero shading, classic flash art style',
      // v3 — object / still life
      'American Traditional old school flash art illustration of a glass bottle containing a fully rigged sailing ship with tiny crashing waves inside the glass, pure white background, thick uniform black outlines, flat blue yellow and red fills, zero shading, classic sailor flash style',
      // v4 — human portrait
      'American Traditional old school flash art illustration of a womans face in side profile with long flowing hair made entirely of roses and thorned vines, a single teardrop on her cheek, pure white background, thick uniform black outlines, flat red green and yellow fills, zero shading, vintage flash style',
    ],
  },
  {
    slug: 'neo-traditional',
    prompts: [
      // v1 — botanical / object (EXISTING — do not change)
      'Neo-Traditional decorative illustration of an ornate rose with filigree scrollwork, white background, jewel tone purples and teals, varied bold line weights, crisp white highlights',
      // v2 — animal portrait
      'Neo-Traditional decorative illustration of a proud stag head portrait with wide branching antlers completely overgrown with blooming wildflowers ivy and berries, white background, jewel tone deep forest greens and warm amber, varied bold line weights, ornate botanical detail, rich shading',
      // v3 — mythological human figure
      'Neo-Traditional decorative illustration of a mermaid upper-body emerging from foaming ocean waves under a large luminous full moon, flowing hair and a scaled tail curling into the water, white background, jewel tone teals and coral pink, varied bold line weights, ornate wave and hair detail',
      // v4 — reptile / symbolic scene
      'Neo-Traditional decorative illustration of a coiled cobra with its hood fully flared centered inside an Art Nouveau arch of blooming flowers and curling leaves, white background, jewel tone emerald green and deep gold, varied bold line weights, decorative filigree, dramatic shadow shading',
    ],
  },
  {
    slug: 'japanese-irezumi',
    prompts: [
      // v1 — fish / water (EXISTING — do not change)
      'Japanese Irezumi traditional art of a koi fish with waves and wind bars, white background, bold black outlines, vivid red and gold flat fills, flowing gakubori wave background elements',
      // v2 — human portrait
      'Japanese Irezumi traditional art of a geisha portrait from shoulders up with elaborate kanzashi hair ornaments and peony hairpins set against a large luminous full moon, maple leaf and cloud motifs, white background, bold black outlines, vivid crimson and gold flat fills, gakubori cloud elements',
      // v3 — mythological bird
      'Japanese Irezumi traditional art of a phoenix rising with wings fully spread through billowing fire and storm clouds, feathers trailing into flame tendrils, white background, bold black outlines, vivid crimson and gold flat fills, dramatic upward gakubori cloud and flame background',
      // v4 — warrior figure
      'Japanese Irezumi traditional art of a samurai warrior in full lacquered armor in a dynamic battle stance gripping a raised katana with cherry blossom petals falling all around, white background, bold black outlines, vivid navy and deep red flat fills, flowing dynamic composition',
    ],
  },
  {
    slug: 'black-grey-realism',
    prompts: [
      // v1 — animal portrait (EXISTING — do not change)
      'Black and grey realism illustration of a lion portrait, white background, zero outlines, smooth graywash shading only, single light source, photorealistic 3D volume, only black and grey tones',
      // v2 — skull / still life
      'Black and grey realism illustration of a human skull with deep cracks across the surface and rose blooms growing outward through the eye sockets and fissures, white background, zero outlines, smooth graywash shading, photorealistic bone and petal texture, only black and grey tones',
      // v3 — landscape / scene
      'Black and grey realism illustration of a stone lighthouse on a jagged rocky cliff battered by a violent ocean storm with enormous crashing waves and turbulent clouds, a single beam of light cutting through the darkness, white background, zero outlines, smooth atmospheric graywash shading, only black and grey tones',
      // v4 — surreal still life
      'Black and grey realism surrealist illustration of an ornate pocket watch melting and dripping off the edge of a flat surface like liquid pooling below, Dali-inspired dreamlike composition, white background, zero outlines, ultra-smooth graywash shading, single dramatic side light source, only black and grey tones',
    ],
  },
  {
    slug: 'micro-realism',
    prompts: [
      // v1 — insect (EXISTING — do not change)
      'Micro realism single-needle illustration of a detailed moth with spread wings showing fine vein patterns, pure white background, ultra-fine hairline strokes only, miniature hyper-detailed precision, extreme contrast between fine ink and white, no thick outlines anywhere',
      // v2 — botanical
      'Micro realism single-needle illustration of a single dandelion flower head with seeds detaching and scattering in the wind the seeds becoming tinier and sparser until they dissolve into bare white space, pure white background, ultra-fine hairline strokes only, miniature botanical precision, no thick outlines',
      // v3 — mechanical object
      'Micro realism single-needle illustration of an antique brass pocket compass with worn engraving marks a cracked crystal face scratched casing and a delicate quivering needle, pure white background, ultra-fine hairline strokes only, miniature mechanical and engraving detail, extreme precision, no thick outlines',
      // v4 — architectural
      'Micro realism single-needle illustration of a small stone lighthouse with individually rendered rock-course texture tiny arched windows and a detailed lantern room at the top, pure white background, ultra-fine hairline strokes only, miniature architectural and textural precision, extreme fine detail, no thick outlines',
    ],
  },
  {
    slug: 'color-realism',
    prompts: [
      // v1 — bird portrait (EXISTING — do not change)
      'Color realism painterly illustration of a vibrant tropical parrot portrait, pure white background, no black outlines anywhere, rich saturated luminous colors blending like oil paint, complementary orange and blue plumage, photorealistic feather texture',
      // v2 — botanical close-up
      'Color realism painterly illustration of a fully open peony flower head filling the entire frame with densely layered ruffled petals catching soft directional light, pure white background, no black outlines, rich luminous deep pink and soft coral colors blending like oil paint, photorealistic petal texture',
      // v3 — atmospheric landscape
      'Color realism painterly illustration of a dramatic golden-hour sunset sky with towering cumulonimbus clouds lit in deep gold orange magenta and violet layers, pure white background, no black outlines, rich luminous atmospheric colors blending like oil paint, painterly light and cloud texture',
      // v4 — amphibian
      'Color realism painterly illustration of a vivid poison dart frog sitting on a large wet tropical leaf with beaded water droplets all around it, pure white background, no black outlines, rich luminous electric blue and vivid yellow colors blending like oil paint, photorealistic amphibian skin and droplet texture',
    ],
  },
  {
    slug: 'blackwork',
    prompts: [
      // v1 — geometric animal face (EXISTING — do not change)
      'Blackwork bold illustration of a geometric tiger face built entirely from solid black shapes and negative space, pure white background, only pure solid black ink no grey tones, sharp angular geometry, powerful negative space contrast, zero gradients zero color',
      // v2 — landscape silhouette
      'Blackwork bold illustration of a dense pine forest silhouette entirely in solid black with trees of dramatically varying heights creating a jagged negative-space skyline, pure white background, only pure solid black ink, perfect crisp edges, no gradients no grey no color',
      // v3 — body / organic
      'Blackwork bold illustration of an anatomical human heart with arteries and veins abstracted into bold solid black interlocking geometric shapes and hard negative space channels, pure white background, only pure solid black ink, strong geometric abstraction of organic form, zero gradients',
      // v4 — sacred geometry / knotwork
      'Blackwork bold illustration of a large six-pointed star built from interlocking Celtic knotwork bands rendered entirely as solid black fills with precise negative-space channels weaving between them, pure white background, only pure solid black ink, complex geometric symmetry, zero gradients zero color',
    ],
  },
  {
    slug: 'cybersigilism',
    prompts: [
      // v1 — spine / body (EXISTING — do not change)
      'Cybersigilism biomechanical illustration of a vertebral spine merging with alien script circuits, pure white background, ultra-thin needle-sharp black lines only, aggressive organic geometry with long tapering stinger extensions, no fills anywhere, wiry alien calligraphy aesthetic',
      // v2 — skull
      'Cybersigilism biomechanical illustration of a human skull with the top of the cranium opened and dense alien circuit-script tendrils erupting upward like exploding data streams, pure white background, ultra-thin needle-sharp black lines only, no fills anywhere, aggressive wiry geometry, long barbed extensions',
      // v3 — wings / symbolic
      'Cybersigilism biomechanical illustration of a symmetrical pair of spread wings composed entirely of layered alien sigil glyphs and branching circuit traces with long tapering stinger feather-tips, pure white background, ultra-thin needle-sharp black lines only, no fills anywhere, aggressive organic geometry',
      // v4 — ouroboros / circular
      'Cybersigilism biomechanical illustration of an ouroboros serpent biting its own tail whose entire coiling body is formed from flowing alien script characters and winding circuit traces with barbed extensions, pure white background, ultra-thin needle-sharp black lines only, no fills anywhere, circular wiry composition',
    ],
  },
  {
    slug: 'dotwork',
    prompts: [
      // v1 — sacred geometry navigation (EXISTING — do not change)
      'Dotwork pointillist illustration of a geometric compass rose, pure white background, entire design built ONLY from individual stippled dots of varying density, dense dots for shadows sparse dots for highlights, no solid lines or fills anywhere, sacred geometry',
      // v2 — animal portrait
      'Dotwork pointillist illustration of a grizzly bear face portrait with detailed fur texture and a direct forward gaze, pure white background, entire design built ONLY from individual stippled dots of varying density, dense dots for dark fur and deep shadows fading to sparse dots for highlights, no solid lines or fills anywhere',
      // v3 — sacred geometry mandala
      'Dotwork pointillist illustration of a Sri Yantra sacred geometry mandala with its precisely nested interlocking triangles and outer lotus petals, pure white background, entire design built ONLY from individual stippled dots of varying density, dense dot clusters for structure fading to sparse highlights, no solid lines or fills',
      // v4 — nature / landscape
      'Dotwork pointillist illustration of a towering redwood tree with a full exposed root system spreading symmetrically below the ground line, pure white background, entire design built ONLY from individual stippled dots of varying density, atmospheric perspective shown through dot density from dense trunk to sparse canopy tips, no solid lines or fills',
    ],
  },
  {
    slug: 'trash-polka',
    prompts: [
      // v1 — skull (EXISTING — do not change)
      'Trash Polka collage illustration of a realistic human skull overlaid with dripping red paint splatters and torn geometric shapes, pure white background, ONLY black and red ink, bold sans-serif text fragments, chaotic aggressive layering, high contrast',
      // v2 — anatomical / organic
      'Trash Polka collage illustration of a detailed anatomical human heart with exposed arteries and veins overlaid with explosive red ink splatter bursts and aggressive black angular shapes, pure white background, ONLY black and red ink, bold uppercase stencil text fragments scattered across the composition, chaotic aggressive layering, high contrast',
      // v3 — broken object
      'Trash Polka collage illustration of a camera lens with a shattered spider-cracked face radiating from a bullet hole overlaid with red paint drips and aggressive black slashing mark-making, pure white background, ONLY black and red ink, torn collage text fragments, chaotic aggressive layering, high contrast',
      // v4 — symbolic object
      'Trash Polka collage illustration of a tall hourglass with sand streaming through it overlaid with violent diagonal red brushstroke slashes and torn black angular geometric shapes, pure white background, ONLY black and red ink, bold stencil number and text fragments, chaotic aggressive composition, high contrast',
    ],
  },
  {
    slug: 'ignorant-style',
    prompts: [
      // v1 — animal face (EXISTING — do not change)
      'Ignorant style hand-poked illustration of a wobbly cartoon cat face with big lopsided eyes, pure white background, intentionally shaky imperfect uneven lines, naive sharpie-on-skin aesthetic, flat 2D childlike drawing, wrong proportions, deliberately amateurish',
      // v2 — alien character / human figure
      'Ignorant style hand-poked illustration of a crudely drawn alien figure with a giant egg-shaped head a tiny body and stick arms waving awkwardly, three uneven eyes and a lopsided mouth, pure white background, intentionally shaky imperfect uneven lines, naive sharpie-on-skin aesthetic, wrong proportions, deliberately amateurish',
      // v3 — skull
      'Ignorant style hand-poked illustration of a lopsided skull face with mismatched hollow eye sockets a crooked row of teeth and an off-center nose hole, wobbly outline, pure white background, intentionally shaky imperfect uneven lines, naive sharpie-on-skin aesthetic, flat 2D childlike drawing, deliberately amateurish',
      // v4 — absurd animal
      'Ignorant style hand-poked illustration of a wobbly cartoon shark with a huge bulbous body tiny mismatched fins and comically small human-like legs underneath it wearing little boots and grinning with a big goofy smile, pure white background, intentionally shaky imperfect uneven lines, naive sharpie-on-skin aesthetic, wrong proportions, deliberately amateurish',
    ],
  },
  {
    slug: 'patchwork',
    prompts: [
      // v1 — classic sailor motifs (EXISTING — do not change)
      'Patchwork traditional flash sheet illustration, pure white background, six separate small classic tattoo designs in a grid, each piece fully enclosed in a thick white border outline, motifs include anchor heart dagger horseshoe rose and snake, old school sailor flash style',
      // v2 — occult / mystical motifs (completely different theme)
      'Patchwork occult flash sheet illustration, pure white background, six separate small classic occult tattoo designs arranged in a two-by-three grid, each design fully enclosed in its own thick white border box, motifs: all-seeing eye crescent moon crystal ball ouroboros snake eating its tail pentagram star and tarot card, old school flash style',
      // v3 — animal face portraits (completely different theme)
      'Patchwork animal portrait flash sheet illustration, pure white background, six separate small classic animal face tattoo designs arranged in a two-by-three grid, each design fully enclosed in its own thick white border box, motifs: roaring bear face wolf head eagle face coiled rattlesnake snarling panther and koi fish, old school flash style',
      // v4 — botanical / nature (completely different theme)
      'Patchwork botanical flash sheet illustration, pure white background, six separate small classic botanical tattoo designs arranged in a two-by-three grid, each design fully enclosed in its own thick white border box, motifs: red rose head daisy sunflower cherry blossom branch spotted mushroom and wildflower sprig, old school flash style',
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
