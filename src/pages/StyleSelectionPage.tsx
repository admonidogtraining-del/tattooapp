import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Sparkles, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { TATTOO_STYLES, STYLE_SLUGS } from '../constants';

/** Returns the URL of the pre-generated static preview, or null if no slug mapping. */
function staticPreviewUrl(styleId: string): string | null {
  const slug = STYLE_SLUGS[styleId];
  return slug ? `/style-previews/${slug}.png` : null;
}

export default function StyleSelectionPage() {
  const navigate = useNavigate();
  const { questionnaire, setQuestionnaire, startParallelGeneration } = useApp();

  const selectedStyle = TATTOO_STYLES.find(s => s.id === questionnaire.style);

  const handleGenerate = () => {
    if (!questionnaire.style) return;
    startParallelGeneration();
    navigate('/results');
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
          Choose the aesthetic. This is used directly to generate your tattoo.
        </p>
      </div>

      {/* Style grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {TATTOO_STYLES.map((style) => {
          const isSelected = questionnaire.style === style.id;
          const staticUrl = staticPreviewUrl(style.id);

          return (
            <motion.div
              key={style.id}
              onClick={() => setQuestionnaire({ ...questionnaire, style: style.id })}
              whileHover={{ scale: 1.025 }}
              whileTap={{ scale: 0.975 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className={`cursor-pointer relative rounded-2xl overflow-hidden border-2 transition-colors ${
                isSelected ? 'border-zinc-200' : 'border-zinc-800 hover:border-zinc-600'
              }`}
            >
              <div className="aspect-square relative overflow-hidden bg-zinc-900">
                {/* Static pre-generated image — falls back to SVG if file not found */}
                <img
                  src={staticUrl ?? style.imgSrc}
                  alt={style.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    if ((e.target as HTMLImageElement).src !== style.imgSrc) {
                      (e.target as HTMLImageElement).src = style.imgSrc;
                    }
                  }}
                />

                {/* Gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t transition-opacity duration-300 ${
                  isSelected ? 'from-black/75 via-black/10 to-black/15' : 'from-black/65 via-black/5 to-transparent'
                }`} />

                {/* Selected checkmark */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className="absolute top-2.5 right-2.5 w-6 h-6 bg-zinc-100 rounded-full flex items-center justify-center z-10"
                    >
                      <Check size={13} className="text-zinc-900 stroke-[3]" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Style name */}
                <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
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
                src={staticPreviewUrl(selectedStyle.id) ?? selectedStyle.imgSrc}
                alt={selectedStyle.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  if ((e.target as HTMLImageElement).src !== selectedStyle.imgSrc) {
                    (e.target as HTMLImageElement).src = selectedStyle.imgSrc;
                  }
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
