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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
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

      {/* Hero */}
      <div className="text-center mb-10 relative">
        {/* Decorative glow orb */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-32 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse, #7c3aed20 0%, transparent 70%)',
            filter: 'blur(20px)',
          }}
        />
        <p className="relative text-[10px] font-display text-purple-400 uppercase tracking-[0.3em] mb-3">
          Ink Design Studio
        </p>
        <h2 className="relative text-4xl font-display uppercase tracking-widest text-zinc-100 mb-3" style={{ letterSpacing: '0.08em' }}>
          Begin Your<br />
          <span
            className="text-transparent bg-clip-text"
            style={{ backgroundImage: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}
          >
            Consultation
          </span>
        </h2>
        <p className="relative text-sm text-zinc-500 tracking-wide">
          Upload reference photos or describe your concept.
        </p>
      </div>

      <form onSubmit={handleContinue} className="space-y-5">
        {/* Upload zone */}
        <div
          className="rounded-2xl p-4 relative"
          style={{
            background: 'linear-gradient(135deg, #111118 0%, #0f0f1a 100%)',
            border: '1px solid #1e1e2e',
          }}
        >
          <p className="text-[10px] font-display text-zinc-500 uppercase tracking-widest mb-3">
            Reference Photos
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {images.map((img, idx) => (
              <div
                key={idx}
                className="relative aspect-square rounded-xl overflow-hidden group"
                style={{ border: '1px solid #7c3aed40' }}
              >
                <img src={img.url} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  style={{ background: '#ec4899', boxShadow: '0 0 8px #ec489980' }}
                >
                  <X size={12} className="text-white" />
                </button>
              </div>
            ))}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all group"
              style={{
                border: '2px dashed #1e1e2e',
                background: 'transparent',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = '#7c3aed60';
                (e.currentTarget as HTMLElement).style.background = '#7c3aed08';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = '#1e1e2e';
                (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: '#1a1a2e', border: '1px solid #7c3aed40' }}
              >
                {images.length > 0
                  ? <Plus size={18} className="text-purple-400" />
                  : <Upload size={18} className="text-purple-400" />
                }
              </div>
              <p className="text-xs text-zinc-500 group-hover:text-purple-400 transition-colors">
                {images.length > 0 ? 'Add More' : 'Upload'}
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, #1e1e2e 50%, transparent)' }} />
          <span className="text-[10px] font-display text-zinc-600 uppercase tracking-[0.25em]">And / Or</span>
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, #1e1e2e 50%, transparent)' }} />
        </div>

        {/* Text prompt */}
        <div
          className="rounded-2xl p-4 relative"
          style={{
            background: 'linear-gradient(135deg, #111118 0%, #0f0f1a 100%)',
            border: '1px solid #1e1e2e',
          }}
        >
          <p className="text-[10px] font-display text-zinc-500 uppercase tracking-widest mb-3">
            Describe Your Concept
          </p>
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your story, emotions, or concept..."
              className="w-full h-28 rounded-xl p-4 pb-12 text-sm focus:outline-none resize-none transition-all text-zinc-200 placeholder:text-zinc-600"
              style={{
                background: '#09090b',
                border: '1px solid #1e1e2e',
                fontFamily: "'Chakra Petch', sans-serif",
              }}
              onFocus={e => { (e.target as HTMLElement).style.borderColor = '#7c3aed60'; }}
              onBlur={e => { (e.target as HTMLElement).style.borderColor = '#1e1e2e'; }}
            />
            <button
              type="button"
              onClick={handleInspire}
              disabled={inspiring}
              className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-display uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
              style={
                inspireError
                  ? { background: '#450a0a', border: '1px solid #7f1d1d', color: '#fca5a5' }
                  : { background: '#1a0a2e', border: '1px solid #7c3aed50', color: '#a855f7' }
              }
            >
              {inspiring ? (
                <motion.span
                  className="inline-block w-3 h-3 border border-purple-400 border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                />
              ) : (
                <Wand2 size={12} />
              )}
              {inspiring ? 'Inspiring…' : inspireError ? 'Failed — check API key' : 'Inspire Me'}
            </button>
          </div>
        </div>

        {/* CTA button */}
        <button
          type="submit"
          disabled={!canContinue}
          className="btn-game w-full rounded-xl py-4 px-6 text-sm flex items-center justify-center gap-2 cursor-pointer"
        >
          Continue to Details <ChevronRight size={16} />
        </button>
      </form>
    </motion.div>
  );
}
