import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Sparkles, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { TATTOO_STYLES, STYLE_PREVIEW_VARIANTS } from '../constants';

export default function StyleSelectionPage() {
  const navigate = useNavigate();
  const { questionnaire, setQuestionnaire, startParallelGeneration } = useApp();

  /** Track which preview variant index is active per style card */
  const [previewIdx, setPreviewIdx] = useState<Record<string, number>>({});
  const selectedStyle = TATTOO_STYLES.find(s => s.id === questionnaire.style);

  const handleGenerate = () => {
    if (!questionnaire.style) return;
    startParallelGeneration();
    navigate('/results');
  };

  // Return SVG variants for the carousel. If a static pre-generated PNG exists
  // at /style-previews/{slug}.png it is appended as an additional variant.
  const getVariants = (styleId: string): string[] => {
    const svgVariants: string[] = STYLE_PREVIEW_VARIANTS[styleId] ?? [
      TATTOO_STYLES.find(s => s.id === styleId)!.imgSrc,
    ];
    return svgVariants;
  };

  const changePreview = (
    e: React.MouseEvent,
    styleId: string,
    dir: 1 | -1,
  ) => {
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

      <div className="mb-8">
        <h2 className="text-3xl font-light tracking-tight mb-2">Select Your Style</h2>
        <p className="text-sm text-zinc-400">
          Choose the aesthetic. Scroll through each card to see different examples of that style.
        </p>
      </div>

      {/* Style grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {TATTOO_STYLES.map((style) => {
          const isSelected = questionnaire.style === style.id;
          const variants = getVariants(style.id);
          const idx = previewIdx[style.id] ?? 0;
          const safeidx = Math.min(idx, variants.length - 1);
          const currentSrc = variants[safeidx];

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
                {/* Current preview image */}
                <AnimatePresence mode="wait" initial={false}>
                  <motion.img
                    key={`${style.id}-${safeidx}`}
                    src={currentSrc}
                    alt={`${style.name} preview ${safeidx + 1}`}
                    className="w-full h-full object-cover absolute inset-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = style.imgSrc;
                    }}
                  />
                </AnimatePresence>

                {/* Gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t transition-opacity duration-300 z-10 ${
                  isSelected ? 'from-black/75 via-black/10 to-black/15' : 'from-black/65 via-black/5 to-transparent'
                }`} />

                {/* Left arrow */}
                {variants.length > 1 && (
                  <button
                    onClick={(e) => changePreview(e, style.id, -1)}
                    className="absolute left-0 inset-y-0 w-7 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-black/40 to-transparent"
                    aria-label="Previous preview"
                  >
                    <ChevronLeft size={13} className="text-white drop-shadow" />
                  </button>
                )}

                {/* Right arrow */}
                {variants.length > 1 && (
                  <button
                    onClick={(e) => changePreview(e, style.id, 1)}
                    className="absolute right-0 inset-y-0 w-7 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-l from-black/40 to-transparent"
                    aria-label="Next preview"
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
                          i === safeidx
                            ? 'w-3 h-1.5 bg-white'
                            : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/70'
                        }`}
                        aria-label={`Preview ${i + 1}`}
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
                src={(() => {
                  const v = getVariants(selectedStyle.id);
                  return v[Math.min(previewIdx[selectedStyle.id] ?? 0, v.length - 1)];
                })()}
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
