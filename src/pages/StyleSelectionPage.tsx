import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Sparkles, Check, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { TATTOO_STYLES, STYLE_CARD_PROMPTS, STYLE_PREVIEW_VARIANTS, STYLE_SLUGS } from '../constants';
import { generateStyleCardImage } from '../services/geminiService';

const CACHE_VERSION = 'v7';
const cacheKey = (id: string) => `inksight-style-preview-${CACHE_VERSION}-${id}`;

/** Returns path to pre-generated static PNG if it could exist */
const staticPng = (id: string) => {
  const slug = STYLE_SLUGS[id];
  return slug ? `/style-previews/${slug}.png` : null;
};

/** Try to load a URL, resolve with the URL if OK, reject if 404 */
function tryLoad(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(url);
    img.onerror = reject;
    img.src = url;
  });
}

export default function StyleSelectionPage() {
  const navigate = useNavigate();
  const { questionnaire, setQuestionnaire, startParallelGeneration } = useApp();

  /** Track which preview variant index is active per style card */
  const [previewIdx, setPreviewIdx] = useState<Record<string, number>>({});
  /** AI-generated preview images loaded from localStorage or freshly generated */
  const [cardImages, setCardImages] = useState<Record<string, string>>({});
  /** Which styles are currently being AI-generated */
  const [generating, setGenerating] = useState<Set<string>>(new Set());
  const cancelledRef = useRef(false);

  const selectedStyle = TATTOO_STYLES.find(s => s.id === questionnaire.style);

  // On mount: priority order for each style's preview image:
  //   1. Static pre-generated PNG from /public/style-previews/ (committed to repo — instant)
  //   2. localStorage cache from a previous session
  //   3. Freshly generate via Imagen API and cache to localStorage
  //   4. SVG placeholder (always available as final fallback)
  useEffect(() => {
    cancelledRef.current = false;

    const loadAll = async () => {
      // First pass: check localStorage cache
      const fromStorage: Record<string, string> = {};
      TATTOO_STYLES.forEach(s => {
        const stored = localStorage.getItem(cacheKey(s.id));
        if (stored) fromStorage[s.id] = stored;
      });

      // Second pass: check static PNGs for anything not in localStorage
      const needsGeneration: typeof TATTOO_STYLES = [];
      const staticChecks = TATTOO_STYLES
        .filter(s => !fromStorage[s.id])
        .map(async s => {
          const url = staticPng(s.id);
          if (!url) { needsGeneration.push(s); return; }
          try {
            await tryLoad(url);
            fromStorage[s.id] = url; // static PNG is available
          } catch {
            needsGeneration.push(s); // not available, queue for generation
          }
        });

      await Promise.all(staticChecks);

      if (!cancelledRef.current && Object.keys(fromStorage).length > 0) {
        setCardImages({ ...fromStorage });
      }

      // Third pass: generate remaining via API, one at a time
      for (const style of needsGeneration) {
        if (cancelledRef.current) break;
        setGenerating(prev => new Set(prev).add(style.id));
        try {
          const img = await generateStyleCardImage(STYLE_CARD_PROMPTS[style.id]);
          if (!cancelledRef.current) {
            localStorage.setItem(cacheKey(style.id), img);
            setCardImages(prev => ({ ...prev, [style.id]: img }));
          }
        } catch {
          // silently skip — SVG fallback shows
        } finally {
          setGenerating(prev => {
            const next = new Set(prev);
            next.delete(style.id);
            return next;
          });
        }
      }
    };

    loadAll();
    return () => { cancelledRef.current = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleGenerate = () => {
    if (!questionnaire.style) return;
    startParallelGeneration();
    navigate('/results');
  };

  /**
   * Variants for the carousel: AI-generated image first (if available),
   * then the SVG placeholder variants so user can scroll and compare styles.
   */
  const getVariants = (styleId: string): string[] => {
    const svgVariants: string[] = STYLE_PREVIEW_VARIANTS[styleId] ?? [
      TATTOO_STYLES.find(s => s.id === styleId)!.imgSrc,
    ];
    const aiImg = cardImages[styleId];
    return aiImg ? [aiImg, ...svgVariants] : svgVariants;
  };

  const changePreview = (e: React.MouseEvent, styleId: string, dir: 1 | -1) => {
    e.stopPropagation();
    const variants = getVariants(styleId);
    setPreviewIdx(prev => {
      const cur = prev[styleId] ?? 0;
      return { ...prev, [styleId]: (cur + dir + variants.length) % variants.length };
    });
  };

  const setPreview = (e: React.MouseEvent, styleId: string, idx: number) => {
    e.stopPropagation();
    setPreviewIdx(prev => ({ ...prev, [styleId]: idx }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-5xl mx-auto mt-8"
    >
      <button
        onClick={() => navigate('/details')}
        className="text-sm text-zinc-400 hover:text-zinc-200 flex items-center gap-2 mb-8 transition-colors"
      >
        <ChevronLeft size={16} /> Back
      </button>

      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-light tracking-tight mb-2">Select Your Style</h2>
          <p className="text-sm text-zinc-400">
            Choose the aesthetic. Scroll through each card to see different examples.
          </p>
        </div>
        {generating.size > 0 && (
          <div className="flex items-center gap-2 text-xs text-zinc-500 shrink-0">
            <Loader size={12} className="animate-spin" />
            Generating previews…
          </div>
        )}
      </div>

      {/* Style grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {TATTOO_STYLES.map((style) => {
          const isSelected = questionnaire.style === style.id;
          const isGenerating = generating.has(style.id);
          const variants = getVariants(style.id);
          const idx = Math.min(previewIdx[style.id] ?? 0, variants.length - 1);
          const currentSrc = variants[idx];

          return (
            <motion.div
              key={style.id}
              onClick={() => setQuestionnaire({ ...questionnaire, style: style.id })}
              whileHover={{ scale: 1.025 }}
              whileTap={{ scale: 0.975 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className={`cursor-pointer relative rounded-2xl overflow-hidden border-2 transition-colors group ${
                isSelected ? 'border-zinc-200' : 'border-zinc-800 hover:border-zinc-600'
              }`}
            >
              <div className="aspect-square relative overflow-hidden bg-zinc-900">
                {/* Current preview — fades in when src changes */}
                <AnimatePresence mode="wait" initial={false}>
                  <motion.img
                    key={currentSrc}
                    src={currentSrc}
                    alt={`${style.name} preview`}
                    className="w-full h-full object-cover absolute inset-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = style.imgSrc;
                    }}
                  />
                </AnimatePresence>

                {/* Shimmer while AI preview is generating for this card */}
                {isGenerating && !cardImages[style.id] && (
                  <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-600/20 to-transparent"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
                    />
                  </div>
                )}

                {/* Gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t transition-opacity duration-300 z-10 ${
                  isSelected ? 'from-black/75 via-black/10 to-black/15' : 'from-black/65 via-black/5 to-transparent'
                }`} />

                {/* Left arrow */}
                {variants.length > 1 && (
                  <button
                    onClick={(e) => changePreview(e, style.id, -1)}
                    className="absolute left-0 inset-y-0 w-7 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-black/40 to-transparent"
                  >
                    <ChevronLeft size={13} className="text-white drop-shadow" />
                  </button>
                )}

                {/* Right arrow */}
                {variants.length > 1 && (
                  <button
                    onClick={(e) => changePreview(e, style.id, 1)}
                    className="absolute right-0 inset-y-0 w-7 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-l from-black/40 to-transparent"
                  >
                    <ChevronRight size={13} className="text-white drop-shadow" />
                  </button>
                )}

                {/* Selected checkmark */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className="absolute top-2.5 right-2.5 w-6 h-6 bg-zinc-100 rounded-full flex items-center justify-center z-30"
                    >
                      <Check size={13} className="text-zinc-900 stroke-[3]" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Dot indicators */}
                {variants.length > 1 && (
                  <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-1 z-20 pointer-events-none">
                    {variants.map((_, i) => (
                      <button
                        key={i}
                        onClick={(e) => setPreview(e, style.id, i)}
                        className={`rounded-full transition-all duration-200 pointer-events-auto ${
                          i === idx ? 'w-3 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/70'
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* Style name */}
                <div className="absolute bottom-0 left-0 right-0 p-3 z-20">
                  <h3 className="text-sm font-semibold text-white leading-tight drop-shadow">
                    {style.name}
                  </h3>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Selected style detail */}
      <AnimatePresence mode="wait">
        {selectedStyle && (
          <motion.div
            key={selectedStyle.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="mb-8 p-5 bg-zinc-900/60 border border-zinc-700 rounded-2xl flex items-center gap-5"
          >
            <div className="w-14 h-14 rounded-xl shrink-0 border border-zinc-700 overflow-hidden bg-zinc-900">
              <img
                src={cardImages[selectedStyle.id] ?? selectedStyle.imgSrc}
                alt={selectedStyle.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = selectedStyle.imgSrc;
                }}
              />
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-0.5">Selected</p>
              <h3 className="text-base font-semibold text-zinc-100">{selectedStyle.name}</h3>
              <p className="text-sm text-zinc-400 mt-0.5">{selectedStyle.desc}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pt-4 border-t border-zinc-900">
        <button
          onClick={handleGenerate}
          disabled={!questionnaire.style}
          className="w-full bg-zinc-100 text-zinc-950 rounded-xl py-4 px-8 text-base font-semibold hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          <Sparkles size={16} />
          Generate My Tattoo
        </button>
      </div>
    </motion.div>
  );
}
