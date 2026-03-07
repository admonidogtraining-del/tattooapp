import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Sparkles, Check, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { TATTOO_STYLES } from '../constants';

export default function StyleSelectionPage() {
  const navigate = useNavigate();
  const { questionnaire, setQuestionnaire, handleSubmit, triggerAutoImageGeneration, setError, error } = useApp();

  const selectedStyle = TATTOO_STYLES.find(s => s.id === questionnaire.style);

  const handleGenerate = async () => {
    if (!questionnaire.style) return;
    navigate('/generating');
    try {
      const consultation = await handleSubmit(false);
      if (consultation.discovery_required) {
        navigate('/discovery');
      } else {
        navigate('/results');
        triggerAutoImageGeneration(consultation);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to generate consultation. Please try again.';
      setError(message);
      navigate('/style');
    }
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
        <ChevronLeft size={16} /> Back to Details
      </button>

      <div className="mb-10">
        <h2 className="text-3xl font-light tracking-tight mb-2">Select Your Style</h2>
        <p className="text-sm text-zinc-400 leading-relaxed">
          Choose the aesthetic direction. This drives the technical prompts and image generation.
        </p>
      </div>

      {/* Style grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {TATTOO_STYLES.map((style) => {
          const isSelected = questionnaire.style === style.id;
          return (
            <motion.div
              key={style.id}
              onClick={() => setQuestionnaire({ ...questionnaire, style: style.id })}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className={`cursor-pointer relative rounded-2xl overflow-hidden border-2 transition-colors ${
                isSelected
                  ? 'border-zinc-200'
                  : 'border-zinc-800 hover:border-zinc-600'
              }`}
            >
              <div className="aspect-square relative overflow-hidden">
                <img
                  src={style.imgSrc}
                  alt={style.name}
                  className="w-full h-full object-cover"
                />
                <div className={`absolute inset-0 bg-gradient-to-t transition-opacity duration-300 ${
                  isSelected
                    ? 'from-black/80 via-black/10 to-black/20'
                    : 'from-black/70 via-black/10 to-transparent'
                }`} />

                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className="absolute top-2.5 right-2.5 w-6 h-6 bg-zinc-100 rounded-full flex items-center justify-center"
                    >
                      <Check size={13} className="text-zinc-900 stroke-[3]" />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <h3 className="text-sm font-semibold text-white leading-tight">{style.name}</h3>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Selected style detail panel */}
      <AnimatePresence mode="wait">
        {selectedStyle && (
          <motion.div
            key={selectedStyle.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="mb-8 p-5 bg-zinc-900/60 border border-zinc-700 rounded-2xl flex items-start gap-5"
          >
            <img
              src={selectedStyle.imgSrc}
              alt={selectedStyle.name}
              className="w-16 h-16 rounded-xl object-cover shrink-0 border border-zinc-700"
            />
            <div>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Selected Style</p>
              <h3 className="text-lg font-medium text-zinc-100 mb-1">{selectedStyle.name}</h3>
              <p className="text-sm text-zinc-400">{selectedStyle.desc}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pt-4 border-t border-zinc-900 flex justify-end">
        <button
          onClick={handleGenerate}
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
  );
}
