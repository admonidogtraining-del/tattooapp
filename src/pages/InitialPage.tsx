import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Plus, X, ChevronRight, Wand2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { generatePromptIdea } from '../services/geminiService';

/* Ease curve for "ink press" reveals */
const INK_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function InitialPage() {
  const navigate = useNavigate();
  const { prompt, setPrompt, images, handleImageUpload, removeImage, fileInputRef } = useApp();
  const [inspiring, setInspiring] = useState(false);
  const [inspireError, setInspireError] = useState(false);

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() && images.length === 0) return;
    navigate('/details');
  };

  const handleInspire = async () => {
    setInspiring(true);
    setInspireError(false);
    try {
      const idea = await generatePromptIdea(prompt);
      setPrompt(idea);
    } catch {
      setInspireError(true);
      setTimeout(() => setInspireError(false), 3000);
    } finally {
      setInspiring(false);
    }
  };

  const canContinue = !!prompt.trim() || images.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4 }}
      className="max-w-2xl mx-auto"
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        multiple
        className="hidden"
      />

      {/* ══════════════════════════════════════════
          HERO — Big ink typography
      ══════════════════════════════════════════ */}
      <div className="text-center mb-10 pt-4">

        {/* Animated flanking lines + studio label */}
        <div className="flex items-center justify-center gap-3 mb-5">
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.7, ease: INK_EASE }}
            style={{
              height: '1px',
              width: 56,
              background: 'linear-gradient(90deg, transparent, #c9a870)',
              transformOrigin: 'right',
            }}
          />
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.4 }}
            className="label-overline"
            style={{ color: '#c9a870', letterSpacing: '0.22em' }}
          >
            ✦ Ink Design Studio ✦
          </motion.span>
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.7, ease: INK_EASE }}
            style={{
              height: '1px',
              width: 56,
              background: 'linear-gradient(90deg, #c9a870, transparent)',
              transformOrigin: 'left',
            }}
          />
        </div>

        {/* Big Bebas Neue headline — each word slides up */}
        <div style={{ overflow: 'hidden', lineHeight: 1 }}>
          <motion.h1
            initial={{ y: '105%' }}
            animate={{ y: '0%' }}
            transition={{ delay: 0.18, duration: 0.65, ease: INK_EASE }}
            className="font-ink text-[78px] sm:text-[96px] text-[#f0ece4] leading-none"
          >
            Begin Your
          </motion.h1>
        </div>
        <div style={{ overflow: 'hidden', lineHeight: 1 }}>
          <motion.h1
            initial={{ y: '105%' }}
            animate={{ y: '0%' }}
            transition={{ delay: 0.26, duration: 0.65, ease: INK_EASE }}
            className="font-ink text-[78px] sm:text-[96px] leading-none"
            style={{ color: '#c9a870' }}
          >
            Consultation
          </motion.h1>
        </div>

        {/* Diamond divider */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.5, duration: 0.5, ease: INK_EASE }}
          className="flex items-center justify-center gap-3 mt-5"
        >
          <div style={{ height: '1px', width: 48, background: 'linear-gradient(90deg, transparent, #2e2e2e)' }} />
          <span style={{ color: '#c9a870', fontSize: '9px', letterSpacing: '0.3em' }}>✦</span>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.4 }}
            className="text-sm"
            style={{ color: '#888880' }}
          >
            Upload references or describe your concept
          </motion.p>
          <span style={{ color: '#c9a870', fontSize: '9px', letterSpacing: '0.3em' }}>✦</span>
          <div style={{ height: '1px', width: 48, background: 'linear-gradient(90deg, #2e2e2e, transparent)' }} />
        </motion.div>
      </div>

      {/* ══════════════════════════════════════════
          FORM
      ══════════════════════════════════════════ */}
      <form onSubmit={handleContinue} className="space-y-4">

        {/* ── Upload zone ── */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38, duration: 0.55, ease: INK_EASE }}
        >
          {/* flash-art gradient border wrapper */}
          <div className="flash-card">
            <div className="flash-card-inner p-4">
              {/* Corner ornaments */}
              <div className="absolute top-3 left-3 w-3 h-3 border-t border-l" style={{ borderColor: 'rgba(201,168,112,0.5)' }} />
              <div className="absolute top-3 right-3 w-3 h-3 border-t border-r" style={{ borderColor: 'rgba(201,168,112,0.5)' }} />
              <div className="absolute bottom-3 left-3 w-3 h-3 border-b border-l" style={{ borderColor: 'rgba(201,168,112,0.5)' }} />
              <div className="absolute bottom-3 right-3 w-3 h-3 border-b border-r" style={{ borderColor: 'rgba(201,168,112,0.5)' }} />

              <p className="label-overline mb-3">Reference Photos</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 relative">
                {images.map((img, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.25, ease: INK_EASE }}
                    className="relative aspect-square rounded-xl overflow-hidden group"
                    style={{ border: '1px solid #2a2a2a' }}
                  >
                    <img src={img.url} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'rgba(0,0,0,0.45)' }} />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                      style={{ background: '#c84040' }}
                    >
                      <X size={11} className="text-white" />
                    </button>
                  </motion.div>
                ))}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all group"
                  style={{ border: '2px dashed #282828', background: 'transparent' }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,168,112,0.45)';
                    (e.currentTarget as HTMLElement).style.background = 'rgba(201,168,112,0.04)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = '#282828';
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
                    style={{ background: '#1a1a1a', border: '1px solid #2e2e2e' }}
                  >
                    {images.length > 0
                      ? <Plus size={17} style={{ color: '#c9a870' }} />
                      : <Upload size={17} style={{ color: '#c9a870' }} />
                    }
                  </div>
                  <p className="transition-colors" style={{ fontSize: '11px', color: '#555550' }}>
                    {images.length > 0 ? 'Add More' : 'Upload'}
                  </p>
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Decorated divider ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.44, duration: 0.4 }}
          className="flex items-center gap-3"
        >
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, #1e1e1e 60%)' }} />
          <span style={{ fontSize: '10px', color: '#c9a870', letterSpacing: '0.2em' }}>✦</span>
          <span className="label-overline" style={{ color: '#333330' }}>And / Or</span>
          <span style={{ fontSize: '10px', color: '#c9a870', letterSpacing: '0.2em' }}>✦</span>
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, #1e1e1e 40%, transparent)' }} />
        </motion.div>

        {/* ── Text prompt ── */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.46, duration: 0.55, ease: INK_EASE }}
        >
          <div className="flash-card">
            <div className="flash-card-inner p-4 relative">
              {/* Corner ornaments */}
              <div className="absolute top-3 left-3 w-3 h-3 border-t border-l" style={{ borderColor: 'rgba(201,168,112,0.5)' }} />
              <div className="absolute top-3 right-3 w-3 h-3 border-t border-r" style={{ borderColor: 'rgba(201,168,112,0.5)' }} />
              <div className="absolute bottom-3 left-3 w-3 h-3 border-b border-l" style={{ borderColor: 'rgba(201,168,112,0.5)' }} />
              <div className="absolute bottom-3 right-3 w-3 h-3 border-b border-r" style={{ borderColor: 'rgba(201,168,112,0.5)' }} />

              <p className="label-overline mb-3">Describe Your Concept</p>
              <div className="relative">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your story, emotions, or concept..."
                  className="w-full h-28 rounded-xl p-4 pb-12 text-sm focus:outline-none resize-none transition-all text-[#f0ece4] placeholder:text-[#333330]"
                  style={{
                    background: '#0a0a0a',
                    border: '1px solid #1a1a1a',
                    fontFamily: "'Inter', sans-serif",
                    lineHeight: 1.7,
                  }}
                  onFocus={e => { (e.target as HTMLElement).style.borderColor = 'rgba(201,168,112,0.35)'; }}
                  onBlur={e => { (e.target as HTMLElement).style.borderColor = '#1a1a1a'; }}
                />
                <button
                  type="button"
                  onClick={handleInspire}
                  disabled={inspiring}
                  className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-display uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
                  style={
                    inspireError
                      ? { background: '#1a0808', border: '1px solid rgba(200,64,64,0.35)', color: '#e07070' }
                      : { background: '#1a150a', border: '1px solid rgba(201,168,112,0.3)', color: '#c9a870' }
                  }
                  onMouseEnter={e => {
                    if (!inspiring && !inspireError)
                      (e.currentTarget as HTMLElement).style.background = '#22190d';
                  }}
                  onMouseLeave={e => {
                    if (!inspiring && !inspireError)
                      (e.currentTarget as HTMLElement).style.background = '#1a150a';
                  }}
                >
                  {inspiring ? (
                    <motion.span
                      className="inline-block w-3 h-3 border border-[#c9a870] border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
                    />
                  ) : (
                    <Wand2 size={11} />
                  )}
                  {inspiring ? 'Inspiring…' : inspireError ? 'Failed — check API' : 'Inspire Me'}
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── CTA ── */}
        <motion.button
          type="submit"
          disabled={!canContinue}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.52, duration: 0.45, ease: INK_EASE }}
          whileTap={{ scale: canContinue ? 0.97 : 1 }}
          className="btn-game w-full rounded-xl py-4 px-6 text-sm flex items-center justify-center gap-2"
        >
          Continue to Details <ChevronRight size={15} />
        </motion.button>
      </form>
    </motion.div>
  );
}
