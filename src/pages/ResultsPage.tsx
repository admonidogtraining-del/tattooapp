import { useNavigate } from 'react-router-dom';
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
    isGeneratingImage, isConsulting,
    setShowTryOn,
    tattooX, tattooY, setTattooScale,
    customImagePrompt, setCustomImagePrompt,
    handleGenerateImage, handleReset,
    error,
  } = useApp();

  // Guard: if nothing is loading and nothing is ready, user navigated here directly
  if (!isGeneratingImage && !isConsulting && !generatedImage && !result) {
    navigate('/');
    return null;
  }

  const handleStyleSwitch = (styleId: string) => {
    setQuestionnaire(q => ({ ...q, style: styleId }));
    setCustomImagePrompt('');
    setGeneratedImage(null);
    generateTattooImage(
      buildStylePrompt(result?.image_generation.dalle_prompt ?? '', styleId)
    )
      .then(img => setGeneratedImage(img))
      .catch(err => console.error('Style switch failed:', err));
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
          {isGeneratingImage && (
            <span className="ml-auto text-xs text-zinc-500 flex items-center gap-1.5">
              <motion.span
                className="inline-block w-1.5 h-1.5 rounded-full bg-zinc-500"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
              Generating…
            </span>
          )}
        </div>

        <div className="flex flex-col items-center justify-center">
          {/* Shimmer skeleton while generating */}
          {isGeneratingImage && !generatedImage && (
            <div className="w-full max-w-sm mx-auto">
              <div className="relative aspect-square rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900">
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
                  <p className="text-sm text-zinc-400">
                    Generating {questionnaire.style} tattoo…
                  </p>
                  <p className="text-xs text-zinc-600">20–40 seconds</p>
                </div>
              </div>
            </div>
          )}

          {/* Generated image */}
          {generatedImage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="w-full max-w-sm mx-auto space-y-4"
            >
              <div className="relative aspect-square rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950">
                <img src={generatedImage} alt="Generated Tattoo" className="w-full h-full object-cover" />
                {isGeneratingImage && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <motion.div
                      className="w-8 h-8 rounded-full border-2 border-zinc-400 border-t-transparent"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-center gap-6">
                <a href={generatedImage} download="inksight-concept.png"
                  className="text-sm text-zinc-400 hover:text-zinc-200 flex items-center gap-2 transition-colors">
                  <Download size={16} /> Download
                </a>
                <button
                  onClick={() => { tattooX.set(0); tattooY.set(0); setTattooScale(1); setShowTryOn(true); }}
                  className="text-sm text-zinc-400 hover:text-zinc-200 flex items-center gap-2 transition-colors">
                  <Maximize size={16} /> Try on Body
                </button>
              </div>

              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={customImagePrompt}
                  onChange={(e) => setCustomImagePrompt(e.target.value)}
                  placeholder="Tweak the prompt to regenerate…"
                  className="flex-1 bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-500 placeholder:text-zinc-600"
                />
                <button onClick={handleGenerateImage} disabled={isGeneratingImage}
                  className="bg-zinc-800 text-zinc-100 rounded-xl px-4 py-3 text-sm font-medium hover:bg-zinc-700 disabled:opacity-50 transition-all flex items-center gap-2 shrink-0">
                  <Sparkles size={16} /> Redo
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* ── DESIGN METADATA ── */}
      <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-zinc-800/50">
          <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider flex-1">Your Design</h3>
          {isConsulting && (
            <span className="text-xs text-zinc-600 flex items-center gap-1.5">
              <motion.span className="inline-block w-1.5 h-1.5 rounded-full bg-zinc-600"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
              Analyzing…
            </span>
          )}
        </div>

        {/* Style switcher — always visible */}
        <div>
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Style</p>
          <div className="flex flex-wrap gap-2">
            {TATTOO_STYLES.map((s) => (
              <button key={s.id} onClick={() => handleStyleSwitch(s.id)}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  questionnaire.style === s.id
                    ? 'bg-zinc-100 text-zinc-900 border-zinc-100'
                    : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:border-zinc-500 hover:text-zinc-100'
                }`}>
                {s.name}
              </button>
            ))}
          </div>
        </div>

        {/* Skeletons while consultation loading */}
        {isConsulting && !result && (
          <div className="space-y-5">
            {[['Interpretation', 200], ['Themes', 160], ['Placement Tip', 280]].map(([label, w]) => (
              <div key={label as string}>
                <div className="h-2.5 w-20 bg-zinc-800 rounded mb-2 animate-pulse" />
                <div className="h-4 bg-zinc-800/70 rounded animate-pulse" style={{ width: `${w}px`, maxWidth: '100%' }} />
              </div>
            ))}
          </div>
        )}

        {/* Consultation data */}
        {result && (
          <>
            <div>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Interpretation</p>
              <p className="text-base font-medium text-zinc-100">{result.user_profile_analysis.interpreted_style}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Themes</p>
              <div className="flex flex-wrap gap-2">
                {result.user_profile_analysis.symbolic_metaphors.map((m, i) => (
                  <span key={i} className="px-2.5 py-1 bg-zinc-800 text-zinc-200 text-xs rounded-lg border border-zinc-700">{m}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Placement Tip</p>
              <p className="text-sm text-zinc-300 leading-relaxed">{result.user_profile_analysis.suggested_placement_logic}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Longevity</p>
                <p className="text-sm text-zinc-300">{result.technical_brief.estimated_longevity}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Healing</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${
                    result.aftercare_preview.healing_difficulty.toLowerCase().includes('high') ? 'bg-red-500'
                    : result.aftercare_preview.healing_difficulty.toLowerCase().includes('med') ? 'bg-yellow-500'
                    : 'bg-emerald-500'}`} />
                  <span className="text-sm text-zinc-200">{result.aftercare_preview.healing_difficulty}</span>
                </div>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Color Palette</p>
              <div className="flex gap-2 flex-wrap">
                {result.technical_brief.artist_notes.color_palette_hex.map((hex, i) => (
                  <div key={i} className="w-7 h-7 rounded-full border-2 border-zinc-700" style={{ backgroundColor: hex }} title={hex} />
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Aftercare</p>
              <p className="text-sm text-zinc-300 leading-relaxed">{result.aftercare_preview.lifestyle_warning}</p>
            </div>
          </>
        )}
      </div>

      {/* ── ARTIST PROMPT ── */}
      {result && (
        <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Prompt for Artist / AI Tool</p>
            <button onClick={() => navigator.clipboard.writeText(result.image_generation.dalle_prompt)}
              className="text-xs text-zinc-400 hover:text-zinc-200 border border-zinc-700 hover:border-zinc-500 px-2.5 py-1 rounded-lg transition-colors">
              Copy
            </button>
          </div>
          <p className="text-xs font-mono text-zinc-500 leading-relaxed line-clamp-3">{result.image_generation.dalle_prompt}</p>
        </div>
      )}

      {/* ── SAVE ── */}
      <AnimatePresence>
        {generatedImage && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900/50 border border-zinc-700 rounded-2xl p-5 flex flex-col items-center gap-3 text-center">
            <p className="text-sm text-zinc-400">Happy with your design? Save it.</p>
            <a href={generatedImage} download="inksight-tattoo-design.png"
              className="w-full flex items-center justify-center gap-3 bg-zinc-100 text-zinc-950 rounded-xl py-3.5 px-6 text-base font-semibold hover:bg-white transition-all">
              <Save size={20} /> Save Design
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
