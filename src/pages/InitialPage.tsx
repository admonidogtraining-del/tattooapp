import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Plus, X, ChevronRight, Wand2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { generatePromptIdea } from '../services/geminiService';

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

  /* CSS animation helpers */
  const css = (animation: string) => ({ animation, animationFillMode: 'both' } as React.CSSProperties);

  return (
    /* motion.div kept only for the EXIT animation when navigating away */
    <motion.div
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.35 }}
      style={{ maxWidth: '42rem', margin: '0 auto' }}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        multiple
        style={{ display: 'none' }}
      />

      {/* ══════════════════════════════════════════
          HERO — Big ink typography
      ══════════════════════════════════════════ */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem', paddingTop: '1rem' }}>

        {/* Animated flanking lines + studio label */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{
            height: '1px', width: 56,
            background: 'linear-gradient(90deg, transparent, #c9a870)',
            transformOrigin: 'right',
            ...css('line-draw 0.7s cubic-bezier(0.16,1,0.3,1) 0.1s'),
          }} />
          <span
            className="label-overline"
            style={{ color: '#c9a870', letterSpacing: '0.22em', ...css('fade-in 0.4s ease 0.35s') }}
          >
            ✦ Ink Design Studio ✦
          </span>
          <div style={{
            height: '1px', width: 56,
            background: 'linear-gradient(90deg, #c9a870, transparent)',
            transformOrigin: 'left',
            ...css('line-draw 0.7s cubic-bezier(0.16,1,0.3,1) 0.1s'),
          }} />
        </div>

        {/* Big Bebas Neue headline */}
        <div style={{ overflow: 'hidden', lineHeight: 1 }}>
          <h1
            className="font-ink"
            style={{
              fontSize: 'clamp(72px, 10vw, 96px)',
              color: '#f0ece4',
              lineHeight: 1,
              ...css('slide-up-text 0.65s cubic-bezier(0.16,1,0.3,1) 0.18s'),
            }}
          >
            Begin Your
          </h1>
        </div>
        <div style={{ overflow: 'hidden', lineHeight: 1 }}>
          <h1
            className="font-ink"
            style={{
              fontSize: 'clamp(72px, 10vw, 96px)',
              color: '#c9a870',
              lineHeight: 1,
              ...css('slide-up-text 0.65s cubic-bezier(0.16,1,0.3,1) 0.26s'),
            }}
          >
            Consultation
          </h1>
        </div>

        {/* Diamond divider */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '12px', marginTop: '20px',
          ...css('fade-in 0.5s ease 0.5s'),
        }}>
          <div style={{ height: '1px', width: 48, background: 'linear-gradient(90deg, transparent, #2e2e2e)' }} />
          <span style={{ color: '#c9a870', fontSize: '9px', letterSpacing: '0.3em' }}>✦</span>
          <p style={{ color: '#888880', fontSize: '0.875rem', ...css('fade-in 0.4s ease 0.55s') }}>
            Upload references or describe your concept
          </p>
          <span style={{ color: '#c9a870', fontSize: '9px', letterSpacing: '0.3em' }}>✦</span>
          <div style={{ height: '1px', width: 48, background: 'linear-gradient(90deg, #2e2e2e, transparent)' }} />
        </div>
      </div>

      {/* ══════════════════════════════════════════
          FORM
      ══════════════════════════════════════════ */}
      <form onSubmit={handleContinue} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* ── Upload zone ── */}
        <div style={css('slide-up 0.55s cubic-bezier(0.16,1,0.3,1) 0.38s')}>
          <div className="flash-card">
            <div className="flash-card-inner p-4">
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
                    transition={{ duration: 0.25 }}
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
        </div>

        {/* ── Decorated divider ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', ...css('fade-in 0.4s ease 0.44s') }}>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, #1e1e1e 60%)' }} />
          <span style={{ fontSize: '10px', color: '#c9a870', letterSpacing: '0.2em' }}>✦</span>
          <span className="label-overline" style={{ color: '#333330' }}>And / Or</span>
          <span style={{ fontSize: '10px', color: '#c9a870', letterSpacing: '0.2em' }}>✦</span>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, #1e1e1e 40%, transparent)' }} />
        </div>

        {/* ── Text prompt ── */}
        <div style={css('slide-up 0.55s cubic-bezier(0.16,1,0.3,1) 0.46s')}>
          <div className="flash-card">
            <div className="flash-card-inner p-4">
              <div className="absolute top-3 left-3 w-3 h-3 border-t border-l" style={{ borderColor: 'rgba(201,168,112,0.5)' }} />
              <div className="absolute top-3 right-3 w-3 h-3 border-t border-r" style={{ borderColor: 'rgba(201,168,112,0.5)' }} />
              <div className="absolute bottom-3 left-3 w-3 h-3 border-b border-l" style={{ borderColor: 'rgba(201,168,112,0.5)' }} />
              <div className="absolute bottom-3 right-3 w-3 h-3 border-b border-r" style={{ borderColor: 'rgba(201,168,112,0.5)' }} />

              <p className="label-overline mb-3">Describe Your Concept</p>
              <div style={{ position: 'relative' }}>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your story, emotions, or concept..."
                  className="w-full rounded-xl p-4 pb-12 text-sm focus:outline-none resize-none transition-all"
                  style={{
                    height: '7rem',
                    background: '#0a0a0a',
                    border: '1px solid #1a1a1a',
                    fontFamily: "'Inter', sans-serif",
                    lineHeight: 1.7,
                    color: '#f0ece4',
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
        </div>

        {/* ── CTA ── */}
        <div style={css('slide-up 0.45s cubic-bezier(0.16,1,0.3,1) 0.52s')}>
          <motion.button
            type="submit"
            disabled={!canContinue}
            whileTap={{ scale: canContinue ? 0.97 : 1 }}
            className="btn-game w-full rounded-xl py-4 px-6 text-sm flex items-center justify-center gap-2"
          >
            Continue to Details <ChevronRight size={15} />
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}
