import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Sparkles, Check, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { TATTOO_STYLES, STYLE_CARD_PROMPTS, STYLE_PREVIEW_VARIANTS, STYLE_SLUGS } from '../constants';
import { generateStyleCardImage } from '../services/geminiService';

const CACHE_VERSION = 'v7';
const cacheKey = (id: string) => `inksight-style-preview-${CACHE_VERSION}-${id}`;

const staticPngVariants = (id: string): string[] => {
  const slug = STYLE_SLUGS[id];
  if (!slug) return [];
  return [
    `/style-previews/${slug}.png`,
    `/style-previews/${slug}-2.png`,
    `/style-previews/${slug}-3.png`,
    `/style-previews/${slug}-4.png`,
  ];
};

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

  const [previewIdx, setPreviewIdx] = useState<Record<string, number>>({});
  const [cardImages, setCardImages] = useState<Record<string, string>>({});
  const [staticVariants, setStaticVariants] = useState<Record<string, string[]>>({});
  const [generating, setGenerating] = useState<Set<string>>(new Set());
  const cancelledRef = useRef(false);

  const selectedStyle = TATTOO_STYLES.find(s => s.id === questionnaire.style);

  useEffect(() => {
    cancelledRef.current = false;

    const loadAll = async () => {
      const fromStorage: Record<string, string> = {};
      TATTOO_STYLES.forEach(s => {
        const stored = localStorage.getItem(cacheKey(s.id));
        if (stored) fromStorage[s.id] = stored;
      });

      const needsGeneration: typeof TATTOO_STYLES = [];
      const staticChecks = TATTOO_STYLES.map(async s => {
        const urls = staticPngVariants(s.id);
        const found: string[] = [];
        await Promise.all(urls.map(url => tryLoad(url).then(u => found.push(u)).catch(() => {})));
        found.sort();
        if (found.length > 0) {
          setStaticVariants(prev => ({ ...prev, [s.id]: found }));
          if (!fromStorage[s.id]) fromStorage[s.id] = found[0];
        } else if (!fromStorage[s.id]) {
          needsGeneration.push(s);
        }
      });

      await Promise.all(staticChecks);

      if (!cancelledRef.current && Object.keys(fromStorage).length > 0) {
        setCardImages({ ...fromStorage });
      }

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

  const getVariants = (styleId: string): string[] => {
    const statics = staticVariants[styleId];
    if (statics && statics.length > 0) return statics;
    const svgFallbacks: string[] = STYLE_PREVIEW_VARIANTS[styleId] ?? [
      TATTOO_STYLES.find(s => s.id === styleId)!.imgSrc,
    ];
    const aiImg = cardImages[styleId];
    return aiImg ? [aiImg, ...svgFallbacks] : svgFallbacks;
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
      className="max-w-5xl mx-auto"
    >
      {/* ── STICKY GENERATE BAR ── */}
      <div
        className="sticky top-0 z-20 mb-6 rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #111118 0%, #0f0f1a 100%)',
          border: '1px solid #7c3aed60',
          boxShadow: '0 0 30px #7c3aed25, 0 4px 20px #00000070',
        }}
      >
        <div className="px-4 py-3 flex items-center gap-4">
          {/* Selected style badge */}
          <div className="flex-1 min-w-0">
            {selectedStyle ? (
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg shrink-0 overflow-hidden border"
                  style={{ borderColor: '#7c3aed60' }}
                >
                  <img
                    src={cardImages[selectedStyle.id] ?? selectedStyle.imgSrc}
                    alt={selectedStyle.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = selectedStyle.imgSrc; }}
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-purple-400 uppercase tracking-widest font-display">Selected Style</p>
                  <p className="text-sm font-semibold text-zinc-100 truncate">{selectedStyle.name}</p>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-display">No Style Selected</p>
                <p className="text-sm text-zinc-500">Choose a style from the grid below</p>
              </div>
            )}
          </div>

          {generating.size > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 shrink-0">
              <Loader size={11} className="animate-spin text-purple-500" />
              <span className="hidden sm:inline">Loading…</span>
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={!questionnaire.style}
            className="btn-generate shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm cursor-pointer"
          >
            <Sparkles size={15} />
            <span>Generate</span>
          </button>
        </div>
      </div>

      {/* ── HEADER ── */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => navigate('/details')}
          className="text-sm text-zinc-500 hover:text-purple-300 flex items-center gap-1 transition-colors cursor-pointer shrink-0"
        >
          <ChevronLeft size={16} />
        </button>
        <div>
          <h2 className="text-2xl font-display uppercase tracking-widest text-zinc-100" style={{ letterSpacing: '0.12em' }}>
            Select <span className="text-purple-400">Style</span>
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5 uppercase tracking-wider">
            Scroll each card for examples
          </p>
        </div>
      </div>

      {/* ── STYLE GRID ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
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
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="cursor-pointer relative rounded-xl overflow-hidden group"
              style={{
                border: isSelected ? '2px solid #a855f7' : '2px solid #1e1e2e',
                boxShadow: isSelected
                  ? '0 0 20px #7c3aed50, 0 0 40px #7c3aed20'
                  : '0 2px 8px #00000060',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={e => {
                if (!isSelected) {
                  (e.currentTarget as HTMLElement).style.borderColor = '#7c3aed60';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 0 15px #7c3aed20';
                }
              }}
              onMouseLeave={e => {
                if (!isSelected) {
                  (e.currentTarget as HTMLElement).style.borderColor = '#1e1e2e';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px #00000060';
                }
              }}
            >
              <div className="aspect-square relative overflow-hidden bg-zinc-900">
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
                    onError={(e) => { (e.target as HTMLImageElement).src = style.imgSrc; }}
                  />
                </AnimatePresence>

                {isGenerating && !cardImages[style.id] && (
                  <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-600/20 to-transparent"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
                    />
                  </div>
                )}

                {/* Gradient overlay */}
                <div
                  className="absolute inset-0 z-10"
                  style={{
                    background: isSelected
                      ? 'linear-gradient(to top, rgba(124,58,237,0.6) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.15) 100%)'
                      : 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.05) 60%, transparent 100%)',
                    transition: 'background 0.3s',
                  }}
                />

                {/* Left arrow */}
                {variants.length > 1 && (
                  <button
                    onClick={(e) => changePreview(e, style.id, -1)}
                    className="absolute left-0 inset-y-0 w-7 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-black/50 to-transparent cursor-pointer"
                  >
                    <ChevronLeft size={13} className="text-white drop-shadow" />
                  </button>
                )}

                {/* Right arrow */}
                {variants.length > 1 && (
                  <button
                    onClick={(e) => changePreview(e, style.id, 1)}
                    className="absolute right-0 inset-y-0 w-7 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-l from-black/50 to-transparent cursor-pointer"
                  >
                    <ChevronRight size={13} className="text-white drop-shadow" />
                  </button>
                )}

                {/* Checkmark */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center z-30"
                      style={{ background: '#7c3aed', boxShadow: '0 0 10px #a855f7' }}
                    >
                      <Check size={13} className="text-white stroke-[3]" />
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
                        className="rounded-full transition-all duration-200 pointer-events-auto cursor-pointer"
                        style={{
                          width: i === idx ? '10px' : '5px',
                          height: '5px',
                          background: i === idx ? '#a855f7' : 'rgba(255,255,255,0.35)',
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* Style name */}
                <div className="absolute bottom-0 left-0 right-0 p-3 z-20">
                  <h3 className="text-xs font-display uppercase tracking-wider text-white drop-shadow" style={{ letterSpacing: '0.1em' }}>
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
            className="mb-6 p-4 rounded-xl flex items-center gap-4 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #1a0a2e 0%, #0f0f1a 100%)',
              border: '1px solid #7c3aed40',
            }}
          >
            {/* Purple glow blob */}
            <div
              className="absolute -left-4 top-0 bottom-0 w-16 pointer-events-none"
              style={{ background: 'linear-gradient(90deg, #7c3aed20 0%, transparent 100%)' }}
            />
            <div className="w-12 h-12 rounded-lg shrink-0 overflow-hidden" style={{ border: '1px solid #7c3aed60' }}>
              <img
                src={cardImages[selectedStyle.id] ?? selectedStyle.imgSrc}
                alt={selectedStyle.name}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = selectedStyle.imgSrc; }}
              />
            </div>
            <div className="relative">
              <p className="text-[10px] font-display text-purple-400 uppercase tracking-widest mb-0.5">Selected</p>
              <h3 className="text-base font-display uppercase tracking-wider text-zinc-100">{selectedStyle.name}</h3>
              <p className="text-xs text-zinc-400 mt-0.5">{selectedStyle.desc}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
