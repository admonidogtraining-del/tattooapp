import { GoogleGenAI, Type } from "@google/genai";

// Lazy singleton — avoids module-level throw when API key is absent at startup
let _ai: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!_ai) {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) throw new Error('VITE_GEMINI_API_KEY is not set. Add it to your .env file.');
    _ai = new GoogleGenAI({ apiKey });
  }
  return _ai;
}

const SYSTEM_INSTRUCTION = `You are "InkSight AI," a dual-specialized tattoo consultation system acting as both a Senior Tattoo Art Director and a Technical Prompt Architect. Your goal is to transform a user's personal story and emotions into a technically viable, aesthetically refined tattoo blueprint.

---

## YOUR CORE MODULES:

### MODULE 1 — ARTISTIC CONSULTANT
Extract the emotional "why" behind the tattoo. Your knowledge base includes:
- Art movements (14th-century woodcuts through Cyber-Sigilism)
- Symbolism: Mythological (Greek, Norse, Japanese), alchemical, and professional
- Tattoo styles: American Traditional, Neo-Traditional, Fine-Line/Micro-Realism, Japanese Irezumi, Blackwork & Dotwork, Bio-Mechanical

**Rules:**
- Map abstract concepts to visual metaphors. Example: "Endurance" → Sisyphus Stone, Stoic Pillar, or Anatomical Heart with Roots.
- If the user's prompt or concept is ambiguous, trigger a Discovery Loop by setting "discovery_required": true and providing "discovery_questions" with specific multiple-choice options (e.g., Emotional Tone, Aesthetic).

---

### MODULE 2 — ANATOMY & LONGEVITY ENGINE
Apply "Tattoo Physics" to every design:

**Placement Logic:**
- Forearm: Vertical designs only. Horizontal text distorts when wrist rotates.
- Ribs: Follow intercostal flow. High movement area.
- Spine: Mandatory vertical symmetry.
- Wrist/Ankle: Warn against high detail — thin skin, constant movement.

**Aging Prediction:**
- Flag any line gaps under 2mm as likely to merge within 5–10 years.
- Flag Micro-Realism on high-friction areas as "High Maintenance."

---

### MODULE 3 — IMAGE GENERATION ARCHITECT
Generate optimized prompts for DALL-E 3, Midjourney, and Stable Diffusion using this syntax:

[STYLE KEYWORD] + [SUBJECT DESCRIPTION] + [COMPOSITION/FLOW] + [TECHNICAL SPECS] + [BACKGROUND]

**Always include:**
- "White background, professional tattoo flash sheet"
- "High contrast, no skin texture, 2D flat representation"
- Shading descriptors: "Stipple shading" or "Solid black saturation"

---

### MODULE 4 — EXHAUSTIVE TECHNICAL MANUAL OF TATTOO STYLES
To give the absolute best technical foundation for editing and generating tattoos, use these Technical Specifications:

1. The Traditional & Illustrative Pillars
- American Traditional (Old School): Follows the "Bold Will Hold" rule. Single, heavy line weight (14RL) consistent across the piece. Color Palette: Strictly Black, Red, Gold, Green. No blending. Shading: "Spit Shading" or "Whip Shading" (black-to-skin gradient, grainy texture).
- Neo-Traditional: "Hierarchical Line Weights" (bold outer contour, thinner internal details). Color Palette: "Jewel Tones" (deep purples, teals, magentas), "Opaque Layering". Visual Identifiers: "Filigree", high-contrast "White Ink Highlights".
- Japanese (Irezumi): Focuses on "The Flow" with the muscle. Uses "Gakubori" (background patterns like Wind Bars, Waves, Clouds). Motif Logic: Dragons move upward; Koi move against current. Background elements match the season.

2. Realism & High-Resolution Styles
- Black & Grey Realism: Zero outlines. Built entirely using "Graywash". Uses "Soft Edge" logic. Light Source: Singular, consistent light source for 3D "Volume". Darkest blacks ("Power Blacks") only in deepest recessed areas.
- Micro-Realism: High-frequency detail in small area (under 3 inches). "Single Needle" (1RL). Prioritize "Contrast over Line". Texture: "Skin Breaks" (uninked skin for breathing room).
- Color Realism: "Painterly". "Solid Packing" of pigment. No black outline. "Complementary Color Contrast" defines shape.

3. Graphic, Technical & Abstract Styles
- Blackwork & Heavy Blackwork: Extreme saturation. Solid #000000 ink. Art found in "Negative Space". AI Edit Rule: High-contrast threshold, no gray gradients in solid blackwork areas.
- Cybersigilism / Bio-Organic: Sharp, aggressive, needle-thin lines ("Alien Script" + "Thorns"). Wraps around joints. Visual Identifiers: Long, tapering "Stingers".
- Dotwork / Pointillism: Form created through density of individual dots. Low-density = highlights; High-density = shadows. AI Texture: Do not "smooth", keep "Grainy" texture.
- Trash Polka: "Collage" style. 3 layers: Realistic portraits, Bold sans-serif Lettering, Abstract "Blood Splatters" or "Smudge" marks. Color Constraint: Strictly Black and Red.

4. Modern & "Anti-Aesthetic" Styles
- Ignorant Style: Intentional "Amateurism" (sharpie drawing/prison tattoo). Shaky lines, "Incorrect" proportions, flat 2D perspectives. AI Logic: Disable "Symmetry" and "Smoothing".
- Chrome / Liquid Metal: Hyper-realistic shading to simulate reflective surface. Key Variable: High-contrast "White Pitting" and "Curved Horizon Lines" reflected in metal.
- Sticker / Patchwork: Individual, unrelated tattoos. Visual Identifier: "White Border" around design.

5. Application Variables (Data Dictionary)
- Needle Depth Simulation: "Deep" (saturated) or "Surface" (faded/fine-line).
- Healing State: "Fresh" (redness, high gloss) or "Settled" (slightly blurred edges, matte finish).
- Skin Tone Interaction: How pigment interacts with Melanin (e.g., yellow ink on dark skin becomes golden-brown).
- Whip Shading Frequency: Distance between dots in gradient (High frequency = smooth; Low frequency = textured).
- Anatomical Wrapping: How 2D image distorts on 3D cylinder/sphere.

6. Compositional "Grammar" Commands
- "Apply 3pt Line Weight" (Standardizes outline).
- "Restrict Palette to Primary Pigments" (Removes complex blends).
- "Implement 30% Negative Space" (Ensures tattoo isn't crowded).
- "Anchor to Muscle Flow" (Aligns axis with bone/muscle).

---

### MODULE 5 — IMAGE ANALYSIS (if user uploads photos)
1. Map anatomy: note moles, scars, existing tattoos.
2. Suggest how new design nests into negative space of existing ink.
3. Match color: faded ink → recommend "Weathered Black" or "Opaque Grey."

---

## HARD CONSTRAINTS:
- NEVER use religious symbols in a derogatory context.
- ALWAYS warn if a design is too detailed for the requested size.
- If the user requests text: check spelling and recommend typography style.
- Output is ALWAYS valid JSON. Never break format.`;

export interface QuestionnaireData {
  skinColor: string;
  colorPreference: string;
  size: string;
  style: string;
}

export interface TattooConsultation {
  discovery_required?: boolean;
  discovery_questions?: { question: string; options: string[] }[];
  user_profile_analysis: {
    interpreted_style: string;
    symbolic_metaphors: string[];
    suggested_placement_logic: string;
  };
  technical_brief: {
    design_complexity: string;
    estimated_longevity: string;
    artist_notes: {
      needle_groupings: string;
      shading_style: string;
      color_palette_hex: string[];
    };
  };
  image_generation: {
    dalle_prompt: string;
    midjourney_prompt: string;
    variation_suggestions: string[];
  };
  aftercare_preview: {
    healing_difficulty: string;
    lifestyle_warning: string;
  };
}

export async function generateTattooConsultation(
  prompt: string,
  images: { data: string; mimeType: string }[],
  questionnaire: QuestionnaireData
): Promise<TattooConsultation> {
  const parts: object[] = [
    {
      text: `User Prompt: ${prompt}\n\nUser Profile & Preferences:\n- Skin Color: ${questionnaire.skinColor}\n- Color Preference: ${questionnaire.colorPreference}\n- Size: ${questionnaire.size}\n- Selected Style: ${questionnaire.style}`,
    },
  ];

  if (images && images.length > 0) {
    for (const img of images) {
      parts.unshift({
        inlineData: {
          data: img.data,
          mimeType: img.mimeType,
        },
      });
    }
  }

  const response = await getAI().models.generateContent({
    model: "gemini-2.5-flash",
    contents: { parts },
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.7,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          discovery_required: { type: Type.BOOLEAN },
          discovery_questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ["question", "options"],
            },
          },
          user_profile_analysis: {
            type: Type.OBJECT,
            properties: {
              interpreted_style: { type: Type.STRING },
              symbolic_metaphors: { type: Type.ARRAY, items: { type: Type.STRING } },
              suggested_placement_logic: { type: Type.STRING },
            },
            required: ["interpreted_style", "symbolic_metaphors", "suggested_placement_logic"],
          },
          technical_brief: {
            type: Type.OBJECT,
            properties: {
              design_complexity: { type: Type.STRING },
              estimated_longevity: { type: Type.STRING },
              artist_notes: {
                type: Type.OBJECT,
                properties: {
                  needle_groupings: { type: Type.STRING },
                  shading_style: { type: Type.STRING },
                  color_palette_hex: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ["needle_groupings", "shading_style", "color_palette_hex"],
              },
            },
            required: ["design_complexity", "estimated_longevity", "artist_notes"],
          },
          image_generation: {
            type: Type.OBJECT,
            properties: {
              dalle_prompt: { type: Type.STRING },
              midjourney_prompt: { type: Type.STRING },
              variation_suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["dalle_prompt", "midjourney_prompt", "variation_suggestions"],
          },
          aftercare_preview: {
            type: Type.OBJECT,
            properties: {
              healing_difficulty: { type: Type.STRING },
              lifestyle_warning: { type: Type.STRING },
            },
            required: ["healing_difficulty", "lifestyle_warning"],
          },
        },
        required: [
          "user_profile_analysis",
          "technical_brief",
          "image_generation",
          "aftercare_preview",
        ],
      },
    },
  });

  if (!response.text) {
    throw new Error("No response from AI");
  }

  return JSON.parse(response.text) as TattooConsultation;
}

function parseImagenError(err: unknown): Error {
  const msg = err instanceof Error ? err.message : String(err);
  try {
    // The SDK sometimes wraps the raw API JSON in the error message
    const json = JSON.parse(msg.includes('{') ? msg.slice(msg.indexOf('{')) : '{}');
    const code = json?.error?.code ?? json?.code;
    const status = json?.error?.status ?? json?.status;
    if (code === 429 || status === 'RESOURCE_EXHAUSTED') {
      return new Error(
        "Daily image generation limit reached (70 images/day). " +
        "Your quota resets at midnight Pacific Time — try again tomorrow."
      );
    }
  } catch { /* ignore parse errors */ }
  return err instanceof Error ? err : new Error(msg);
}

async function imagenGenerate(prompt: string): Promise<string> {
  try {
    const response = await getAI().models.generateImages({
      model: 'imagen-3.0-generate-001',
      prompt,
      config: { numberOfImages: 1, aspectRatio: '1:1' },
    });
    const img = response.generatedImages?.[0]?.image;
    if (!img?.imageBytes) throw new Error('No image in response');
    const mime = img.mimeType ?? 'image/png';
    return `data:${mime};base64,${img.imageBytes}`;
  } catch (err) {
    throw parseImagenError(err);
  }
}

/** Generate a style card preview image. */
export async function generateStyleCardImage(prompt: string): Promise<string> {
  return imagenGenerate(prompt);
}

/**
 * Generate the final tattoo design.
 * Prompt is pre-built with full style rules by buildStylePrompt().
 */
export async function generateTattooImage(prompt: string): Promise<string> {
  return imagenGenerate(prompt);
}

// Curated tattoo concept prompts — used when user clicks "Inspire Me" with no text.
// Each is optimised as a standalone concept for Imagen 4: specific subject,
// clear composition, symbolic meaning — no style name (added separately).
const TATTOO_INSPIRATIONS = [
  'A wolf skull fractured open with geometric crystals erupting from inside, crescent moon overhead — solitude becoming inner strength',
  'Twin koi locked in a yin-yang orbit, their scales dissolving into falling cherry blossoms — eternal balance inside constant struggle',
  'A compass shattering into moth wings mid-flight, the needle still pointing true north — finding direction through transformation',
  'A lighthouse consumed by rising water, its flame still burning above the surface — persistence when everything else drowns',
  'An ouroboros serpent whose body is made of dense geometric line-work, tail dissolving into stardust — endless reinvention',
  'A samurai helmet cracked open with cherry blossoms erupting through the fractures — beauty born directly from something broken',
  'A black bear standing motionless inside a waterfall, eyes closed — the quiet power of stillness under pressure',
  'An antler crown overgrown with wildflowers, a raven perched at its peak holding a pocket watch — time reclaimed by nature',
  'A ribcage with a rose garden growing from within, roots threading between the bones — life flourishing in unlikely places',
  "A human silhouette mid-step dissolving into a murmuration of starlings — releasing who you were to become something larger",
  'A tiger eye in extreme close-up, iris reflecting a mountain range, surrounded by razor grass — predatory clarity',
  'An anatomical heart with deep oak roots below and bare winter branches above — love as a living, seasonal organism',
  'A snake coiled around a cracked hourglass, time spilling as sand blossoms into flowers — mortality made beautiful',
  'A hummingbird suspended at a dying flower, wings blurred into pure speed — the urgency of fragile, precious moments',
  'A hand reaching through storm clouds clutching a single lit match — isolation discovering its own quiet fire',
  'A chrysalis splitting open with a galaxy pouring out instead of a butterfly — the extraordinary dormant inside the ordinary',
  'A fox curled asleep, its tail forming a perfect circle, constellation patterns mapped across its fur — knowing your place in the cosmos',
  'A crumbling Greek column overgrown with ivy, a single candle still burning at the capital — what survives despite everything',
  'A Viking longship crossing a sea made entirely of black ink, storm clouds shaped like charging wolves — courage into the unknown',
  'Stacked vertebrae with a single wildflower growing through the spinal canal — resilience wired into the body itself',
  'A panther mid-leap through a shattered mirror, each shard reflecting a different version of the same eye — identity in fragments',
  'A dead tree on a cliff edge, its hollow filled with a swarm of luminous fireflies — beauty choosing the darkest places',
  'An astronaut floating free, tether cut, Earth reflected in the visor — the terrifying freedom of letting go',
  'A serpent shedding its skin into wildflowers — the transformation that hurts and the beauty that follows pain',
  'A full-face wolf howling, northern lights reflected in its eye — the wild thing inside you, finally acknowledged',
];

/**
 * Generate or expand a tattoo concept prompt idea.
 * Empty state or already-inspired prompt: instant random pick from curated list (no API call).
 * With user's own typed hint: expands via Gemini.
 */
export async function generatePromptIdea(hint: string): Promise<string> {
  const randomInspiration = (exclude?: string) => {
    const pool = exclude
      ? TATTOO_INSPIRATIONS.filter(i => i !== exclude)
      : TATTOO_INSPIRATIONS;
    return pool[Math.floor(Math.random() * pool.length)];
  };

  const trimmed = hint.trim();

  // No hint OR the current text is already one of our curated inspirations
  // → just pick a fresh random one (never the same as current)
  if (!trimmed || TATTOO_INSPIRATIONS.includes(trimmed)) {
    return randomInspiration(trimmed || undefined);
  }

  // Try Gemini expansion with a 3-second hard timeout.
  // Falls back to a random inspiration if API is slow, missing, or errors.
  try {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), 3000)
    );
    const gemini = getAI().models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `User's rough idea: "${hint.trim()}"`,
      config: {
        systemInstruction: `You are a master tattoo concept writer and Imagen prompt engineer.

Your job: transform a rough idea into ONE punchy tattoo concept sentence that will produce an outstanding result when fed into an AI image generator (Imagen 4).

Rules for the output sentence:
- Lead with the EXACT visual subject (animal, object, figure, symbol — be specific)
- Add 1-2 key design details (pose, composition, extra elements)
- End with the emotional/symbolic meaning in a short clause
- MAX 35 words. NO style name (style is added separately). NO filler words.
- Output ONLY the single sentence. No quotes, no label, no intro.

Good examples:
"A stoic wolf skull fractured open with geometric crystals growing inside, crescent moon overhead — solitude becoming strength"
"Twin koi circling each other in a yin-yang formation, scales rendered as falling cherry blossoms — the beauty inside constant struggle"
"A compass shattered into moth wings mid-flight, needle pointing true north — finding direction through transformation"`,
        maxOutputTokens: 80,
        temperature: 0.9,
      },
    });
    const response = await Promise.race([gemini, timeout]);
    const text = response.text?.trim().replace(/^["']|["']$/g, '').replace(/\.$/, '');
    if (text && text.length > 10) return text;
  } catch {
    // Silently fall back to random
  }

  return randomInspiration(trimmed);
}
