import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Sparkles, Download, Maximize, Save, AlertTriangle, Info, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { TATTOO_STYLES } from '../constants';

export default function ResultsPage() {
  const navigate = useNavigate();
  const {
    result, questionnaire,
    generatedImage,
    isGeneratingImage, isConsulting,
    setShowTryOn,
    tattooX, tattooY, setTattooScale,
    customImagePrompt, setCustomImagePrompt,
    handleGenerateImage, handleStyleSwitch, handleReset,
    error, fallbackMessage,
  } = useApp();

  if (!isGeneratingImage && !isConsulting && !generatedImage && !result) {
    navigate('/');
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-5"
    >
      <button
        onClick={() => { handleReset(); navigate('/'); }}
        className="text-sm text-zinc-500 hover:text-purple-300 flex items-center gap-2 transition-colors cursor-pointer font-display uppercase tracking-wider"
        style={{ letterSpacing: '0.1em' }}
      >
        <ChevronLeft size={16} /> Start Over
      </button>

      {/* ── CONCEPT ART ── */}
      <div
        className="rounded-2xl p-5 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #111118 0%, #0f0f1a 100%)',
          border: '1px solid #1e1e2e',
        }}
      >
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-purple-700 rounded-tl-2xl" />
        <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-purple-700 rounded-br-2xl" />

        <div className="flex items-center gap-3 pb-4 mb-5" style={{ borderBottom: '1px solid #1e1e2e' }}>
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)', boxShadow: '0 0 12px #7c3aed60' }}
          >
            <Sparkles size={15} className="text-white" />
          </div>
          <h3 className="text-xs font-display text-zinc-400 uppercase tracking-widest" style={{ letterSpacing: '0.2em' }}>
            Your Tattoo Concept
          </h3>
          {isGeneratingImage && (
            <div className="ml-auto flex items-center gap-2 text-xs text-zinc-500">
              <motion.span
                className="inline-block w-1.5 h-1.5 rounded-full"
                style={{ background: '#a855f7' }}
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
              Generating…
            </div>
          )}
        </div>

        <div className="flex flex-col items-center justify-center">
          {/* Shimmer skeleton */}
          {isGeneratingImage && !generatedImage && (
            <div className="w-full max-w-sm mx-auto">
              <div
                className="relative aspect-square rounded-xl overflow-hidden"
                style={{ border: '1px solid #1e1e2e', background: '#0f0f1a' }}
              >
                <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #111118, #1a0a2e, #111118)' }} />
                <motion.div
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.15), transparent)' }}
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <motion.div
                    className="w-12 h-12 rounded-full border-2 border-t-purple-400"
                    style={{ borderColor: '#1e1e2e', borderTopColor: '#a855f7' }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                  />
                  <p className="text-sm text-zinc-400 font-display uppercase tracking-wider" style={{ letterSpacing: '0.1em' }}>
                    Generating Design…
                  </p>
                  <p className="text-xs text-purple-500">{questionnaire.style}</p>
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
              <div
                className="relative aspect-square rounded-xl overflow-hidden"
                style={{ border: '1px solid #7c3aed40', boxShadow: '0 0 30px #7c3aed20' }}
              >
                <img src={generatedImage} alt="Generated Tattoo" className="w-full h-full object-cover" />
                {isGeneratingImage && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <motion.div
                      className="w-8 h-8 rounded-full border-2"
                      style={{ borderColor: '#1e1e2e', borderTopColor: '#a855f7' }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex justify-center gap-6">
                <a
                  href={generatedImage}
                  download="inksight-concept.png"
                  className="text-xs text-zinc-400 hover:text-purple-300 flex items-center gap-2 transition-colors font-display uppercase tracking-wider cursor-pointer"
                  style={{ letterSpacing: '0.1em' }}
                >
                  <Download size={14} /> Download
                </a>
                <button
                  onClick={() => { tattooX.set(0); tattooY.set(0); setTattooScale(1); setShowTryOn(true); }}
                  className="text-xs text-zinc-400 hover:text-purple-300 flex items-center gap-2 transition-colors font-display uppercase tracking-wider cursor-pointer"
                  style={{ letterSpacing: '0.1em' }}
                >
                  <Maximize size={14} /> Try on Body
                </button>
              </div>

              {/* Redo prompt */}
              <div
                className="pt-1 rounded-xl overflow-hidden"
                style={{ border: '1px solid #1e1e2e' }}
              >
                <textarea
                  value={customImagePrompt}
                  onChange={(e) => setCustomImagePrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && !isGeneratingImage) {
                      handleGenerateImage();
                    }
                  }}
                  placeholder="Tweak the prompt to regenerate…"
                  rows={3}
                  className="w-full px-4 pt-3 pb-2 text-sm text-zinc-200 focus:outline-none resize-none placeholder:text-zinc-600 transition-all"
                  style={{
                    background: '#09090b',
                    fontFamily: "'Chakra Petch', sans-serif",
                    borderBottom: '1px solid #1e1e2e',
                  }}
                />
                <div
                  className="flex items-center justify-between px-3 py-2"
                  style={{ background: '#0f0f1a' }}
                >
                  <span className="text-[10px] text-zinc-600 font-display uppercase tracking-wider">
                    Ctrl+Enter to apply
                  </span>
                  <button
                    onClick={handleGenerateImage}
                    disabled={isGeneratingImage}
                    className="btn-game flex items-center gap-2 px-4 py-2 rounded-lg text-xs cursor-pointer"
                  >
                    <RefreshCw size={13} /> Apply Changes
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* ── DESIGN METADATA ── */}
      <div
        className="rounded-2xl p-5 space-y-5 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #111118 0%, #0f0f1a 100%)',
          border: '1px solid #1e1e2e',
        }}
      >
        <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-purple-700 rounded-tl-2xl" />

        <div className="flex items-center gap-2 pb-3" style={{ borderBottom: '1px solid #1e1e2e' }}>
          <h3 className="text-xs font-display text-zinc-400 uppercase tracking-widest flex-1" style={{ letterSpacing: '0.2em' }}>
            Your Design
          </h3>
          {isConsulting && (
            <span className="text-xs text-zinc-600 flex items-center gap-1.5 font-display">
              <motion.span
                className="inline-block w-1.5 h-1.5 rounded-full bg-purple-700"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
              Analyzing…
            </span>
          )}
        </div>

        {/* Style switcher */}
        <div>
          <p className="text-[10px] font-display text-zinc-600 uppercase tracking-widest mb-2">Style</p>
          <div className="flex flex-wrap gap-2">
            {TATTOO_STYLES.map((s) => {
              const isSelected = questionnaire.style === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => handleStyleSwitch(s.id)}
                  className="px-3 py-1 text-[10px] font-display uppercase tracking-wider rounded-full transition-all cursor-pointer"
                  style={{
                    background: isSelected ? '#7c3aed' : 'transparent',
                    border: isSelected ? '1px solid #a855f7' : '1px solid #1e1e2e',
                    color: isSelected ? '#fff' : '#71717a',
                    boxShadow: isSelected ? '0 0 10px #7c3aed40' : 'none',
                    letterSpacing: '0.08em',
                  }}
                >
                  {s.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Skeletons */}
        {isConsulting && !result && (
          <div className="space-y-4">
            {[['Interpretation', 200], ['Themes', 160], ['Placement', 280]].map(([label, w]) => (
              <div key={label as string}>
                <div className="h-2 w-20 rounded mb-2 animate-pulse" style={{ background: '#1e1e2e' }} />
                <div className="h-3 rounded animate-pulse" style={{ width: `${w}px`, maxWidth: '100%', background: '#1a1a28' }} />
              </div>
            ))}
          </div>
        )}

        {/* Consultation data */}
        {result && (
          <>
            <div>
              <p className="text-[10px] font-display text-zinc-600 uppercase tracking-widest mb-1">Interpretation</p>
              <p className="text-base font-semibold text-zinc-100">{result.user_profile_analysis.interpreted_style}</p>
            </div>
            <div>
              <p className="text-[10px] font-display text-zinc-600 uppercase tracking-widest mb-2">Themes</p>
              <div className="flex flex-wrap gap-2">
                {result.user_profile_analysis.symbolic_metaphors.map((m, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 text-xs rounded-lg"
                    style={{
                      background: '#1a0a2e',
                      border: '1px solid #7c3aed40',
                      color: '#c4b5fd',
                    }}
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-display text-zinc-600 uppercase tracking-widest mb-1">Placement Tip</p>
              <p className="text-sm text-zinc-300 leading-relaxed">{result.user_profile_analysis.suggested_placement_logic}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-display text-zinc-600 uppercase tracking-widest mb-1">Longevity</p>
                <p className="text-sm text-zinc-300">{result.technical_brief.estimated_longevity}</p>
              </div>
              <div>
                <p className="text-[10px] font-display text-zinc-600 uppercase tracking-widest mb-1">Healing</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${
                    result.aftercare_preview.healing_difficulty.toLowerCase().includes('high') ? 'bg-red-500'
                    : result.aftercare_preview.healing_difficulty.toLowerCase().includes('med') ? 'bg-yellow-500'
                    : 'bg-emerald-500'
                  }`} />
                  <span className="text-sm text-zinc-200">{result.aftercare_preview.healing_difficulty}</span>
                </div>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-display text-zinc-600 uppercase tracking-widest mb-2">Color Palette</p>
              <div className="flex gap-2 flex-wrap">
                {result.technical_brief.artist_notes.color_palette_hex.map((hex, i) => (
                  <div
                    key={i}
                    className="w-7 h-7 rounded-full border-2"
                    style={{ backgroundColor: hex, borderColor: '#1e1e2e' }}
                    title={hex}
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-display text-zinc-600 uppercase tracking-widest mb-1">Aftercare</p>
              <p className="text-sm text-zinc-300 leading-relaxed">{result.aftercare_preview.lifestyle_warning}</p>
            </div>
          </>
        )}
      </div>

      {/* ── ARTIST PROMPT ── */}
      {result && (
        <div
          className="rounded-2xl p-5 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #111118 0%, #0f0f1a 100%)',
            border: '1px solid #1e1e2e',
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-display text-zinc-500 uppercase tracking-widest" style={{ letterSpacing: '0.2em' }}>
              Prompt for Artist / AI Tool
            </p>
            <button
              onClick={() => navigator.clipboard.writeText(result.image_generation.dalle_prompt)}
              className="text-xs font-display uppercase tracking-wider px-3 py-1 rounded-lg transition-all cursor-pointer"
              style={{ border: '1px solid #1e1e2e', color: '#71717a' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = '#7c3aed60';
                (e.currentTarget as HTMLElement).style.color = '#a855f7';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = '#1e1e2e';
                (e.currentTarget as HTMLElement).style.color = '#71717a';
              }}
            >
              Copy
            </button>
          </div>
          <p className="text-xs font-mono text-zinc-600 leading-relaxed line-clamp-3">{result.image_generation.dalle_prompt}</p>
        </div>
      )}

      {/* ── SAVE ── */}
      <AnimatePresence>
        {generatedImage && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-5 flex flex-col items-center gap-3 text-center"
            style={{
              background: 'linear-gradient(135deg, #1a0a2e 0%, #0f0f1a 100%)',
              border: '1px solid #7c3aed40',
            }}
          >
            <p className="text-sm text-zinc-400">Happy with your design?</p>
            <a
              href={generatedImage}
              download="inksight-tattoo-design.png"
              className="btn-generate w-full flex items-center justify-center gap-3 rounded-xl py-3.5 px-6 text-sm cursor-pointer"
            >
              <Save size={16} /> Save Design
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      {fallbackMessage && (
        <div className="p-4 rounded-xl text-amber-300 text-sm flex items-start gap-3"
          style={{ background: '#1a100030', border: '1px solid #92400e50' }}>
          <Info size={16} className="shrink-0 mt-0.5" />
          <p>{fallbackMessage}</p>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl text-red-400 text-sm flex items-start gap-3"
          style={{ background: '#1f000030', border: '1px solid #7f1d1d50' }}>
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}
    </motion.div>
  );
}
