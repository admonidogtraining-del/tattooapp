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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.38, ease: [0.25, 0.1, 0.25, 1] }}
      className="max-w-5xl mx-auto"
    >
      {/* ── Sticky generate bar ── */}
      <div
        className="sticky top-0 z-20 mb-6 rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(10,10,10,0.95)',
          border: '1px solid rgba(201,168,112,0.3)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 4px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(201,168,112,0.08)',
        }}
      >
        {/* Gold top accent line */}
        <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent 0%, rgba(201,168,112,0.6) 40%, rgba(201,168,112,0.6) 60%, transparent 100%)' }} />
        <div className="px-4 py-3 flex items-center gap-4">
          <div className="flex-1 min-w-0">
            {selectedStyle ? (
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg shrink-0 overflow-hidden"
                  style={{ border: '1px solid rgba(201,168,112,0.3)' }}
                >
                  <img
                    src={cardImages[selectedStyle.id] ?? selectedStyle.imgSrc}
                    alt={selectedStyle.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = selectedStyle.imgSrc; }}
                  />
                </div>
                <div className="min-w-0">
                  <p className="label-overline mb-0.5" style={{ color: 'rgba(201,168,112,0.7)' }}>Selected Style</p>
                  <p className="text-sm font-semibold text-[#f0ece4] truncate">{selectedStyle.name}</p>
                </div>
              </div>
            ) : (
              <div>
                <p className="label-overline mb-0.5" style={{ color: '#444440' }}>No Style Selected</p>
                <p className="text-sm" style={{ color: '#888880' }}>Choose a style from the grid below</p>
              </div>
            )}
          </div>

          {generating.size > 0 && (
            <div className="flex items-center gap-1.5 shrink-0" style={{ color: '#888880' }}>
              <Loader size={11} className="animate-spin" style={{ color: '#c9a870' }} />
              <span className="hidden sm:inline" style={{ fontSize: '11px' }}>Loading…</span>
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={!questionnaire.style}
            className="btn-generate shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm"
          >
            <Sparkles size={14} />
            <span>Generate</span>
          </button>
        </div>
      </div>

      {/* ── Header ── */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => navigate('/details')}
          className="transition-colors cursor-pointer shrink-0"
          style={{ color: '#555550' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#c9a870'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#555550'; }}
        >
          <ChevronLeft size={18} />
        </button>
        <div>
          <h2
            className="font-display text-2xl uppercase text-[#f0ece4]"
            style={{ letterSpacing: '0.1em' }}
          >
            Select <span style={{ color: '#c9a870' }}>Style</span>
          </h2>
          <p className="text-xs mt-0.5 uppercase tracking-wider" style={{ color: '#555550' }}>
            Scroll each card for examples
          </p>
        </div>
      </div>

      {/* ── Style grid — staggered reveal ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
        {TATTOO_STYLES.map((style, index) => {
          const isSelected = questionnaire.style === style.id;
          const isGenerating = generating.has(style.id);
          const variants = getVariants(style.id);
          const idx = Math.min(previewIdx[style.id] ?? 0, variants.length - 1);
          const currentSrc = variants[idx];

          return (
            <motion.div
              key={style.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04, duration: 0.32, ease: 'easeOut' }}
              onClick={() => setQuestionnaire({ ...questionnaire, style: style.id })}
              className="cursor-pointer relative rounded-xl overflow-hidden group"
              style={{
                border: isSelected
                  ? '2px solid rgba(201,168,112,0.7)'
                  : '2px solid #1e1e1e',
                boxShadow: isSelected
                  ? '0 0 0 1px rgba(201,168,112,0.1), 0 0 28px rgba(201,168,112,0.18)'
                  : '0 2px 10px rgba(0,0,0,0.5)',
                transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.18s',
              }}
              onMouseEnter={e => {
                if (!isSelected) {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,168,112,0.3)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 0 16px rgba(201,168,112,0.1)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={e => {
                if (!isSelected) {
                  (e.currentTarget as HTMLElement).style.borderColor = '#1e1e1e';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 10px rgba(0,0,0,0.5)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                }
              }}
            >
              <div className="aspect-square relative overflow-hidden bg-[#0a0a0a]">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.img
                    key={currentSrc}
                    src={currentSrc}
                    alt={`${style.name} preview`}
                    className="w-full h-full object-cover absolute inset-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.28 }}
                    onError={(e) => { (e.target as HTMLImageElement).src = style.imgSrc; }}
                  />
                </AnimatePresence>

                {/* Gold shimmer while generating */}
                {isGenerating && !cardImages[style.id] && (
                  <div className="absolute inset-0 overflow-hidden pointer-events-none z-10 shimmer-gold" />
                )}

                {/* Gradient overlay */}
                <div
                  className="absolute inset-0 z-10"
                  style={{
                    background: isSelected
                      ? 'linear-gradient(to top, rgba(201,168,112,0.35) 0%, rgba(0,0,0,0.05) 55%, rgba(0,0,0,0.1) 100%)'
                      : 'linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.02) 60%, transparent 100%)',
                    transition: 'background 0.25s',
                  }}
                />

                {/* Left arrow */}
                {variants.length > 1 && (
                  <button
                    onClick={(e) => changePreview(e, style.id, -1)}
                    className="absolute left-0 inset-y-0 w-7 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-black/50 to-transparent cursor-pointer"
                  >
                    <ChevronLeft size={12} className="text-white drop-shadow" />
                  </button>
                )}

                {/* Right arrow */}
                {variants.length > 1 && (
                  <button
                    onClick={(e) => changePreview(e, style.id, 1)}
                    className="absolute right-0 inset-y-0 w-7 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-l from-black/50 to-transparent cursor-pointer"
                  >
                    <ChevronRight size={12} className="text-white drop-shadow" />
                  </button>
                )}

                {/* Checkmark */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center z-30"
                      style={{ background: '#c9a870', boxShadow: '0 0 10px rgba(201,168,112,0.6)' }}
                    >
                      <Check size={12} style={{ color: '#0a0a0a', strokeWidth: 3 }} />
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
                          background: i === idx ? '#c9a870' : 'rgba(255,255,255,0.3)',
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* Style name */}
                <div className="absolute bottom-0 left-0 right-0 p-3 z-20">
                  <h3
                    className="font-display uppercase text-white drop-shadow"
                    style={{ fontSize: '11px', letterSpacing: '0.1em' }}
                  >
                    {style.name}
                  </h3>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Selected style detail ── */}
      <AnimatePresence mode="wait">
        {selectedStyle && (
          <motion.div
            key={selectedStyle.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            className="mb-6 p-4 rounded-xl flex items-center gap-4 relative overflow-hidden"
            style={{
              background: '#1a150a',
              border: '1px solid rgba(201,168,112,0.25)',
            }}
          >
            <div
              className="absolute left-0 top-0 bottom-0 w-0.5"
              style={{ background: '#c9a870' }}
            />
            <div className="w-12 h-12 rounded-lg shrink-0 overflow-hidden ml-2" style={{ border: '1px solid rgba(201,168,112,0.3)' }}>
              <img
                src={cardImages[selectedStyle.id] ?? selectedStyle.imgSrc}
                alt={selectedStyle.name}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = selectedStyle.imgSrc; }}
              />
            </div>
            <div>
              <p className="label-overline mb-0.5" style={{ color: 'rgba(201,168,112,0.6)' }}>Selected</p>
              <h3
                className="font-display uppercase text-[#f0ece4]"
                style={{ fontSize: '15px', letterSpacing: '0.08em' }}
              >
                {selectedStyle.name}
              </h3>
              <p className="text-xs mt-0.5" style={{ color: '#888880' }}>{selectedStyle.desc}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
