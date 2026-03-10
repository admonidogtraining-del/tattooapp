import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Download, Maximize, Save, AlertTriangle, Info, RefreshCw } from 'lucide-react';
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

  // Seed the tweak field with the original prompt once the consultation arrives
  const [tweakInput, setTweakInput] = useState('');
  useEffect(() => {
    if (result?.image_generation.dalle_prompt && !tweakInput) {
      setTweakInput(result.image_generation.dalle_prompt);
      setCustomImagePrompt(result.image_generation.dalle_prompt);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result?.image_generation.dalle_prompt]);

  const handleApplyTweak = () => {
    if (!isGeneratingImage) {
      setCustomImagePrompt(tweakInput);
      handleGenerateImage();
    }
  };

  if (!isGeneratingImage && !isConsulting && !generatedImage && !result) {
    navigate('/');
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="max-w-4xl mx-auto space-y-6"
    >
      {/* Back */}
      <button
        onClick={() => { handleReset(); navigate('/'); }}
        className="text-xs text-zinc-600 hover:text-zinc-300 flex items-center gap-1.5 transition-colors cursor-pointer tracking-widest uppercase"
      >
        <ChevronLeft size={13} /> Start over
      </button>

      {/* ── CONCEPT IMAGE ── */}
      <section
        className="rounded-2xl p-6 space-y-5"
        style={{ background: '#111111', border: '1px solid #1f1f1f' }}
      >
        {/* Header */}
        <div className="flex items-baseline justify-between" style={{ borderBottom: '1px solid #1f1f1f', paddingBottom: '1rem' }}>
          <h2
            className="font-display text-2xl font-light italic text-zinc-200 tracking-wide"
          >
            Your Tattoo Concept
          </h2>
          {isGeneratingImage && (
            <span className="text-[10px] text-zinc-600 tracking-widest uppercase flex items-center gap-2">
              <motion.span
                className="inline-block w-1 h-1 rounded-full bg-violet-700"
                animate={{ opacity: [1, 0.2, 1] }}
                transition={{ duration: 1.4, repeat: Infinity }}
              />
              Rendering…
            </span>
          )}
        </div>

        <div className="flex flex-col items-center">
          {/* Skeleton while generating */}
          {isGeneratingImage && !generatedImage && (
            <div className="w-full max-w-xs mx-auto">
              <div
                className="relative aspect-square rounded-xl overflow-hidden"
                style={{ background: '#0d0d0d', border: '1px solid #1f1f1f' }}
              >
                <motion.div
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent)' }}
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                  <motion.div
                    className="w-9 h-9 rounded-full border border-zinc-800"
                    style={{ borderTopColor: '#6d28d9' }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
                  />
                  <p className="text-xs text-zinc-600 tracking-widest uppercase">Generating…</p>
                  <p className="text-[10px] text-zinc-700">{questionnaire.style} · 20–40 sec</p>
                </div>
              </div>
            </div>
          )}

          {/* Image */}
          {generatedImage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="w-full max-w-xs mx-auto space-y-5"
            >
              <div
                className="relative aspect-square rounded-xl overflow-hidden"
                style={{ border: '1px solid #2a2a2a' }}
              >
                <img src={generatedImage} alt="Generated Tattoo" className="w-full h-full object-cover" />
                {isGeneratingImage && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <motion.div
                      className="w-7 h-7 rounded-full border border-zinc-800"
                      style={{ borderTopColor: '#7c3aed' }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                    />
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-center gap-8">
                <a
                  href={generatedImage}
                  download="tattoo-concept.png"
                  className="text-[10px] text-zinc-500 hover:text-zinc-200 flex items-center gap-1.5 transition-colors cursor-pointer tracking-widest uppercase"
                >
                  <Download size={12} /> Download
                </a>
                <button
                  onClick={() => { tattooX.set(0); tattooY.set(0); setTattooScale(1); setShowTryOn(true); }}
                  className="text-[10px] text-zinc-500 hover:text-zinc-200 flex items-center gap-1.5 transition-colors cursor-pointer tracking-widest uppercase"
                >
                  <Maximize size={12} /> Try on Body
                </button>
              </div>

              {/* ── TWEAK YOUR DESIGN ── */}
              <div
                className="rounded-xl overflow-hidden"
                style={{ border: '1px solid #1f1f1f' }}
              >
                {/* Header */}
                <div
                  className="px-4 py-3 flex items-center justify-between"
                  style={{ borderBottom: '1px solid #1a1a1a', background: '#0d0d0d' }}
                >
                  <span className="font-display text-base italic font-light text-zinc-300">
                    Refine your design
                  </span>
                  <span className="text-[10px] text-zinc-700 tracking-widest uppercase">
                    Edit the prompt below
                  </span>
                </div>

                {/* Editable prompt */}
                <textarea
                  value={tweakInput}
                  onChange={(e) => setTweakInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleApplyTweak();
                  }}
                  rows={5}
                  className="w-full px-4 py-3 text-xs text-zinc-300 focus:outline-none resize-none leading-relaxed placeholder:text-zinc-700"
                  style={{
                    background: '#0a0a0a',
                    fontFamily: "'Inter', sans-serif",
                    borderBottom: '1px solid #1a1a1a',
                  }}
                  placeholder="The original prompt will appear here once your design loads. Edit it to refine your tattoo…"
                />

                {/* Footer with apply button */}
                <div
                  className="px-4 py-3 flex items-center justify-between"
                  style={{ background: '#0d0d0d' }}
                >
                  <span className="text-[10px] text-zinc-700 tracking-widest uppercase">
                    ⌘ + Enter to apply
                  </span>
                  <button
                    onClick={handleApplyTweak}
                    disabled={isGeneratingImage || !tweakInput.trim()}
                    className="btn-game flex items-center gap-2 px-5 py-2 rounded-lg cursor-pointer"
                  >
                    <RefreshCw size={11} />
                    Regenerate
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* ── DESIGN METADATA ── */}
      <section
        className="rounded-2xl p-6 space-y-5"
        style={{ background: '#111111', border: '1px solid #1f1f1f' }}
      >
        <div className="flex items-baseline justify-between" style={{ borderBottom: '1px solid #1f1f1f', paddingBottom: '1rem' }}>
          <h2 className="font-display text-2xl font-light italic text-zinc-200 tracking-wide">
            Design Details
          </h2>
          {isConsulting && (
            <span className="text-[10px] text-zinc-600 tracking-widest uppercase flex items-center gap-2">
              <motion.span
                className="inline-block w-1 h-1 rounded-full bg-violet-700"
                animate={{ opacity: [1, 0.2, 1] }}
                transition={{ duration: 1.4, repeat: Infinity }}
              />
              Analysing…
            </span>
          )}
        </div>

        {/* Style switcher */}
        <div>
          <p className="text-[10px] text-zinc-600 tracking-widest uppercase mb-3">Style</p>
          <div className="flex flex-wrap gap-2">
            {TATTOO_STYLES.map((s) => {
              const isSelected = questionnaire.style === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => handleStyleSwitch(s.id)}
                  className="px-3 py-1.5 text-[10px] tracking-wider uppercase rounded-full transition-all cursor-pointer"
                  style={{
                    background: isSelected ? '#1e1030' : 'transparent',
                    border: isSelected ? '1px solid #5b3fa0' : '1px solid #1f1f1f',
                    color: isSelected ? '#c4b5fd' : '#52525b',
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 500,
                    letterSpacing: '0.07em',
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
            {[200, 160, 280].map((w, i) => (
              <div key={i}>
                <div className="h-2 w-16 rounded mb-2 animate-pulse" style={{ background: '#1f1f1f' }} />
                <div className="h-3 rounded animate-pulse" style={{ width: `${w}px`, maxWidth: '100%', background: '#181818' }} />
              </div>
            ))}
          </div>
        )}

        {result && (
          <>
            <div>
              <p className="text-[10px] text-zinc-600 tracking-widest uppercase mb-1.5">Interpretation</p>
              <p className="font-display text-xl font-light text-zinc-100 italic leading-snug">
                {result.user_profile_analysis.interpreted_style}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-zinc-600 tracking-widest uppercase mb-2">Themes</p>
              <div className="flex flex-wrap gap-2">
                {result.user_profile_analysis.symbolic_metaphors.map((m, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 text-xs rounded-full"
                    style={{
                      background: '#150d22',
                      border: '1px solid #2d1f45',
                      color: '#9d87c9',
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] text-zinc-600 tracking-widest uppercase mb-1.5">Placement</p>
              <p className="text-sm text-zinc-400 leading-relaxed">{result.user_profile_analysis.suggested_placement_logic}</p>
            </div>
            <div className="grid grid-cols-2 gap-4" style={{ borderTop: '1px solid #1a1a1a', paddingTop: '1.25rem' }}>
              <div>
                <p className="text-[10px] text-zinc-600 tracking-widest uppercase mb-1.5">Longevity</p>
                <p className="text-sm text-zinc-300">{result.technical_brief.estimated_longevity}</p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-600 tracking-widest uppercase mb-1.5">Healing</p>
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    result.aftercare_preview.healing_difficulty.toLowerCase().includes('high') ? 'bg-rose-600'
                    : result.aftercare_preview.healing_difficulty.toLowerCase().includes('med') ? 'bg-amber-500'
                    : 'bg-emerald-600'
                  }`} />
                  <span className="text-sm text-zinc-300">{result.aftercare_preview.healing_difficulty}</span>
                </div>
              </div>
            </div>
            <div>
              <p className="text-[10px] text-zinc-600 tracking-widest uppercase mb-2">Colour Palette</p>
              <div className="flex gap-2 flex-wrap">
                {result.technical_brief.artist_notes.color_palette_hex.map((hex, i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: hex, border: '1px solid #2a2a2a' }}
                    title={hex}
                  />
                ))}
              </div>
            </div>
            <div style={{ borderTop: '1px solid #1a1a1a', paddingTop: '1.25rem' }}>
              <p className="text-[10px] text-zinc-600 tracking-widest uppercase mb-1.5">Aftercare Note</p>
              <p className="text-sm text-zinc-400 leading-relaxed">{result.aftercare_preview.lifestyle_warning}</p>
            </div>
          </>
        )}
      </section>

      {/* ── ARTIST PROMPT ── */}
      {result && (
        <section
          className="rounded-2xl p-6"
          style={{ background: '#111111', border: '1px solid #1f1f1f' }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] text-zinc-600 tracking-widest uppercase">
              Prompt for Artist / AI Tool
            </p>
            <button
              onClick={() => navigator.clipboard.writeText(result.image_generation.dalle_prompt)}
              className="text-[10px] tracking-widest uppercase px-3 py-1 rounded-lg transition-all cursor-pointer"
              style={{ border: '1px solid #1f1f1f', color: '#52525b', fontFamily: "'Inter', sans-serif" }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = '#3a3a3a';
                (e.currentTarget as HTMLElement).style.color = '#a1a1aa';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = '#1f1f1f';
                (e.currentTarget as HTMLElement).style.color = '#52525b';
              }}
            >
              Copy
            </button>
          </div>
          <p className="text-xs text-zinc-600 leading-relaxed font-mono line-clamp-4">
            {result.image_generation.dalle_prompt}
          </p>
        </section>
      )}

      {/* ── SAVE ── */}
      <AnimatePresence>
        {generatedImage && (
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-6 flex flex-col items-center gap-4 text-center"
            style={{ background: '#0e0a14', border: '1px solid #2a1f3a' }}
          >
            <p className="font-display text-lg font-light italic text-zinc-300">
              Happy with your design?
            </p>
            <a
              href={generatedImage}
              download="tattoo-design.png"
              className="btn-generate w-full flex items-center justify-center gap-3 rounded-xl py-3.5 px-6 cursor-pointer"
            >
              <Save size={15} /> Save Design
            </a>
          </motion.section>
        )}
      </AnimatePresence>

      {fallbackMessage && (
        <div className="p-4 rounded-xl text-amber-400 text-sm flex items-start gap-3"
          style={{ background: '#12100030', border: '1px solid #78350f40' }}>
          <Info size={15} className="shrink-0 mt-0.5" />
          <p className="leading-relaxed">{fallbackMessage}</p>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl text-rose-400 text-sm flex items-start gap-3"
          style={{ background: '#12000030', border: '1px solid #7f1d1d40' }}>
          <AlertTriangle size={15} className="shrink-0 mt-0.5" />
          <p className="leading-relaxed">{error}</p>
        </div>
      )}
    </motion.div>
  );
}
