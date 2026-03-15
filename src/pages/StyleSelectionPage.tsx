import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Sparkles, Check, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { TATTOO_STYLES, STYLE_CARD_PROMPTS, STYLE_PREVIEW_VARIANTS, STYLE_SLUGS } from '../constants';
import { generateStyleCardImage } from '../services/geminiService';

const CACHE_VERSION = 'v7';
const cacheKey = (id: string) => `inksight-style-preview-${CACHE_VERSION}-${id}`;
const INK_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

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
        } catch { /* silently skip */ } finally {
          setGenerating(prev => { const n = new Set(prev); n.delete(style.id); return n; });
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
    const statics = staticVariants[styleId] ?? [];
    const svgFallbacks: string[] = STYLE_PREVIEW_VARIANTS[styleId] ?? [TATTOO_STYLES.find(s => s.id === styleId)!.imgSrc];
    const aiImg = cardImages[styleId];
    if (statics.length > 0) return statics;
    return aiImg ? [aiImg, ...svgFallbacks] : svgFallbacks;
  };

  const changePreview = (e: React.MouseEvent, styleId: string, dir: 1 | -1) => {
    e.stopPropagation();
    const vars = getVariants(styleId);
    setPreviewIdx(prev => {
      const cur = prev[styleId] ?? 0;
      return { ...prev, [styleId]: (cur + dir + vars.length) % vars.length };
    });
  };

  const setPreview = (e: React.MouseEvent, styleId: string, idx: number) => {
    e.stopPropagation();
    setPreviewIdx(prev => ({ ...prev, [styleId]: idx }));
  };

  return (
    <motion.div
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.4, ease: INK_EASE }}
      className="max-w-5xl mx-auto"
      style={{ animation: 'fade-in 0.35s ease both' }}
    >
      {/* ── Sticky generate bar ── */}
      <div
        className="sticky top-0 z-20 mb-6 rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(8,8,8,0.96)',
          border: '1px solid rgba(201,168,112,0.25)',
          backdropFilter: 'blur(14px)',
          boxShadow: '0 4px 40px rgba(0,0,0,0.7)',
        }}
      >
        <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(201,168,112,0.7) 40%, rgba(201,168,112,0.7) 60%, transparent)' }} />
        <div className="px-4 py-3 flex items-center gap-4">
          <div className="flex-1 min-w-0">
            {selectedStyle ? (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg shrink-0 overflow-hidden" style={{ border: '1px solid rgba(201,168,112,0.3)' }}>
                  <img
                    src={cardImages[selectedStyle.id] ?? selectedStyle.imgSrc}
                    alt={selectedStyle.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = selectedStyle.imgSrc; }}
                  />
                </div>
                <div className="min-w-0">
                  <p className="label-overline mb-0.5" style={{ color: 'rgba(201,168,112,0.6)' }}>Selected</p>
                  <p className="font-ink text-xl text-[#f0ece4] truncate leading-none">{selectedStyle.name}</p>
                </div>
              </div>
            ) : (
              <div>
                <p className="label-overline mb-0.5" style={{ color: '#333330' }}>No Style Selected</p>
                <p className="text-sm" style={{ color: '#666660' }}>Choose a style below</p>
              </div>
            )}
          </div>
          {generating.size > 0 && (
            <div className="flex items-center gap-1.5 shrink-0">
              <Loader size={11} className="animate-spin" style={{ color: '#c9a870' }} />
              <span className="hidden sm:inline" style={{ fontSize: '11px', color: '#888880' }}>Loading…</span>
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

      {/* ── Page heading ── */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => navigate('/details')}
          className="transition-colors cursor-pointer shrink-0"
          style={{ color: '#444440' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#c9a870'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#444440'; }}
        >
          <ChevronLeft size={18} />
        </button>
        <div>
          {/* Bebas Neue heading with slide-up */}
          <div style={{ overflow: 'hidden' }}>
            <h2
              className="font-ink text-5xl text-[#f0ece4] leading-none"
              style={{ animation: 'slide-up-text 0.5s cubic-bezier(0.16,1,0.3,1) both' }}
            >
              Select <span style={{ color: '#c9a870' }}>Style</span>
            </h2>
          </div>
          <p className="text-xs mt-1 uppercase tracking-wider" style={{ color: '#444440' }}>
            Swipe each card for examples
          </p>
        </div>
      </div>

      {/* ── Style grid ── staggered reveal */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
        {TATTOO_STYLES.map((style, index) => {
          const isSel = questionnaire.style === style.id;
          const isGenerating = generating.has(style.id);
          const vars = getVariants(style.id);
          const idx = Math.min(previewIdx[style.id] ?? 0, vars.length - 1);
          const currentSrc = vars[idx];

          return (
            <motion.div
              key={style.id}
              onClick={() => setQuestionnaire({ ...questionnaire, style: style.id })}
              className="cursor-pointer relative rounded-xl overflow-hidden group"
              style={{
                animation: `slide-up 0.45s cubic-bezier(0.16,1,0.3,1) ${index * 0.04}s both`,
                border: isSel ? '2px solid rgba(201,168,112,0.75)' : '2px solid #1a1a1a',
                boxShadow: isSel
                  ? '0 0 0 1px rgba(201,168,112,0.12), 0 0 30px rgba(201,168,112,0.2)'
                  : '0 2px 12px rgba(0,0,0,0.6)',
                transition: 'border-color 0.22s, box-shadow 0.22s, transform 0.2s',
              }}
              onMouseEnter={e => {
                if (!isSel) {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,168,112,0.35)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px) scale(1.01)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.5), 0 0 16px rgba(201,168,112,0.1)';
                }
              }}
              onMouseLeave={e => {
                if (!isSel) {
                  (e.currentTarget as HTMLElement).style.borderColor = '#1a1a1a';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0) scale(1)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.6)';
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
                    initial={{ opacity: 0, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    onError={(e) => { (e.target as HTMLImageElement).src = style.imgSrc; }}
                  />
                </AnimatePresence>

                {isGenerating && !cardImages[style.id] && (
                  <div className="absolute inset-0 shimmer-gold pointer-events-none z-10" />
                )}

                <div
                  className="absolute inset-0 z-10"
                  style={{
                    background: isSel
                      ? 'linear-gradient(to top, rgba(201,168,112,0.4) 0%, rgba(0,0,0,0.05) 55%, rgba(0,0,0,0.1) 100%)'
                      : 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.02) 62%, transparent 100%)',
                    transition: 'background 0.28s',
                  }}
                />

                {vars.length > 1 && (
                  <>
                    <button
                      onClick={(e) => changePreview(e, style.id, -1)}
                      className="absolute left-0 inset-y-0 w-7 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-black/55 to-transparent cursor-pointer"
                    >
                      <ChevronLeft size={12} className="text-white drop-shadow" />
                    </button>
                    <button
                      onClick={(e) => changePreview(e, style.id, 1)}
                      className="absolute right-0 inset-y-0 w-7 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-l from-black/55 to-transparent cursor-pointer"
                    >
                      <ChevronRight size={12} className="text-white drop-shadow" />
                    </button>
                  </>
                )}

                <AnimatePresence>
                  {isSel && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 26 }}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center z-30"
                      style={{ background: '#c9a870', boxShadow: '0 0 12px rgba(201,168,112,0.7)' }}
                    >
                      <Check size={12} style={{ color: '#0a0a0a', strokeWidth: 3 }} />
                    </motion.div>
                  )}
                </AnimatePresence>

                {vars.length > 1 && (
                  <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-1 z-20 pointer-events-none">
                    {vars.map((_, i) => (
                      <button
                        key={i}
                        onClick={(e) => setPreview(e, style.id, i)}
                        className="rounded-full transition-all duration-200 pointer-events-auto cursor-pointer"
                        style={{
                          width: i === idx ? '10px' : '5px',
                          height: '5px',
                          background: i === idx ? '#c9a870' : 'rgba(255,255,255,0.28)',
                        }}
                      />
                    ))}
                  </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 p-3 z-20">
                  <h3 className="font-ink text-white drop-shadow" style={{ fontSize: '14px', letterSpacing: '0.08em' }}>
                    {style.name}
                  </h3>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Selected detail ── */}
      <AnimatePresence mode="wait">
        {selectedStyle && (
          <motion.div
            key={selectedStyle.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: INK_EASE }}
            className="mb-6 p-4 rounded-xl flex items-center gap-4 relative overflow-hidden"
            style={{ background: '#1a150a', border: '1px solid rgba(201,168,112,0.22)' }}
          >
            <div className="absolute left-0 top-0 bottom-0 w-0.5" style={{ background: '#c9a870' }} />
            <div className="w-12 h-12 rounded-lg shrink-0 overflow-hidden ml-2" style={{ border: '1px solid rgba(201,168,112,0.3)' }}>
              <img
                src={cardImages[selectedStyle.id] ?? selectedStyle.imgSrc}
                alt={selectedStyle.name}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = selectedStyle.imgSrc; }}
              />
            </div>
            <div>
              <p className="label-overline mb-0.5" style={{ color: 'rgba(201,168,112,0.55)' }}>Selected Style</p>
              <h3 className="font-ink text-2xl text-[#f0ece4] leading-none">{selectedStyle.name}</h3>
              <p className="text-xs mt-1" style={{ color: '#888880' }}>{selectedStyle.desc}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
