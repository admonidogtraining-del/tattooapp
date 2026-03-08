import { GoogleGenAI, Type } from "@google/genai";

// Uses Vite's env variable system — set VITE_GEMINI_API_KEY in your .env file
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

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

  const response = await ai.models.generateContent({
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

async function imagenGenerate(prompt: string): Promise<string> {
  const response = await ai.models.generateImages({
    model: 'imagen-4.0-generate-001',
    prompt,
    config: { numberOfImages: 1, aspectRatio: '1:1' },
  });
  const img = response.generatedImages?.[0]?.image;
  if (!img?.imageBytes) throw new Error('No image in response');
  const mime = img.mimeType ?? 'image/png';
  return `data:${mime};base64,${img.imageBytes}`;
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

/**
 * Generate or expand a tattoo concept prompt idea.
 * If the user has a rough idea, expands it. Otherwise creates something fresh.
 */
export async function generatePromptIdea(hint: string): Promise<string> {
  const instruction = hint.trim()
    ? `Take this rough tattoo idea and expand it into a rich, evocative 2-3 sentence concept description. Describe the visual elements, symbolism, and mood. Be specific and poetic. Idea: "${hint.trim()}"`
    : `Generate a creative, evocative tattoo concept description (2-3 sentences). Include specific visual elements, symbolism, and emotional mood. Make it personal and meaningful.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: instruction,
    config: {
      systemInstruction: 'You are a tattoo concept writer. Output only the concept description — no labels, no intro, no extra commentary. Just the vivid description.',
      maxOutputTokens: 200,
    },
  });

  const text = response.text?.trim();
  if (!text) throw new Error('No idea generated');
  return text;
}
