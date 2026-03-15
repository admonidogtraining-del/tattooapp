import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { SKIN_TONES } from '../constants';

const TOTAL_STEPS = 3;
const INK_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function QuestionnairePage() {
  const navigate = useNavigate();
  const { questionnaire, setQuestionnaire } = useApp();
  const [step, setStep] = useState(0);

  const go = (next: number) => { setStep(next); };
  const goBack = () => { if (step === 0) navigate('/'); else go(step - 1); };
  const goNext = () => { if (step < TOTAL_STEPS - 1) go(step + 1); else navigate('/style'); };

  const stepComplete = [
    !!questionnaire.skinColor,
    !!questionnaire.colorPreference,
    !!questionnaire.size,
  ][step];

  const stepLabels = ['Skin Tone', 'Color Mode', 'Size'];

  const questions = [
    {
      title: 'Skin Tone',
      sub: 'Helps the AI recommend colors that pop on your skin.',
      content: (
        <div className="flex justify-center gap-5 flex-wrap py-2">
          {SKIN_TONES.map((tone) => {
            const isSel = questionnaire.skinColor === tone.value;
            return (
              <motion.button
                key={tone.value}
                type="button"
                onClick={() => setQuestionnaire({ ...questionnaire, skinColor: tone.value })}
                className="flex flex-col items-center gap-2 cursor-pointer"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.94 }}
              >
                <div
                  className="w-14 h-14 rounded-full transition-all duration-250"
                  style={{
                    backgroundColor: tone.color,
                    boxShadow: isSel
                      ? `0 0 0 3px #0a0a0a, 0 0 0 5px #c9a870, 0 0 20px rgba(201,168,112,0.5)`
                      : 'none',
                    opacity: isSel ? 1 : 0.45,
                  }}
                />
                <span
                  className="font-display uppercase transition-colors duration-200"
                  style={{ fontSize: '9px', color: isSel ? '#c9a870' : '#444440', letterSpacing: '0.12em' }}
                >
                  {tone.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      ),
    },
    {
      title: 'Color Mode',
      sub: 'This shapes the entire palette of your tattoo.',
      content: (
        <div className="flex flex-col gap-2.5">
          {[
            { value: 'Black & Grey Only', icon: '◾', desc: 'Timeless, works on all skin tones' },
            { value: 'Full Color', icon: '◈', desc: 'Vibrant, painterly or traditional' },
            { value: 'Black with Color Accents', icon: '✦', desc: 'Best of both worlds' },
          ].map((opt, i) => {
            const isSel = questionnaire.colorPreference === opt.value;
            return (
              <motion.button
                key={opt.value}
                type="button"
                onClick={() => setQuestionnaire({ ...questionnaire, colorPreference: opt.value })}
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.98 }}
                className="w-full p-4 rounded-xl text-left flex items-center gap-4 transition-all cursor-pointer relative overflow-hidden"
                style={{
                  background: isSel ? '#1a150a' : '#0f0f0d',
                  border: isSel ? '1px solid rgba(201,168,112,0.55)' : '1px solid #1e1e1e',
                  boxShadow: isSel ? '0 0 20px rgba(201,168,112,0.12)' : 'none',
                }}
              >
                {isSel && (
                  <motion.div
                    layoutId="color-accent-bar"
                    className="absolute left-0 top-0 bottom-0 w-0.5"
                    style={{ background: '#c9a870' }}
                  />
                )}
                <span style={{ fontSize: '18px', color: isSel ? '#c9a870' : '#333330', marginLeft: 4 }}>
                  {opt.icon}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#f0ece4]">{opt.value}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#888880' }}>{opt.desc}</p>
                </div>
                {isSel && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: '#c9a870' }}
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2.5 2.5L8 3" stroke="#0a0a0a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>
      ),
    },
    {
      title: 'Tattoo Size',
      sub: 'Size affects detail, placement, and healing time.',
      content: (
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { value: 'Micro (Under 2 inches)', short: 'Micro', sub: 'Under 2"', dotSize: 20 },
            { value: 'Small (2-4 inches)', short: 'Small', sub: '2–4"', dotSize: 28 },
            { value: 'Medium (4-7 inches)', short: 'Medium', sub: '4–7"', dotSize: 36 },
            { value: 'Large (7-12 inches)', short: 'Large', sub: '7–12"', dotSize: 44 },
            { value: 'Extra Large (Full Sleeve/Back)', short: 'XL', sub: 'Full Sleeve', dotSize: 52 },
          ].map((opt, i) => {
            const isSel = questionnaire.size === opt.value;
            return (
              <motion.button
                key={opt.value}
                type="button"
                onClick={() => setQuestionnaire({ ...questionnaire, size: opt.value })}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.96 }}
                className="p-4 rounded-xl flex flex-col items-center gap-3 cursor-pointer"
                style={{
                  background: isSel ? '#1a150a' : '#0f0f0d',
                  border: isSel ? '1px solid rgba(201,168,112,0.55)' : '1px solid #1e1e1e',
                  boxShadow: isSel ? '0 0 20px rgba(201,168,112,0.12)' : 'none',
                  transition: 'background 0.2s, border 0.2s, box-shadow 0.2s',
                }}
              >
                <motion.div
                  animate={{
                    background: isSel ? '#c9a870' : '#1e1e1e',
                    boxShadow: isSel ? `0 0 ${opt.dotSize / 2}px rgba(201,168,112,0.4)` : 'none',
                  }}
                  transition={{ duration: 0.25 }}
                  className="rounded-full"
                  style={{
                    width: opt.dotSize,
                    height: opt.dotSize,
                    border: isSel ? 'none' : '1px solid #2e2e2e',
                  }}
                />
                <div className="text-center">
                  <p className="font-display uppercase text-[#f0ece4]" style={{ fontSize: '12px', letterSpacing: '0.09em' }}>
                    {opt.short}
                  </p>
                  <p style={{ fontSize: '11px', color: '#888880' }}>{opt.sub}</p>
                </div>
              </motion.button>
            );
          })}
        </div>
      ),
    },
  ];

  const q = questions[step];

  return (
    <motion.div
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.4, ease: INK_EASE }}
      className="max-w-lg mx-auto"
      style={{ animation: 'fade-in 0.35s ease both' }}
    >
      {/* ── Progress bar ── */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={goBack}
            className="transition-colors cursor-pointer shrink-0"
            style={{ color: '#444440' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#c9a870'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#444440'; }}
          >
            <ChevronLeft size={18} />
          </button>
          <div className="flex-1 flex gap-1.5">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div key={i} className="h-1 flex-1 rounded-full overflow-hidden" style={{ background: '#1a1a1a' }}>
                <motion.div
                  className="h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: i <= step ? '100%' : '0%' }}
                  transition={{ duration: 0.45, ease: INK_EASE }}
                  style={{
                    background: i <= step ? '#c9a870' : 'transparent',
                    boxShadow: i <= step ? '0 0 8px rgba(201,168,112,0.55)' : 'none',
                  }}
                />
              </div>
            ))}
          </div>
          <span className="font-display shrink-0" style={{ fontSize: '11px', color: '#333330', letterSpacing: '0.12em' }}>
            {step + 1}/{TOTAL_STEPS}
          </span>
        </div>
        <div className="flex ml-7 gap-1.5">
          {stepLabels.map((label, i) => (
            <div key={label} className="flex-1 text-center">
              <span
                className="font-display uppercase transition-colors duration-300"
                style={{
                  fontSize: '9px',
                  color: i < step ? 'rgba(201,168,112,0.5)' : i === step ? '#c9a870' : '#252525',
                  letterSpacing: '0.12em',
                }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Question card ── */}
      <div className="flash-card mb-4">
        <div className="flash-card-inner p-6 relative overflow-hidden">
          {/* Corner ornaments */}
          <div className="absolute top-3 left-3 w-4 h-4 border-t border-l" style={{ borderColor: 'rgba(201,168,112,0.4)' }} />
          <div className="absolute top-3 right-3 w-4 h-4 border-t border-r" style={{ borderColor: 'rgba(201,168,112,0.4)' }} />
          <div className="absolute bottom-3 left-3 w-4 h-4 border-b border-l" style={{ borderColor: 'rgba(201,168,112,0.4)' }} />
          <div className="absolute bottom-3 right-3 w-4 h-4 border-b border-r" style={{ borderColor: 'rgba(201,168,112,0.4)' }} />

          <div key={step} style={{ animation: 'fade-in 0.25s ease both' }}>
            <div className="mb-6">
              <p className="label-overline mb-1.5" style={{ color: 'rgba(201,168,112,0.55)' }}>
                Step {step + 1} of {TOTAL_STEPS}
              </p>
              <div style={{ overflow: 'hidden' }}>
                <h2
                  className="font-ink text-5xl text-[#f0ece4]"
                  style={{ animation: 'slide-up-text 0.45s cubic-bezier(0.16,1,0.3,1) both' }}
                >
                  {q.title}
                </h2>
              </div>
              <p className="text-sm mt-1.5" style={{ color: '#888880' }}>{q.sub}</p>
            </div>
            {q.content}
          </div>
        </div>
      </div>

      {/* ── Next button ── */}
      <motion.button
        onClick={goNext}
        disabled={!stepComplete}
        whileTap={{ scale: stepComplete ? 0.97 : 1 }}
        className="btn-game w-full rounded-xl py-4 text-sm flex items-center justify-center gap-2"
      >
        {step === TOTAL_STEPS - 1 ? 'Choose Style' : 'Next'}
        <ChevronRight size={15} />
      </motion.button>
    </motion.div>
  );
}
