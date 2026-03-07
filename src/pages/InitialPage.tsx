import { useNavigate } from 'react-router-dom';
import { Upload, Plus, X, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';

export default function InitialPage() {
  const navigate = useNavigate();
  const { prompt, setPrompt, images, handleImageUpload, removeImage, fileInputRef } = useApp();

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() && images.length === 0) return;
    navigate('/details');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-2xl mx-auto mt-12"
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        multiple
        className="hidden"
      />

      <h2 className="text-4xl font-light tracking-tight mb-4 text-center">
        Begin Consultation
      </h2>
      <p className="text-zinc-400 text-center mb-12">
        Upload reference photos or describe your concept to start.
      </p>

      <div className="space-y-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {images.map((img, idx) => (
            <div
              key={idx}
              className="relative aspect-square rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 group"
            >
              <img src={img.url} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
              <button
                onClick={() => removeImage(idx)}
                className="absolute top-2 right-2 w-8 h-8 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square border-2 border-dashed border-zinc-800 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-zinc-900/50 hover:border-zinc-700 transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-500 group-hover:text-zinc-300 group-hover:scale-110 transition-all">
              {images.length > 0 ? <Plus size={20} /> : <Upload size={20} />}
            </div>
            <p className="text-xs font-medium text-zinc-400">
              {images.length > 0 ? 'Add Photo' : 'Upload Photos'}
            </p>
          </div>
        </div>

        <div className="relative flex items-center py-4">
          <div className="flex-grow border-t border-zinc-900" />
          <span className="flex-shrink-0 mx-4 text-xs uppercase tracking-widest text-zinc-600">
            And / Or
          </span>
          <div className="flex-grow border-t border-zinc-900" />
        </div>

        <form onSubmit={handleContinue} className="space-y-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your story, emotions, or concept..."
            className="w-full h-32 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-500 focus:border-zinc-500 transition-all resize-none placeholder:text-zinc-600"
          />
          <button
            type="submit"
            disabled={!prompt.trim() && images.length === 0}
            className="w-full bg-zinc-100 text-zinc-950 rounded-xl py-3.5 px-4 text-sm font-medium hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            Continue to Details <ChevronRight size={16} />
          </button>
        </form>
      </div>
    </motion.div>
  );
}
