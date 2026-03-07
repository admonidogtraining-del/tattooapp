import { motion } from 'motion/react';
import { X, Save } from 'lucide-react';
import { useApp } from '../context/AppContext';
import BodyPartPreview from './BodyPartPreview';
import { SKIN_TONES, extractPlacement, getPlacementBg } from '../constants';

export default function TryOnModal() {
  const {
    generatedImage, showTryOn, setShowTryOn,
    questionnaire, result,
    tattooScale, setTattooScale,
    tattooX, tattooY,
  } = useApp();

  if (!showTryOn || !generatedImage) return null;

  const skinHex = SKIN_TONES.find(t => t.value === questionnaire.skinColor)?.color ?? '#C68642';
  const isLightSkin = ['Very Light', 'Light'].includes(questionnaire.skinColor);
  // Use AI-suggested placement (since we no longer collect placement in the form)
  const aiExtracted = result ? extractPlacement(result.user_profile_analysis.suggested_placement_logic) : 'forearm';
  const effectivePlacement = aiExtracted || 'forearm';
  const placementLabel = getPlacementBg(effectivePlacement).label;

  const handleSave = () => {
    const svgEl = document.querySelector('.try-on-body svg') as SVGElement | null;
    const canvas = document.createElement('canvas');
    const size = 600;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, size, size);

    const drawTattoo = () => {
      const tattooSize = Math.round(192 * tattooScale);
      const cx = size / 2 + tattooX.get();
      const cy = size / 2 + tattooY.get();
      const img = new Image();
      img.onload = () => {
        ctx.globalAlpha = 0.85;
        ctx.drawImage(img, cx - tattooSize / 2, cy - tattooSize / 2, tattooSize, tattooSize);
        ctx.globalAlpha = 1;
        canvas.toBlob(blob => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'inksight-tryon.png';
          a.click();
          URL.revokeObjectURL(url);
        }, 'image/png');
      };
      img.src = generatedImage!;
    };

    if (svgEl) {
      const svgData = new XMLSerializer().serializeToString(svgEl);
      const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const bodyImg = new Image();
      bodyImg.onload = () => {
        ctx.drawImage(bodyImg, 0, 0, size, size);
        URL.revokeObjectURL(url);
        drawTattoo();
      };
      bodyImg.src = url;
    } else {
      drawTattoo();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4 sm:p-6 gap-4"
    >
      <div className="flex items-center justify-between w-full max-w-2xl">
        <div>
          <p className="text-white font-medium">Try on Body</p>
          <p className="text-zinc-400 text-sm mt-0.5">
            Placement: <span className="text-zinc-200">{placementLabel}</span>
          </p>
        </div>
        <button
          onClick={() => setShowTryOn(false)}
          className="w-10 h-10 bg-zinc-800 text-white rounded-full flex items-center justify-center hover:bg-zinc-700 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="relative w-full max-w-2xl aspect-[3/4] sm:aspect-square rounded-[40px] sm:rounded-[60px] overflow-hidden shadow-inner border-4 border-zinc-800">
        <div className="absolute inset-0 try-on-body">
          <BodyPartPreview placement={effectivePlacement} skinHex={skinHex} />
        </div>
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
          <div className="w-1.5 h-1.5 rounded-full bg-white/80" />
          <p className="text-white/80 text-xs font-medium uppercase tracking-wider">
            {placementLabel} · Drag to position
          </p>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.img
            drag
            dragConstraints={{ left: -200, right: 200, top: -200, bottom: 200 }}
            style={{
              x: tattooX,
              y: tattooY,
              opacity: isLightSkin ? 0.92 : 0.78,
              width: `${Math.round(192 * tattooScale)}px`,
              height: `${Math.round(192 * tattooScale)}px`,
            }}
            src={generatedImage}
            className={`object-contain cursor-grab active:cursor-grabbing z-10 drop-shadow-2xl ${isLightSkin ? 'mix-blend-multiply' : ''}`}
            alt="Tattoo Try On"
          />
        </div>
      </div>

      <div className="w-full max-w-2xl flex items-center gap-3">
        <button
          onClick={() => setTattooScale(s => Math.max(0.3, +(s - 0.1).toFixed(1)))}
          className="w-8 h-8 rounded-full bg-zinc-800 text-white text-lg flex items-center justify-center hover:bg-zinc-700 transition-colors shrink-0"
        >−</button>
        <input
          type="range" min="0.3" max="2.5" step="0.05"
          value={tattooScale}
          onChange={e => setTattooScale(parseFloat(e.target.value))}
          className="flex-1 accent-zinc-400"
        />
        <button
          onClick={() => setTattooScale(s => Math.min(2.5, +(s + 0.1).toFixed(1)))}
          className="w-8 h-8 rounded-full bg-zinc-800 text-white text-lg flex items-center justify-center hover:bg-zinc-700 transition-colors shrink-0"
        >+</button>
        <span className="text-zinc-500 text-xs w-10 text-right">{Math.round(tattooScale * 100)}%</span>
      </div>

      <div className="w-full max-w-2xl flex gap-3">
        <button
          onClick={handleSave}
          className="flex-1 flex items-center justify-center gap-2 bg-zinc-800 text-zinc-100 rounded-xl py-3 text-sm font-medium hover:bg-zinc-700 transition-colors"
        >
          <Save size={16} /> Save Try-On
        </button>
        <button
          onClick={() => setShowTryOn(false)}
          className="flex-1 flex items-center justify-center gap-2 bg-zinc-900 border border-zinc-700 text-zinc-300 rounded-xl py-3 text-sm font-medium hover:border-zinc-500 transition-colors"
        >
          Done
        </button>
      </div>

      <p className="text-zinc-600 text-xs text-center">Drag to position · Use slider to resize</p>
    </motion.div>
  );
}
