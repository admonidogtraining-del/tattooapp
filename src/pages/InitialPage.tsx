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

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.38, ease: [0.25, 0.1, 0.25, 1] }}
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

      {/* ── Hero ── */}
      <div className="text-center mb-10 relative">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-36 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse, rgba(201,168,112,0.12) 0%, transparent 70%)',
            filter: 'blur(24px)',
          }}
        />
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06, duration: 0.4 }}
          className="relative label-overline mb-3"
          style={{ color: '#c9a870' }}
        >
          Ink Design Studio
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.42 }}
          className="relative font-display text-4xl uppercase text-[#f0ece4] mb-3"
          style={{ letterSpacing: '0.07em', lineHeight: 1.1 }}
        >
          Begin Your<br />
          <span style={{ color: '#c9a870' }}>Consultation</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="relative text-sm text-[#888880] tracking-wide"
        >
          Upload reference photos or describe your concept.
        </motion.p>
      </div>

      <form onSubmit={handleContinue} className="space-y-4">

        {/* ── Upload zone ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.38 }}
          className="rounded-2xl p-4"
          style={{ background: '#111111', border: '1px solid #222222' }}
        >
          <p className="label-overline mb-3">Reference Photos</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {images.map((img, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.88 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.22 }}
                className="relative aspect-square rounded-xl overflow-hidden group"
                style={{ border: '1px solid #2a2a2a' }}
              >
                <img src={img.url} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  style={{ background: 'rgba(0,0,0,0.4)' }}
                />
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
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,168,112,0.4)';
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
              <p
                className="transition-colors"
                style={{ fontSize: '11px', color: '#555550', letterSpacing: '0.05em' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#c9a870'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#555550'; }}
              >
                {images.length > 0 ? 'Add More' : 'Upload'}
              </p>
            </button>
          </div>
        </motion.div>

        {/* ── Divider ── */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, #252525 50%, transparent)' }} />
          <span className="label-overline" style={{ color: '#3a3a38' }}>And / Or</span>
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, #252525 50%, transparent)' }} />
        </div>

        {/* ── Text prompt ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.38 }}
          className="rounded-2xl p-4"
          style={{ background: '#111111', border: '1px solid #222222' }}
        >
          <p className="label-overline mb-3">Describe Your Concept</p>
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your story, emotions, or concept..."
              className="w-full h-28 rounded-xl p-4 pb-12 text-sm focus:outline-none resize-none transition-all text-[#f0ece4] placeholder:text-[#3a3a38]"
              style={{
                background: '#0a0a0a',
                border: '1px solid #1e1e1e',
                fontFamily: "'Inter', sans-serif",
                lineHeight: 1.65,
              }}
              onFocus={e => { (e.target as HTMLElement).style.borderColor = 'rgba(201,168,112,0.35)'; }}
              onBlur={e => { (e.target as HTMLElement).style.borderColor = '#1e1e1e'; }}
            />
            <button
              type="button"
              onClick={handleInspire}
              disabled={inspiring}
              className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-display uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
              style={
                inspireError
                  ? { background: '#1a0808', border: '1px solid rgba(200,64,64,0.35)', color: '#e07070' }
                  : { background: '#1a150a', border: '1px solid rgba(201,168,112,0.25)', color: '#c9a870' }
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
        </motion.div>

        {/* ── CTA ── */}
        <motion.button
          type="submit"
          disabled={!canContinue}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32, duration: 0.35 }}
          whileTap={{ scale: canContinue ? 0.97 : 1 }}
          className="btn-game w-full rounded-xl py-4 px-6 text-sm flex items-center justify-center gap-2"
        >
          Continue to Details <ChevronRight size={15} />
        </motion.button>
      </form>
    </motion.div>
  );
}
