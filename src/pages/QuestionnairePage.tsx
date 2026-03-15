import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { SKIN_TONES } from '../constants';

const TOTAL_STEPS = 3;

const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? 56 : -56, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -56 : 56, opacity: 0 }),
};

export default function QuestionnairePage() {
  const navigate = useNavigate();
  const { questionnaire, setQuestionnaire } = useApp();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);

  const go = (next: number) => {
    setDir(next > step ? 1 : -1);
    setStep(next);
  };

  const goBack = () => {
    if (step === 0) navigate('/');
    else go(step - 1);
  };

  const goNext = () => {
    if (step < TOTAL_STEPS - 1) go(step + 1);
    else navigate('/style');
  };

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
            const isSelected = questionnaire.skinColor === tone.value;
            return (
              <button
                key={tone.value}
                type="button"
                onClick={() => setQuestionnaire({ ...questionnaire, skinColor: tone.value })}
                className="flex flex-col items-center gap-2 group cursor-pointer"
              >
                <div
                  className="w-14 h-14 rounded-full transition-all duration-200"
                  style={{
                    backgroundColor: tone.color,
                    boxShadow: isSelected
                      ? `0 0 0 3px #0a0a0a, 0 0 0 5px #c9a870, 0 0 16px rgba(201,168,112,0.45)`
                      : 'none',
                    transform: isSelected ? 'scale(1.12)' : undefined,
                    opacity: isSelected ? 1 : 0.5,
                  }}
                />
                <span
                  className="text-xs font-display uppercase transition-colors duration-200"
                  style={{
                    color: isSelected ? '#c9a870' : '#444440',
                    letterSpacing: '0.1em',
                    fontSize: '10px',
                  }}
                >
                  {tone.label}
                </span>
              </button>
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
          ].map(opt => {
            const isSelected = questionnaire.colorPreference === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setQuestionnaire({ ...questionnaire, colorPreference: opt.value })}
                className="w-full p-4 rounded-xl text-left flex items-center gap-4 transition-all cursor-pointer relative overflow-hidden"
                style={{
                  background: isSelected ? '#1a150a' : '#0f0f0d',
                  border: isSelected ? '1px solid rgba(201,168,112,0.55)' : '1px solid #222222',
                  boxShadow: isSelected ? '0 0 18px rgba(201,168,112,0.1)' : 'none',
                }}
                onMouseEnter={e => {
                  if (!isSelected) {
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,168,112,0.2)';
                    (e.currentTarget as HTMLElement).style.background = '#141410';
                  }
                }}
                onMouseLeave={e => {
                  if (!isSelected) {
                    (e.currentTarget as HTMLElement).style.borderColor = '#222222';
                    (e.currentTarget as HTMLElement).style.background = '#0f0f0d';
                  }
                }}
              >
                {isSelected && (
                  <div
                    className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l"
                    style={{ background: '#c9a870' }}
                  />
                )}
                <span className="text-lg ml-1" style={{ color: isSelected ? '#c9a870' : '#555550' }}>
                  {opt.icon}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#f0ece4]">{opt.value}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#888880' }}>{opt.desc}</p>
                </div>
                {isSelected && (
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: '#c9a870' }}
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2.5 2.5L8 3" stroke="#0a0a0a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      ),
    },
    {
      title: 'Tattoo Size',
      sub: 'Size affects detail, placement options, and healing.',
      content: (
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { value: 'Micro (Under 2 inches)', short: 'Micro', sub: 'Under 2"', dotSize: 20 },
            { value: 'Small (2-4 inches)', short: 'Small', sub: '2–4"', dotSize: 28 },
            { value: 'Medium (4-7 inches)', short: 'Medium', sub: '4–7"', dotSize: 36 },
            { value: 'Large (7-12 inches)', short: 'Large', sub: '7–12"', dotSize: 44 },
            { value: 'Extra Large (Full Sleeve/Back)', short: 'XL', sub: 'Full Sleeve', dotSize: 52 },
          ].map(opt => {
            const isSelected = questionnaire.size === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setQuestionnaire({ ...questionnaire, size: opt.value })}
                className="p-4 rounded-xl flex flex-col items-center gap-3 transition-all cursor-pointer"
                style={{
                  background: isSelected ? '#1a150a' : '#0f0f0d',
                  border: isSelected ? '1px solid rgba(201,168,112,0.55)' : '1px solid #222222',
                  boxShadow: isSelected ? '0 0 18px rgba(201,168,112,0.1)' : 'none',
                }}
                onMouseEnter={e => {
                  if (!isSelected) {
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,168,112,0.2)';
                    (e.currentTarget as HTMLElement).style.background = '#141410';
                  }
                }}
                onMouseLeave={e => {
                  if (!isSelected) {
                    (e.currentTarget as HTMLElement).style.borderColor = '#222222';
                    (e.currentTarget as HTMLElement).style.background = '#0f0f0d';
                  }
                }}
              >
                <div
                  className="rounded-full transition-all duration-200"
                  style={{
                    width: `${opt.dotSize}px`,
                    height: `${opt.dotSize}px`,
                    background: isSelected ? '#c9a870' : '#1e1e1e',
                    boxShadow: isSelected ? `0 0 ${opt.dotSize / 2}px rgba(201,168,112,0.35)` : 'none',
                    border: isSelected ? 'none' : '1px solid #2e2e2e',
                  }}
                />
                <div className="text-center">
                  <p
                    className="font-display uppercase text-[#f0ece4]"
                    style={{ fontSize: '12px', letterSpacing: '0.09em' }}
                  >
                    {opt.short}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: '#888880' }}>{opt.sub}</p>
                </div>
              </button>
            );
          })}
        </div>
      ),
    },
  ];

  const q = questions[step];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.38, ease: [0.25, 0.1, 0.25, 1] }}
      className="max-w-lg mx-auto"
    >
      {/* ── Progress bar ── */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={goBack}
            className="transition-colors cursor-pointer shrink-0"
            style={{ color: '#555550' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#c9a870'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#555550'; }}
          >
            <ChevronLeft size={18} />
          </button>
          <div className="flex-1 flex gap-1.5">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className="h-1 flex-1 rounded-full overflow-hidden"
                style={{ background: '#1e1e1e' }}
              >
                <motion.div
                  className="h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: i <= step ? '100%' : '0%' }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  style={{
                    background: i <= step ? '#c9a870' : 'transparent',
                    boxShadow: i <= step ? '0 0 6px rgba(201,168,112,0.5)' : 'none',
                  }}
                />
              </div>
            ))}
          </div>
          <span
            className="font-display shrink-0"
            style={{ fontSize: '11px', color: '#444440', letterSpacing: '0.12em' }}
          >
            {step + 1}/{TOTAL_STEPS}
          </span>
        </div>
        <div className="flex ml-7 gap-1.5">
          {stepLabels.map((label, i) => (
            <div key={label} className="flex-1 text-center">
              <span
                className="font-display uppercase transition-colors duration-200"
                style={{
                  fontSize: '9px',
                  color: i < step ? '#c9a87088' : i === step ? '#c9a870' : '#2e2e2e',
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
      <div
        className="rounded-2xl p-6 mb-4 relative overflow-hidden"
        style={{ background: '#111111', border: '1px solid #222222' }}
      >
        {/* Gold corner accents */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t border-l rounded-tl-2xl" style={{ borderColor: 'rgba(201,168,112,0.4)' }} />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r rounded-br-2xl" style={{ borderColor: 'rgba(201,168,112,0.4)' }} />

        <div className="overflow-hidden">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={step}
              custom={dir}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.26, ease: 'easeInOut' }}
            >
              <div className="mb-6">
                <p
                  className="label-overline mb-1.5"
                  style={{ color: '#c9a87088' }}
                >
                  Step {step + 1} of {TOTAL_STEPS}
                </p>
                <h2
                  className="font-display text-2xl uppercase text-[#f0ece4]"
                  style={{ letterSpacing: '0.08em' }}
                >
                  {q.title}
                </h2>
                <p className="text-sm mt-1" style={{ color: '#888880' }}>{q.sub}</p>
              </div>
              {q.content}
            </motion.div>
          </AnimatePresence>
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
