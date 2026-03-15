import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Star, ArrowRight, X } from 'lucide-react';

interface RatingModalProps {
  onConfirm: (rating: number) => void;
  onSkip: () => void;
  onClose: () => void;
}

export default function RatingModal({ onConfirm, onSkip, onClose }: RatingModalProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  const displayValue = hovered ?? selected;

  const ratingLabel = (r: number) => {
    if (r <= 2) return 'Not great';
    if (r <= 4) return 'Below average';
    if (r <= 6) return 'Pretty good';
    if (r <= 8) return 'Really like it';
    return 'Love it!';
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 10 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative rounded-2xl p-7 flex flex-col gap-6 max-w-sm w-full mx-4"
        style={{
          background: '#141414',
          border: '1px solid #2a2a2a',
          boxShadow: '0 24px 64px rgba(0,0,0,0.7)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#555] hover:text-[#e8e4de] transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="space-y-1.5 pr-6">
          <div className="flex items-center gap-2">
            <Star size={14} style={{ color: '#c9a870' }} />
            <p className="label-overline" style={{ color: '#c9a870' }}>Rate Your Design</p>
          </div>
          <h3 className="font-display text-lg font-semibold text-[#f0ece4] leading-snug">
            How much do you like this tattoo?
          </h3>
          <p className="text-xs text-[#666] leading-relaxed">
            Your rating will be saved with the design so you can review your collection later.
          </p>
        </div>

        {/* Number grid 1–10 */}
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: 10 }, (_, i) => i + 1).map(n => {
            const isActive = displayValue !== null && n <= displayValue;
            const isSelected = selected === n;
            return (
              <button
                key={n}
                onClick={() => setSelected(n)}
                onMouseEnter={() => setHovered(n)}
                onMouseLeave={() => setHovered(null)}
                className="aspect-square rounded-xl flex items-center justify-center text-sm font-display font-semibold transition-all cursor-pointer"
                style={{
                  background: isActive ? 'rgba(201,168,112,0.15)' : '#1a1a1a',
                  border: isSelected
                    ? '1px solid #c9a870'
                    : isActive
                      ? '1px solid rgba(201,168,112,0.4)'
                      : '1px solid #2a2a2a',
                  color: isActive ? '#c9a870' : '#555',
                  transform: isSelected ? 'scale(1.08)' : 'scale(1)',
                }}
              >
                {n}
              </button>
            );
          })}
        </div>

        {/* Rating label */}
        <div className="h-5 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {displayValue !== null && (
              <motion.p
                key={displayValue}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="text-xs font-display font-medium tracking-wide"
                style={{ color: '#c9a870' }}
              >
                {displayValue}/10 — {ratingLabel(displayValue)}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onSkip}
            className="btn-game flex-1 rounded-xl py-3 text-xs cursor-pointer"
          >
            Skip
          </button>
          <button
            onClick={() => selected !== null && onConfirm(selected)}
            disabled={selected === null}
            className="btn-generate flex-1 rounded-xl py-3 flex items-center justify-center gap-2 cursor-pointer"
          >
            Save &amp; Continue <ArrowRight size={13} />
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
}
