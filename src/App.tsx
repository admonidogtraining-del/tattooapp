import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Upload, PenTool, Sparkles, AlertTriangle, Image as ImageIcon,
  ChevronRight, Droplet, ChevronLeft, X, Download, Plus, Maximize
} from 'lucide-react';
import {
  generateTattooConsultation,
  generateTattooImage,
  TattooConsultation,
  QuestionnaireData
} from './services/geminiService';

const BODY_SHAPES = [
  { id: 'Ectomorph', name: 'Ectomorph', desc: 'Lean & Slender' },
  { id: 'Mesomorph', name: 'Mesomorph', desc: 'Athletic & Muscular' },
  { id: 'Endomorph', name: 'Endomorph', desc: 'Broad & Stocky' },
  { id: 'Hourglass', name: 'Hourglass', desc: 'Balanced top/bottom, defined waist' },
  { id: 'Pear', name: 'Pear', desc: 'Wider hips than shoulders' },
  { id: 'Apple', name: 'Apple', desc: 'Broader upper body & midsection' },
];

const TATTOO_STYLES = [
  {
    id: 'American Traditional',
    name: 'American Traditional',
    desc: 'Bold lines, solid colors (red, yellow, green, black).',
    img: 'https://image.pollinations.ai/prompt/American%20Traditional%20Tattoo%20Flash%20Art?width=400&height=300&nologo=true',
  },
  {
    id: 'Neo-Traditional',
    name: 'Neo-Traditional',
    desc: 'Varying line weights, jewel tones, filigree.',
    img: 'https://image.pollinations.ai/prompt/Neo-Traditional%20Tattoo%20Art%20Design?width=400&height=300&nologo=true',
  },
  {
    id: 'Japanese (Irezumi)',
    name: 'Japanese (Irezumi)',
    desc: 'Flowing backgrounds, mythological motifs.',
    img: 'https://image.pollinations.ai/prompt/Japanese%20Irezumi%20Tattoo%20Art?width=400&height=300&nologo=true',
  },
  {
    id: 'Black & Grey Realism',
    name: 'Black & Grey Realism',
    desc: 'Smooth shading, no outlines, highly detailed.',
    img: 'https://image.pollinations.ai/prompt/Black%20and%20Grey%20Realism%20Tattoo%20Portrait?width=400&height=300&nologo=true',
  },
  {
    id: 'Micro-Realism',
    name: 'Micro-Realism',
    desc: 'Tiny, intricate details using single needle.',
    img: 'https://image.pollinations.ai/prompt/Micro-Realism%20Tiny%20Tattoo%20Art?width=400&height=300&nologo=true',
  },
  {
    id: 'Color Realism',
    name: 'Color Realism',
    desc: 'Painterly, vibrant, no black outlines.',
    img: 'https://image.pollinations.ai/prompt/Color%20Realism%20Tattoo%20Art?width=400&height=300&nologo=true',
  },
  {
    id: 'Blackwork',
    name: 'Blackwork',
    desc: 'Heavy black saturation, negative space.',
    img: 'https://image.pollinations.ai/prompt/Heavy%20Blackwork%20Tattoo%20Mandala?width=400&height=300&nologo=true',
  },
  {
    id: 'Cybersigilism',
    name: 'Cybersigilism',
    desc: 'Sharp, aggressive, wire-like thin lines.',
    img: 'https://image.pollinations.ai/prompt/Cybersigilism%20Tattoo%20Design%20Sharp%20Lines?width=400&height=300&nologo=true',
  },
  {
    id: 'Dotwork',
    name: 'Dotwork',
    desc: 'Images created entirely with stippled dots.',
    img: 'https://image.pollinations.ai/prompt/Dotwork%20Pointillism%20Tattoo%20Art?width=400&height=300&nologo=true',
  },
  {
    id: 'Trash Polka',
    name: 'Trash Polka',
    desc: 'Collage style, black and red, chaotic.',
    img: 'https://image.pollinations.ai/prompt/Trash%20Polka%20Tattoo%20Red%20and%20Black?width=400&height=300&nologo=true',
  },
  {
    id: 'Ignorant Style',
    name: 'Ignorant Style',
    desc: 'Intentional amateurism, simple line drawings.',
    img: 'https://image.pollinations.ai/prompt/Ignorant%20Style%20Tattoo%20Simple%20Line%20Art?width=400&height=300&nologo=true',
  },
  {
    id: 'Patchwork',
    name: 'Patchwork',
    desc: 'Collection of small, unrelated tattoos.',
    img: 'https://image.pollinations.ai/prompt/Patchwork%20Tattoo%20Sleeve%20Collection?width=400&height=300&nologo=true',
  },
];

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [images, setImages] = useState<{ data: string; mimeType: string; url: string }[]>([]);
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireData>({
    gender: '',
    weight: '5',
    bodyShape: '',
    skinColor: '',
    placement: '',
    colorPreference: '',
    size: '',
    style: '',
  });
  const [step, setStep] = useState<
    'initial' | 'questionnaire' | 'style_selection' | 'generating' | 'discovery' | 'results'
  >('initial');
  const [discoveryAnswers, setDiscoveryAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<TattooConsultation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [customImagePrompt, setCustomImagePrompt] = useState<string>('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [showTryOn, setShowTryOn] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length === 0) return;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        setImages((prev) => [
          ...prev,
          { data: base64Data, mimeType: file.type, url: URL.createObjectURL(file) },
        ]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleContinueToQuestionnaire = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() && images.length === 0) return;
    setStep('questionnaire');
  };

  const handleContinueToStyle = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('style_selection');
  };

  const handleSubmit = async (e?: React.FormEvent, isDiscoverySubmit = false) => {
    if (e) e.preventDefault();
    setStep('generating');
    setError(null);
    try {
      let finalPrompt = prompt;
      if (isDiscoverySubmit) {
        const answersText = Object.entries(discoveryAnswers)
          .map(([q, a]) => `Q: ${q}\nA: ${a}`)
          .join('\n');
        finalPrompt += `\n\nClarifications:\n${answersText}`;
      }

      const consultation = await generateTattooConsultation(
        finalPrompt,
        images.map((img) => ({ data: img.data, mimeType: img.mimeType })),
        questionnaire
      );

      if (consultation.discovery_required && !isDiscoverySubmit) {
        setResult(consultation);
        setStep('discovery');
      } else {
        setResult(consultation);
        setStep('results');
      }
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Failed to generate consultation. Please try again.';
      setError(message);
      setStep(isDiscoverySubmit ? 'discovery' : 'style_selection');
    }
  };

  const handleDiscoveryAnswer = (question: string, answer: string) => {
    setDiscoveryAnswers((prev) => ({ ...prev, [question]: answer }));
  };

  const handleReset = () => {
    setPrompt('');
    setImages([]);
    setQuestionnaire({
      gender: '',
      weight: '5',
      bodyShape: '',
      skinColor: '',
      placement: '',
      colorPreference: '',
      size: '',
      style: '',
    });
    setStep('initial');
    setResult(null);
    setError(null);
    setGeneratedImage(null);
    setCustomImagePrompt('');
    setIsGeneratingImage(false);
    setDiscoveryAnswers({});
    setShowTryOn(false);
  };

  const handleGenerateImage = async () => {
    if (!result) return;
    setIsGeneratingImage(true);
    setError(null);
    try {
      const promptToUse = customImagePrompt.trim() || result.image_generation.dalle_prompt;
      const imageBase64 = await generateTattooImage(promptToUse);
      setGeneratedImage(imageBase64);
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Failed to generate image. Please try again.';
      setError(message);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-zinc-800 selection:text-zinc-50">
      <header className="border-b border-zinc-900 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={handleReset}>
            <div className="w-8 h-8 rounded-full bg-zinc-100 text-zinc-950 flex items-center justify-center">
              <PenTool size={18} className="stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight leading-none">InkSight AI</h1>
              <p className="text-xs text-zinc-500 font-mono mt-1 uppercase tracking-widest">
                Art Director & Prompt Architect
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="px-6 py-12">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          multiple
          className="hidden"
        />

        <AnimatePresence mode="wait">
          {/* ── STEP 1: UPLOAD ── */}
          {step === 'initial' && (
            <motion.div
              key="initial"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto mt-12"
            >
              <h2 className="text-4xl font-light tracking-tight mb-4 text-center">
                Begin Consultation
              </h2>
              <p className="text-zinc-400 text-center mb-12">
                Upload reference photos or describe your concept to start.
              </p>

              <div className="space-y-8">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-square rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 group"
                    >
                      <img
                        src={img.url}
                        alt={`Upload ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => removeImage(idx)}
                        className="absolute top-2 right-2 w-8 h-8 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square border-2 border-dashed border-zinc-800 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-zinc-900/50 hover:border-zinc-700 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-500 group-hover:text-zinc-300 group-hover:scale-110 transition-all">
                      {images.length > 0 ? <Plus size={20} /> : <Upload size={20} />}
                    </div>
                    <p className="text-xs font-medium text-zinc-400">
                      {images.length > 0 ? 'Add Photo' : 'Upload Photos'}
                    </p>
                  </div>
                </div>

                <div className="relative flex items-center py-4">
                  <div className="flex-grow border-t border-zinc-900"></div>
                  <span className="flex-shrink-0 mx-4 text-xs font-mono uppercase tracking-widest text-zinc-600">
                    And / Or
                  </span>
                  <div className="flex-grow border-t border-zinc-900"></div>
                </div>

                <form onSubmit={handleContinueToQuestionnaire} className="space-y-4">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe your story, emotions, or concept..."
                    className="w-full h-32 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-500 focus:border-zinc-500 transition-all resize-none placeholder:text-zinc-600"
                  />
                  <button
                    type="submit"
                    disabled={!prompt.trim() && images.length === 0}
                    className="w-full bg-zinc-100 text-zinc-950 rounded-xl py-3.5 px-4 text-sm font-medium hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    Continue to Details <ChevronRight size={16} />
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {/* ── STEP 2: QUESTIONNAIRE ── */}
          {step === 'questionnaire' && (
            <motion.div
              key="questionnaire"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl mx-auto mt-8"
            >
              <button
                onClick={() => setStep('initial')}
                className="text-sm text-zinc-400 hover:text-zinc-200 flex items-center gap-2 mb-8 transition-colors"
              >
                <ChevronLeft size={16} /> Back
              </button>

              <div className="mb-8">
                <h2 className="text-3xl font-light tracking-tight mb-2">
                  Technical Specifications
                </h2>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  To give the absolute best technical foundation for editing and generating tattoos,
                  we need to move beyond "vibes". Please provide the mechanical constraints.
                </p>
              </div>

              <form onSubmit={handleContinueToStyle} className="space-y-8">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3 block">
                      Gender
                    </label>
                    <select
                      required
                      value={questionnaire.gender}
                      onChange={(e) => setQuestionnaire({ ...questionnaire, gender: e.target.value })}
                      className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-base font-sans text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                    >
                      <option value="" disabled>
                        Select...
                      </option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other / Prefer not to say</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3 flex justify-between">
                      <span>Body Weight Scale</span>
                      <span>{questionnaire.weight}/10</span>
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={questionnaire.weight}
                      onChange={(e) => setQuestionnaire({ ...questionnaire, weight: e.target.value })}
                      className="w-full accent-zinc-500 mt-4"
                    />
                    <div className="flex justify-between text-sm font-medium text-zinc-400 uppercase tracking-wider mt-2">
                      <span>Very Slim</span>
                      <span>Average</span>
                      <span>Heavy</span>
                    </div>
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3 block">
                      Body Shape
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {BODY_SHAPES.map((shape) => (
                        <div
                          key={shape.id}
                          onClick={() => setQuestionnaire({ ...questionnaire, bodyShape: shape.id })}
                          className={`cursor-pointer p-4 rounded-xl border transition-all ${
                            questionnaire.bodyShape === shape.id
                              ? 'bg-zinc-800 border-zinc-500'
                              : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
                          }`}
                        >
                          <p className="text-base font-sans text-zinc-100 mb-1">{shape.name}</p>
                          <p className="text-sm font-sans text-zinc-400">{shape.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3 block">
                      Skin Color (Melanin)
                    </label>
                    <select
                      required
                      value={questionnaire.skinColor}
                      onChange={(e) =>
                        setQuestionnaire({ ...questionnaire, skinColor: e.target.value })
                      }
                      className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-base font-sans text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                    >
                      <option value="" disabled>
                        Select...
                      </option>
                      <option value="Very Light (Type I)">Very Light (Type I)</option>
                      <option value="Light (Type II)">Light (Type II)</option>
                      <option value="Medium (Type III/IV)">Medium (Type III/IV)</option>
                      <option value="Dark (Type V)">Dark (Type V)</option>
                      <option value="Very Dark (Type VI)">Very Dark (Type VI)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3 block">
                      Placement
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="e.g., Inner Forearm, Upper Back, Ribs..."
                      value={questionnaire.placement}
                      onChange={(e) =>
                        setQuestionnaire({ ...questionnaire, placement: e.target.value })
                      }
                      className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-base font-sans text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-500 placeholder:text-zinc-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3 block">
                      Color Preference
                    </label>
                    <select
                      required
                      value={questionnaire.colorPreference}
                      onChange={(e) =>
                        setQuestionnaire({ ...questionnaire, colorPreference: e.target.value })
                      }
                      className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-base font-sans text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                    >
                      <option value="" disabled>
                        Select...
                      </option>
                      <option value="Black & Grey Only">Black & Grey Only</option>
                      <option value="Full Color">Full Color</option>
                      <option value="Black with Color Accents">Black with Color Accents</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3 block">
                      Size
                    </label>
                    <select
                      required
                      value={questionnaire.size}
                      onChange={(e) =>
                        setQuestionnaire({ ...questionnaire, size: e.target.value })
                      }
                      className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-base font-sans text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                    >
                      <option value="" disabled>
                        Select...
                      </option>
                      <option value="Micro (Under 2 inches)">Micro (Under 2 inches)</option>
                      <option value="Small (2-4 inches)">Small (2-4 inches)</option>
                      <option value="Medium (4-7 inches)">Medium (4-7 inches)</option>
                      <option value="Large (7-12 inches)">Large (7-12 inches)</option>
                      <option value="Extra Large (Full Sleeve/Back)">
                        Extra Large (Full Sleeve/Back)
                      </option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-900">
                  <button
                    type="submit"
                    disabled={!questionnaire.bodyShape}
                    className="w-full bg-zinc-100 text-zinc-950 rounded-xl py-4 px-4 text-base font-medium hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    Continue to Style Selection <ChevronRight size={16} />
                  </button>
                </div>

                {error && (
                  <div className="p-4 bg-red-950/30 border border-red-900/50 rounded-xl text-red-400 text-sm flex items-start gap-3">
                    <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                    <p>{error}</p>
                  </div>
                )}
              </form>
            </motion.div>
          )}

          {/* ── STEP 3: STYLE SELECTION ── */}
          {step === 'style_selection' && (
            <motion.div
              key="style_selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-5xl mx-auto mt-8"
            >
              <button
                onClick={() => setStep('questionnaire')}
                className="text-sm text-zinc-400 hover:text-zinc-200 flex items-center gap-2 mb-8 transition-colors"
              >
                <ChevronLeft size={16} /> Back to Details
              </button>

              <div className="mb-8">
                <h2 className="text-3xl font-light tracking-tight mb-2">Select Tattoo Style</h2>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Choose the aesthetic direction for your tattoo. This helps us generate the correct
                  technical prompts.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {TATTOO_STYLES.map((style) => (
                  <div
                    key={style.id}
                    onClick={() => setQuestionnaire({ ...questionnaire, style: style.id })}
                    className={`cursor-pointer group relative rounded-2xl overflow-hidden border-2 transition-all ${
                      questionnaire.style === style.id
                        ? 'border-zinc-300'
                        : 'border-zinc-800 hover:border-zinc-600'
                    }`}
                  >
                    <div className="aspect-[4/3] relative">
                      <img
                        src={style.img}
                        alt={style.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-5">
                        <h3 className="text-base font-sans font-medium text-white mb-1">
                          {style.name}
                        </h3>
                        <p className="text-sm font-sans text-zinc-300 line-clamp-2">{style.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-zinc-900 flex justify-end">
                <button
                  onClick={(e) => handleSubmit(e, false)}
                  disabled={!questionnaire.style}
                  className="w-full sm:w-auto bg-zinc-100 text-zinc-950 rounded-xl py-4 px-8 text-base font-medium hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles size={16} />
                  Generate Technical Blueprint
                </button>
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-950/30 border border-red-900/50 rounded-xl text-red-400 text-sm flex items-start gap-3">
                  <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}
            </motion.div>
          )}

          {/* ── STEP 4: DISCOVERY LOOP ── */}
          {step === 'discovery' && result?.discovery_questions && (
            <motion.div
              key="discovery"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl mx-auto mt-8"
            >
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg mb-6">
                  <AlertTriangle size={14} className="text-yellow-500" />
                  <span className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
                    Discovery Loop Triggered
                  </span>
                </div>
                <h2 className="text-3xl font-light tracking-tight mb-2">Clarify Your Concept</h2>
                <p className="text-base font-sans text-zinc-400 leading-relaxed">
                  Your prompt is a bit ambiguous. To give you the best technical blueprint, please
                  clarify the following:
                </p>
              </div>

              <div className="space-y-8">
                {result.discovery_questions.map((q, idx) => (
                  <div key={idx} className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6">
                    <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4">
                      {q.question}
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {q.options.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => handleDiscoveryAnswer(q.question, opt)}
                          className={`p-4 rounded-xl border text-left transition-all ${
                            discoveryAnswers[q.question] === opt
                              ? 'bg-zinc-800 border-zinc-500 text-zinc-100'
                              : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                          }`}
                        >
                          <span className="text-base font-sans">{opt}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="pt-4 border-t border-zinc-900">
                  <button
                    onClick={(e) => handleSubmit(e, true)}
                    disabled={
                      Object.keys(discoveryAnswers).length !== result.discovery_questions.length
                    }
                    className="w-full bg-zinc-100 text-zinc-950 rounded-xl py-4 px-4 text-base font-medium hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    <Sparkles size={16} />
                    Finalize Blueprint
                  </button>
                </div>

                {error && (
                  <div className="p-4 bg-red-950/30 border border-red-900/50 rounded-xl text-red-400 text-sm flex items-start gap-3">
                    <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                    <p>{error}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ── GENERATING LOADER ── */}
          {step === 'generating' && (
            <motion.div
              key="generating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-md mx-auto mt-32 flex flex-col items-center justify-center text-zinc-500 space-y-8"
            >
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 border-2 border-zinc-800 rounded-full" />
                <div className="absolute inset-0 border-2 border-zinc-400 rounded-full border-t-transparent animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <PenTool size={24} className="text-zinc-400 animate-pulse" />
                </div>
              </div>
              <div className="text-center space-y-3">
                <p className="text-base font-sans font-medium text-zinc-300">
                  Consulting Art Director...
                </p>
                <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider">
                  Analyzing anatomy & longevity
                </p>
              </div>
            </motion.div>
          )}

          {/* ── STEP 5: RESULTS ── */}
          {step === 'results' && result && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-6xl mx-auto space-y-8"
            >
              <button
                onClick={handleReset}
                className="text-sm text-zinc-400 hover:text-zinc-200 flex items-center gap-2 mb-8 transition-colors"
              >
                <ChevronLeft size={16} /> Start New Consultation
              </button>

              <div className="grid sm:grid-cols-2 gap-6">
                {/* Artistic Consultant */}
                <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6 space-y-6">
                  <div className="flex items-center gap-3 pb-4 border-b border-zinc-800/50">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                      <Sparkles size={16} />
                    </div>
                    <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
                      Artistic Consultant
                    </h3>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-zinc-400 uppercase tracking-wider block mb-3">
                      Interpreted Style
                    </p>
                    <p className="text-lg font-medium text-zinc-100">
                      {result.user_profile_analysis.interpreted_style}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-zinc-400 uppercase tracking-wider block mb-3">
                      Symbolic Metaphors
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {result.user_profile_analysis.symbolic_metaphors.map((m, i) => (
                        <span
                          key={i}
                          className="px-3 py-1.5 bg-zinc-800 text-zinc-100 text-sm rounded-lg border border-zinc-700"
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-zinc-400 uppercase tracking-wider block mb-3">
                      Placement Logic
                    </p>
                    <p className="text-base font-sans text-zinc-100 leading-relaxed">
                      {result.user_profile_analysis.suggested_placement_logic}
                    </p>
                  </div>
                </div>

                {/* Anatomy & Longevity */}
                <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6 space-y-6">
                  <div className="flex items-center gap-3 pb-4 border-b border-zinc-800/50">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                      <Droplet size={16} />
                    </div>
                    <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
                      Anatomy & Longevity
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/50">
                      <p className="text-sm font-medium text-zinc-400 uppercase tracking-wider block mb-1">
                        Complexity
                      </p>
                      <p className="text-2xl font-light text-zinc-100">
                        {result.technical_brief.design_complexity}
                        <span className="text-sm text-zinc-600">/10</span>
                      </p>
                    </div>
                    <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/50">
                      <p className="text-sm font-medium text-zinc-400 uppercase tracking-wider block mb-1">
                        Longevity
                      </p>
                      <p className="text-base font-sans text-zinc-100 mt-1">
                        {result.technical_brief.estimated_longevity}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-medium text-zinc-400 uppercase tracking-wider block mb-3">
                      Artist Notes
                    </p>
                    <div className="space-y-2 text-base font-sans">
                      <div className="flex justify-between items-center border-b border-zinc-800/50 pb-2">
                        <span className="text-zinc-400">Needles</span>
                        <span className="font-mono text-zinc-300">
                          {result.technical_brief.artist_notes.needle_groupings}
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-b border-zinc-800/50 pb-2">
                        <span className="text-zinc-400">Shading</span>
                        <span className="text-zinc-100">
                          {result.technical_brief.artist_notes.shading_style}
                        </span>
                      </div>
                      <div className="pt-1">
                        <span className="text-zinc-400 block mb-2">Palette</span>
                        <div className="flex gap-2">
                          {result.technical_brief.artist_notes.color_palette_hex.map((hex, i) => (
                            <div
                              key={i}
                              className="w-6 h-6 rounded-full border border-zinc-700 shadow-sm"
                              style={{ backgroundColor: hex }}
                              title={hex}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Prompt Architect */}
              <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6 space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-zinc-800/50">
                  <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                    <ImageIcon size={16} />
                  </div>
                  <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
                    Prompt Architect
                  </h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-zinc-400 uppercase tracking-wider flex items-center justify-between mb-3">
                      <span>Midjourney Prompt</span>
                      <button
                        onClick={() =>
                          navigator.clipboard.writeText(result.image_generation.midjourney_prompt)
                        }
                        className="text-zinc-400 hover:text-zinc-200 transition-colors"
                      >
                        Copy
                      </button>
                    </p>
                    <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 font-mono text-sm text-zinc-300 leading-relaxed">
                      {result.image_generation.midjourney_prompt}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-zinc-400 uppercase tracking-wider flex items-center justify-between mb-3">
                      <span>DALL-E 3 Prompt</span>
                      <button
                        onClick={() =>
                          navigator.clipboard.writeText(result.image_generation.dalle_prompt)
                        }
                        className="text-zinc-400 hover:text-zinc-200 transition-colors"
                      >
                        Copy
                      </button>
                    </p>
                    <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 font-mono text-sm text-zinc-300 leading-relaxed">
                      {result.image_generation.dalle_prompt}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-zinc-400 uppercase tracking-wider block mb-3">
                      Variations
                    </p>
                    <ul className="space-y-2">
                      {result.image_generation.variation_suggestions.map((v, i) => (
                        <li key={i} className="text-base font-sans text-zinc-100 flex items-start gap-2">
                          <span className="text-zinc-600 mt-1">•</span>
                          {v}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Aftercare Preview */}
              <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6">
                <div className="flex items-center gap-3 pb-4 border-b border-zinc-800/50 mb-6">
                  <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                    <AlertTriangle size={16} />
                  </div>
                  <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
                    Aftercare Preview
                  </h3>
                </div>

                <div className="grid sm:grid-cols-[200px_1fr] gap-6">
                  <div>
                    <p className="text-sm font-medium text-zinc-400 uppercase tracking-wider block mb-3">
                      Healing Difficulty
                    </p>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          result.aftercare_preview.healing_difficulty.toLowerCase().includes('high')
                            ? 'bg-red-500'
                            : result.aftercare_preview.healing_difficulty
                                  .toLowerCase()
                                  .includes('med')
                              ? 'bg-yellow-500'
                              : 'bg-emerald-500'
                        }`}
                      />
                      <span className="text-base font-sans">
                        {result.aftercare_preview.healing_difficulty}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-400 uppercase tracking-wider block mb-3">
                      Lifestyle Warning
                    </p>
                    <p className="text-base font-sans text-zinc-100 leading-relaxed bg-zinc-950 p-4 rounded-xl border border-zinc-800/50">
                      {result.aftercare_preview.lifestyle_warning}
                    </p>
                  </div>
                </div>
              </div>

              {/* Concept Art */}
              <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6">
                <div className="flex items-center gap-3 pb-4 border-b border-zinc-800/50 mb-6">
                  <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                    <ImageIcon size={16} />
                  </div>
                  <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
                    Concept Art
                  </h3>
                </div>

                <div className="flex flex-col items-center justify-center">
                  {!generatedImage && !isGeneratingImage && (
                    <div className="text-center space-y-4 py-8">
                      <p className="text-sm text-zinc-400">
                        Ready to see a visual concept of your tattoo?
                      </p>
                      <button
                        onClick={handleGenerateImage}
                        className="bg-zinc-100 text-zinc-950 rounded-xl py-3 px-6 text-sm font-medium hover:bg-white transition-all flex items-center gap-2 mx-auto"
                      >
                        <Sparkles size={16} />
                        Generate Visual Concept
                      </button>
                    </div>
                  )}

                  {isGeneratingImage && (
                    <div className="py-12 flex flex-col items-center justify-center space-y-4">
                      <div className="relative w-12 h-12">
                        <div className="absolute inset-0 border-2 border-zinc-800 rounded-full" />
                        <div className="absolute inset-0 border-2 border-zinc-400 rounded-full border-t-transparent animate-spin" />
                      </div>
                      <p className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
                        Generating Image...
                      </p>
                    </div>
                  )}

                  {generatedImage && !isGeneratingImage && (
                    <div className="w-full max-w-md mx-auto space-y-4">
                      <div className="relative aspect-square rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950">
                        <img
                          src={generatedImage}
                          alt="Generated Tattoo Concept"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex justify-center gap-6">
                        <a
                          href={generatedImage}
                          download="inksight-concept.png"
                          className="text-sm text-zinc-400 hover:text-zinc-200 flex items-center gap-2 transition-colors"
                        >
                          <Download size={16} /> Download
                        </a>
                        <button
                          onClick={() => setShowTryOn(true)}
                          className="text-sm text-zinc-400 hover:text-zinc-200 flex items-center gap-2 transition-colors"
                        >
                          <Maximize size={16} /> Try on Body
                        </button>
                      </div>

                      <div className="pt-6 mt-6 border-t border-zinc-800/50">
                        <label className="text-sm font-medium text-zinc-400 uppercase tracking-wider block mb-3">
                          Not quite right? Tweak the prompt
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={customImagePrompt}
                            onChange={(e) => setCustomImagePrompt(e.target.value)}
                            placeholder={result.image_generation.dalle_prompt}
                            className="flex-1 bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 text-base font-sans text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-500 placeholder:text-zinc-600"
                          />
                          <button
                            onClick={handleGenerateImage}
                            className="bg-zinc-800 text-zinc-100 rounded-xl px-4 py-3 text-base font-medium hover:bg-zinc-700 transition-all flex items-center gap-2 shrink-0"
                          >
                            <Sparkles size={16} />
                            Regenerate
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── TRY-ON MODAL ── */}
        <AnimatePresence>
          {showTryOn && generatedImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 sm:p-6"
            >
              <div className="relative w-full max-w-2xl aspect-[3/4] sm:aspect-square rounded-[40px] sm:rounded-[100px] overflow-hidden shadow-inner flex items-center justify-center border-8 border-zinc-900 bg-[#e3c2a4]">
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-90"
                  style={{
                    backgroundImage:
                      "url('https://images.unsplash.com/photo-1535295972055-1c762f4483e5?auto=format&fit=crop&q=80&w=800')",
                  }}
                />

                <button
                  onClick={() => setShowTryOn(false)}
                  className="absolute top-6 right-6 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/80 transition-colors z-20"
                >
                  <X size={20} />
                </button>

                <p className="absolute top-6 left-6 text-black/70 text-sm font-medium uppercase tracking-wider z-20 bg-white/50 px-3 py-1 rounded-full backdrop-blur-sm">
                  Drag to position
                </p>

                <motion.img
                  drag
                  dragConstraints={{ left: -200, right: 200, top: -200, bottom: 200 }}
                  src={generatedImage}
                  className="w-48 h-48 sm:w-64 sm:h-64 object-contain mix-blend-multiply opacity-90 cursor-grab active:cursor-grabbing z-10 drop-shadow-2xl"
                  alt="Tattoo Try On"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
