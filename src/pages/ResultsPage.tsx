import { useNavigate, Navigate } from 'react-router-dom';
import { ChevronLeft, Sparkles, Download, Maximize, Save, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { TATTOO_STYLES, buildStylePrompt } from '../constants';
import { generateTattooImage } from '../services/geminiService';

export default function ResultsPage() {
  const navigate = useNavigate();
  const {
    result, questionnaire, setQuestionnaire,
    generatedImage, setGeneratedImage,
    isGeneratingImage, setShowTryOn,
    tattooX, tattooY, setTattooScale,
    customImagePrompt, setCustomImagePrompt,
    handleGenerateImage, handleReset,
    stylePreviewImages, error,
  } = useApp();

  if (!result) return <Navigate to="/" replace />;

  const handleStyleSwitch = (styleId: string) => {
    setQuestionnaire(q => ({ ...q, style: styleId }));
    setCustomImagePrompt('');
    setGeneratedImage(null);
    generateTattooImage(
      buildStylePrompt(result.image_generation.dalle_prompt, styleId),
      stylePreviewImages[styleId]
    )
      .then(img => setGeneratedImage(img))
      .catch(err => console.error('Style switch generation failed:', err));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <button
        onClick={() => { handleReset(); navigate('/'); }}
        className="text-sm text-zinc-400 hover:text-zinc-200 flex items-center gap-2 transition-colors"
      >
        <ChevronLeft size={16} /> Start Over
      </button>

      {/* ── CONCEPT ART ── */}
      <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6">
        <div className="flex items-center gap-3 pb-4 border-b border-zinc-800/50 mb-6">
          <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
            <Sparkles size={16} />
          </div>
          <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
            Your Tattoo Concept
          </h3>
        </div>

        <div className="flex flex-col items-center justify-center">
          {/* Not started */}
          {!generatedImage && !isGeneratingImage && (
            <div className="text-center space-y-3 py-8">
              <p className="text-base text-zinc-300">Ready to see your design?</p>
              <p className="text-sm text-zinc-500">Generation takes about 20–40 seconds</p>
              <button
                onClick={handleGenerateImage}
                className="bg-zinc-100 text-zinc-950 rounded-xl py-3 px-6 text-sm font-medium hover:bg-white transition-all flex items-center gap-2 mx-auto mt-2"
              >
                <Sparkles size={16} />
                Generate Concept Art
              </button>
            </div>
          )}

          {/* Shimmer skeleton while generating */}
          {isGeneratingImage && (
            <div className="w-full max-w-sm mx-auto space-y-4">
              <div className="relative aspect-square rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900">
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900" />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-700/30 to-transparent"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <motion.div
                    className="w-10 h-10 rounded-full border-2 border-zinc-700 border-t-zinc-300"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                  />
                  <p className="text-sm text-zinc-400">Generating your tattoo...</p>
                  <p className="text-xs text-zinc-600">20–40 seconds</p>
                </div>
              </div>
            </div>
          )}

          {/* Generated image with reveal animation */}
          {generatedImage && !isGeneratingImage && (
            <div className="w-full max-w-sm mx-auto space-y-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="relative aspect-square rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950"
              >
                <img
                  src={generatedImage}
                  alt="Generated Tattoo Concept"
                  className="w-full h-full object-cover"
                />
              </motion.div>

              <div className="flex justify-center gap-6">
                <a
                  href={generatedImage}
                  download="inksight-concept.png"
                  className="text-sm text-zinc-400 hover:text-zinc-200 flex items-center gap-2 transition-colors"
                >
                  <Download size={16} /> Download
                </a>
                <button
                  onClick={() => { tattooX.set(0); tattooY.set(0); setTattooScale(1); setShowTryOn(true); }}
                  className="text-sm text-zinc-400 hover:text-zinc-200 flex items-center gap-2 transition-colors"
                >
                  <Maximize size={16} /> Try on Body
                </button>
              </div>

              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={customImagePrompt}
                  onChange={(e) => setCustomImagePrompt(e.target.value)}
                  placeholder="Tweak the prompt to regenerate..."
                  className="flex-1 bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-500 placeholder:text-zinc-600"
                />
                <button
                  onClick={handleGenerateImage}
                  className="bg-zinc-800 text-zinc-100 rounded-xl px-4 py-3 text-sm font-medium hover:bg-zinc-700 transition-all flex items-center gap-2 shrink-0"
                >
                  <Sparkles size={16} /> Redo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── YOUR DESIGN ── */}
      <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6 space-y-5">
        <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider pb-3 border-b border-zinc-800/50">
          Your Design
        </h3>

        {/* Style switcher */}
        <div>
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Style — tap to change</p>
          <div className="flex flex-wrap gap-2">
            {TATTOO_STYLES.map((s) => (
              <button
                key={s.id}
                onClick={() => handleStyleSwitch(s.id)}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  questionnaire.style === s.id
                    ? 'bg-zinc-100 text-zinc-900 border-zinc-100'
                    : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:border-zinc-500 hover:text-zinc-100'
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Interpretation</p>
          <p className="text-base font-medium text-zinc-100">
            {result.user_profile_analysis.interpreted_style}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Themes</p>
          <div className="flex flex-wrap gap-2">
            {result.user_profile_analysis.symbolic_metaphors.map((m, i) => (
              <span key={i} className="px-2.5 py-1 bg-zinc-800 text-zinc-200 text-xs rounded-lg border border-zinc-700">
                {m}
              </span>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Placement Tip</p>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {result.user_profile_analysis.suggested_placement_logic}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-1">
          <div>
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Longevity</p>
            <p className="text-sm text-zinc-300">{result.technical_brief.estimated_longevity}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Healing</p>
            <div className="flex items-center gap-2 mt-1">
              <div className={`w-2 h-2 rounded-full shrink-0 ${
                result.aftercare_preview.healing_difficulty.toLowerCase().includes('high')
                  ? 'bg-red-500'
                  : result.aftercare_preview.healing_difficulty.toLowerCase().includes('med')
                    ? 'bg-yellow-500'
                    : 'bg-emerald-500'
              }`} />
              <span className="text-sm text-zinc-200 leading-tight">
                {result.aftercare_preview.healing_difficulty}
              </span>
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Color Palette</p>
          <div className="flex gap-2 flex-wrap">
            {result.technical_brief.artist_notes.color_palette_hex.map((hex, i) => (
              <div
                key={i}
                className="w-7 h-7 rounded-full border-2 border-zinc-700 shadow-sm"
                style={{ backgroundColor: hex }}
                title={hex}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Aftercare</p>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {result.aftercare_preview.lifestyle_warning}
          </p>
        </div>
      </div>

      {/* ── ARTIST BRIEF ── */}
      <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
            Prompt for Your Artist / AI Tool
          </p>
          <button
            onClick={() => navigator.clipboard.writeText(result.image_generation.dalle_prompt)}
            className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors border border-zinc-700 hover:border-zinc-500 px-2.5 py-1 rounded-lg"
          >
            Copy
          </button>
        </div>
        <p className="text-xs font-mono text-zinc-500 leading-relaxed line-clamp-3">
          {result.image_generation.dalle_prompt}
        </p>
      </div>

      {/* ── SAVE DESIGN ── */}
      <AnimatePresence>
        {generatedImage && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900/50 border border-zinc-700 rounded-2xl p-5 flex flex-col items-center gap-3 text-center"
          >
            <p className="text-sm text-zinc-400">Happy with your design? Save it to your computer.</p>
            <a
              href={generatedImage}
              download="inksight-tattoo-design.png"
              className="w-full flex items-center justify-center gap-3 bg-zinc-100 text-zinc-950 rounded-xl py-3.5 px-6 text-base font-semibold hover:bg-white transition-all"
            >
              <Save size={20} /> Save Design to Computer
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="p-4 bg-red-950/30 border border-red-900/50 rounded-xl text-red-400 text-sm flex items-start gap-3">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}
    </motion.div>
  );
}
