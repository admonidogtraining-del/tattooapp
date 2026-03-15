import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Download, Maximize, RefreshCw, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { TATTOO_STYLES } from '../constants';
import RatingModal from '../components/RatingModal';
import { saveDesign } from '../lib/designCollection';

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

  const [tweakInput, setTweakInput] = useState('');
  const [showRatingModal, setShowRatingModal] = useState(false);

  const handleAftercareClick = () => {
    if (generatedImage) {
      setShowRatingModal(true);
    } else {
      navigate('/aftercare');
    }
  };

  const handleRatingConfirm = (rating: number) => {
    if (generatedImage) {
      saveDesign({
        style: questionnaire.style,
        imageUrl: generatedImage,
        rating,
        prompt: result?.image_generation.dalle_prompt ?? '',
      });
    }
    setShowRatingModal(false);
    navigate('/aftercare');
  };

  const handleRatingSkip = () => {
    setShowRatingModal(false);
    navigate('/aftercare');
  };

  useEffect(() => {
    if (result?.image_generation.dalle_prompt && !tweakInput) {
      setTweakInput(result.image_generation.dalle_prompt);
      setCustomImagePrompt(result.image_generation.dalle_prompt);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result?.image_generation.dalle_prompt]);

  const handleApplyTweak = () => {
    if (!isGeneratingImage && tweakInput.trim()) {
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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="max-w-2xl mx-auto space-y-5"
    >
      {/* Back */}
      <button
        onClick={() => { handleReset(); navigate('/'); }}
        className="flex items-center gap-1.5 text-xs text-[#999] hover:text-[#e8e4de] transition-colors cursor-pointer tracking-widest uppercase"
      >
        <ChevronLeft size={13} /> Start over
      </button>

      {/* ── IMAGE CARD ── */}
      <div className="rounded-2xl overflow-hidden" style={{ background: '#111111', border: '1px solid #222222' }}>

        {/* Loading state */}
        {isGeneratingImage && !generatedImage && (
          <div className="aspect-square max-w-xs mx-auto flex flex-col items-center justify-center gap-4 py-16">
            <motion.div
              className="w-8 h-8 rounded-full border border-[#252525]"
              style={{ borderTopColor: '#c9a870' }}
              animate={{ rotate: 360 }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
            />
            <div className="text-center space-y-1">
              <p className="text-xs text-[#bbb] tracking-widest uppercase">Rendering your design</p>
              <p className="text-[11px] text-[#888]">{questionnaire.style} · 20–40 sec</p>
            </div>
          </div>
        )}

        {/* Generated image */}
        {generatedImage && (
          <div className="relative">
            <img src={generatedImage} alt="Generated Tattoo" className="w-full aspect-square object-cover" />

            {/* Regenerating overlay */}
            {isGeneratingImage && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <motion.div
                  className="w-7 h-7 rounded-full border border-[#333]"
                  style={{ borderTopColor: '#c9a870' }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                />
              </div>
            )}

            {/* Action row */}
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ borderTop: '1px solid #1e1e1e', background: '#0f0f0f' }}
            >
              <div className="flex gap-5">
                <a
                  href={generatedImage}
                  download="tattoo-concept.png"
                  className="flex items-center gap-1.5 text-[11px] text-[#999] hover:text-[#e8e4de] transition-colors cursor-pointer tracking-widest uppercase"
                >
                  <Download size={11} /> Download
                </a>
                <button
                  onClick={() => { tattooX.set(0); tattooY.set(0); setTattooScale(1); setShowTryOn(true); }}
                  className="flex items-center gap-1.5 text-[11px] text-[#999] hover:text-[#e8e4de] transition-colors cursor-pointer tracking-widest uppercase"
                >
                  <Maximize size={11} /> Try on body
                </button>
              </div>

              {isGeneratingImage && (
                <span className="text-[11px] text-[#888] tracking-widest uppercase flex items-center gap-1.5">
                  <motion.span
                    className="inline-block w-1 h-1 rounded-full bg-[#c9a870]"
                    animate={{ opacity: [1, 0.2, 1] }}
                    transition={{ duration: 1.4, repeat: Infinity }}
                  />
                  Rendering
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── DESIGN INFO ── */}
      <div className="rounded-2xl space-y-0 overflow-hidden" style={{ background: '#111111', border: '1px solid #222222' }}>

        {/* Style switcher */}
        <div className="px-5 py-4" style={{ borderBottom: '1px solid #222' }}>
          <p className="label-overline mb-3">Style</p>
          <div className="flex flex-wrap gap-1.5">
            {TATTOO_STYLES.map((s) => {
              const active = questionnaire.style === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => handleStyleSwitch(s.id)}
                  className="px-3 py-1 text-[11px] tracking-wider uppercase rounded-full transition-all cursor-pointer font-medium"
                  style={{
                    background: active ? '#c9a87018' : 'transparent',
                    border: active ? '1px solid #c9a87060' : '1px solid #333',
                    color: active ? '#c9a870' : '#888',
                    fontFamily: "'Inter', sans-serif",
                    letterSpacing: '0.07em',
                  }}
                >
                  {s.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Consultation loading skeletons */}
        {isConsulting && !result && (
          <div className="px-5 py-4 space-y-4">
            {[140, 200, 120].map((w, i) => (
              <div key={i} className="space-y-1.5">
                <div className="h-2 w-14 rounded shimmer-gold" style={{ background: '#1e1e1e' }} />
                <div className="h-3 rounded shimmer-gold" style={{ width: w, maxWidth: '100%', background: '#181818' }} />
              </div>
            ))}
          </div>
        )}

        {/* Interpretation */}
        {result && (
          <>
            <div className="px-5 py-4" style={{ borderBottom: '1px solid #222' }}>
              <p className="label-overline mb-2">Interpretation</p>
              <p className="font-display text-lg font-medium text-[#f0ece4] leading-snug">
                {result.user_profile_analysis.interpreted_style}
              </p>
            </div>

            {/* Themes */}
            <div className="px-5 py-4" style={{ borderBottom: '1px solid #222' }}>
              <p className="label-overline mb-2.5">Themes</p>
              <div className="flex flex-wrap gap-1.5">
                {result.user_profile_analysis.symbolic_metaphors.map((m, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 text-xs rounded-full"
                    style={{
                      background: '#1f1a13',
                      border: '1px solid #3a2e1a',
                      color: '#d4b87e',
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>

            {/* Colour palette */}
            <div className="px-5 py-4">
              <p className="label-overline mb-2.5">Colour Palette</p>
              <div className="flex gap-2">
                {result.technical_brief.artist_notes.color_palette_hex.map((hex, i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: hex, border: '1px solid #333' }}
                    title={hex}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── REFINE PROMPT ── */}
      <AnimatePresence>
        {generatedImage && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl overflow-hidden"
            style={{ background: '#111111', border: '1px solid #222222' }}
          >
            <div className="px-5 py-3.5" style={{ borderBottom: '1px solid #1e1e1e', background: '#0f0f0f' }}>
              <p className="font-display text-sm font-medium text-[#e8e4de]">Refine your design</p>
              <p className="text-[11px] text-[#888] mt-0.5 tracking-wider">Edit the prompt below and regenerate</p>
            </div>

            <textarea
              value={tweakInput}
              onChange={(e) => setTweakInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleApplyTweak();
              }}
              rows={4}
              className="w-full px-5 py-4 text-xs text-[#ccc] focus:outline-none resize-none leading-relaxed placeholder:text-[#666]"
              style={{
                background: '#141414',
                fontFamily: "'Inter', sans-serif",
                borderBottom: '1px solid #222',
              }}
              placeholder="Your prompt will appear here once the design loads…"
            />

            <div className="px-5 py-3 flex items-center justify-between" style={{ background: '#0f0f0f' }}>
              <span className="text-[11px] text-[#777] tracking-wider uppercase">⌘ Enter to apply</span>
              <button
                onClick={handleApplyTweak}
                disabled={isGeneratingImage || !tweakInput.trim()}
                className="btn-game flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer"
              >
                <RefreshCw size={11} /> Regenerate
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Errors / warnings */}
      {fallbackMessage && (
        <div className="p-4 rounded-xl text-amber-400 text-sm flex items-start gap-3"
          style={{ background: '#1a150a', border: '1px solid #4a3510' }}>
          <p className="text-xs leading-relaxed">{fallbackMessage}</p>
        </div>
      )}
      {error && (
        <div className="p-4 rounded-xl text-rose-400 text-xs flex items-start gap-3 leading-relaxed"
          style={{ background: '#1a0a0a', border: '1px solid #4a1010' }}>
          <p>{error}</p>
        </div>
      )}

      {/* ── NEXT PAGE CTA ── */}
      <AnimatePresence>
        {generatedImage && result && (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleAftercareClick}
            className="btn-generate w-full flex items-center justify-center gap-3 rounded-2xl py-4 px-6 cursor-pointer"
          >
            Placement &amp; Aftercare <ArrowRight size={15} />
          </motion.button>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showRatingModal && (
          <RatingModal
            onConfirm={handleRatingConfirm}
            onSkip={handleRatingSkip}
            onClose={() => setShowRatingModal(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
