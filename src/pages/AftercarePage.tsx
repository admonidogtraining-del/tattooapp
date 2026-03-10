import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Save, Droplets, Clock, MapPin, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';

const HEALING_COLOR: Record<string, string> = {
  high: '#f87171',
  med: '#fbbf24',
  low: '#4ade80',
};

function healingColor(difficulty: string): string {
  const d = difficulty.toLowerCase();
  if (d.includes('high')) return HEALING_COLOR.high;
  if (d.includes('med')) return HEALING_COLOR.med;
  return HEALING_COLOR.low;
}

export default function AftercarePage() {
  const navigate = useNavigate();
  const { result, generatedImage } = useApp();

  if (!result) {
    navigate('/results');
    return null;
  }

  const { user_profile_analysis, technical_brief, aftercare_preview } = result;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="max-w-2xl mx-auto space-y-4"
    >
      {/* Back */}
      <button
        onClick={() => navigate('/results')}
        className="flex items-center gap-1.5 text-xs text-[#999] hover:text-[#e8e4de] transition-colors cursor-pointer tracking-widest uppercase"
      >
        <ChevronLeft size={13} /> Back to Design
      </button>

      {/* Page title */}
      <div className="pb-1">
        <h2 className="font-display text-2xl font-semibold text-[#f0ece4]">Placement & Aftercare</h2>
        <p className="text-sm text-[#999] mt-1 tracking-wide">Everything you need before getting inked</p>
      </div>

      {/* ── PLACEMENT ── */}
      <div
        className="rounded-2xl p-5 space-y-3"
        style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: '#1f1a13', border: '1px solid #3a2e1a' }}>
            <MapPin size={13} style={{ color: '#c9a870' }} />
          </div>
          <p className="font-display text-sm font-semibold text-[#f0ece4]">Placement Recommendation</p>
        </div>
        <p className="text-sm text-[#c8c4be] leading-relaxed">
          {user_profile_analysis.suggested_placement_logic}
        </p>
      </div>

      {/* ── LONGEVITY + HEALING ── */}
      <div className="grid grid-cols-2 gap-3">
        <div
          className="rounded-2xl p-5 space-y-2"
          style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}
        >
          <div className="flex items-center gap-2">
            <Clock size={13} style={{ color: '#c9a870' }} />
            <p className="label-overline">Longevity</p>
          </div>
          <p className="text-sm text-[#e8e4de] font-medium leading-snug">
            {technical_brief.estimated_longevity}
          </p>
        </div>

        <div
          className="rounded-2xl p-5 space-y-2"
          style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}
        >
          <div className="flex items-center gap-2">
            <Droplets size={13} style={{ color: healingColor(aftercare_preview.healing_difficulty) }} />
            <p className="label-overline">Healing</p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ background: healingColor(aftercare_preview.healing_difficulty) }}
            />
            <p className="text-sm text-[#e8e4de] font-medium">
              {aftercare_preview.healing_difficulty}
            </p>
          </div>
        </div>
      </div>

      {/* ── LIFESTYLE WARNING ── */}
      <div
        className="rounded-2xl p-5 space-y-3"
        style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: '#1a0e0e', border: '1px solid #3a1a1a' }}>
            <AlertCircle size={13} style={{ color: '#e07070' }} />
          </div>
          <p className="font-display text-sm font-semibold text-[#f0ece4]">Lifestyle Warning</p>
        </div>
        <p className="text-sm text-[#c8c4be] leading-relaxed">
          {aftercare_preview.lifestyle_warning}
        </p>
      </div>

      {/* ── COMPLEXITY ── */}
      <div
        className="rounded-2xl p-5"
        style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}
      >
        <p className="label-overline mb-2">Design Complexity</p>
        <p className="text-sm text-[#c8c4be] leading-relaxed">{technical_brief.design_complexity}</p>
      </div>

      {/* ── SAVE CTA ── */}
      {generatedImage && (
        <a
          href={generatedImage}
          download="tattoo-design.png"
          className="btn-generate w-full flex items-center justify-center gap-3 rounded-2xl py-4 px-6 cursor-pointer"
          style={{ display: 'flex' }}
        >
          <Save size={15} /> Save Your Design
        </a>
      )}
    </motion.div>
  );
}
