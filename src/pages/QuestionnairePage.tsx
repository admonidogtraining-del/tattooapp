import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { SKIN_TONES } from '../constants';

const TOTAL_STEPS = 3;

const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
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
      title: "Skin Tone",
      sub: 'Helps the AI recommend colors that pop on your skin.',
      content: (
        <div className="flex justify-center gap-4 flex-wrap py-2">
          {SKIN_TONES.map((tone) => {
            const isSelected = questionnaire.skinColor === tone.value;
            return (
              <button
                key={tone.value}
                type="button"
                onClick={() => { setQuestionnaire({ ...questionnaire, skinColor: tone.value }); }}
                className="flex flex-col items-center gap-2 group cursor-pointer"
              >
                <div
                  className="w-14 h-14 rounded-full transition-all"
                  style={{
                    backgroundColor: tone.color,
                    boxShadow: isSelected
                      ? `0 0 0 3px #09090b, 0 0 0 5px #a855f7, 0 0 15px #a855f760`
                      : 'none',
                    transform: isSelected ? 'scale(1.12)' : undefined,
                    opacity: isSelected ? 1 : 0.55,
                  }}
                />
                <span
                  className="text-xs font-display uppercase tracking-wider transition-colors"
                  style={{ color: isSelected ? '#a855f7' : '#52525b', letterSpacing: '0.1em' }}
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
      title: "Color Mode",
      sub: 'This shapes the entire palette of your tattoo.',
      content: (
        <div className="flex flex-col gap-3">
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
                onClick={() => { setQuestionnaire({ ...questionnaire, colorPreference: opt.value }); }}
                className="w-full p-4 rounded-xl text-left flex items-center gap-4 transition-all cursor-pointer relative overflow-hidden"
                style={{
                  background: isSelected
                    ? 'linear-gradient(135deg, #1a0a2e 0%, #0f0f1a 100%)'
                    : 'linear-gradient(135deg, #111118 0%, #0f0f1a 100%)',
                  border: isSelected ? '1px solid #a855f7' : '1px solid #1e1e2e',
                  boxShadow: isSelected ? '0 0 20px #7c3aed30' : 'none',
                }}
              >
                {isSelected && (
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1 rounded-l"
                    style={{ background: 'linear-gradient(180deg, #a855f7, #ec4899)' }}
                  />
                )}
                <span className="text-xl text-zinc-300 ml-1">{opt.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-zinc-100">{opt.value}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{opt.desc}</p>
                </div>
                {isSelected && (
                  <div className="ml-auto">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: '#7c3aed' }}
                    >
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      ),
    },
    {
      title: "Tattoo Size",
      sub: 'Size affects detail, placement options, and healing.',
      content: (
        <div className="grid grid-cols-2 gap-3">
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
                onClick={() => { setQuestionnaire({ ...questionnaire, size: opt.value }); }}
                className="p-4 rounded-xl text-left flex flex-col items-center gap-3 transition-all cursor-pointer relative"
                style={{
                  background: isSelected
                    ? 'linear-gradient(135deg, #1a0a2e 0%, #0f0f1a 100%)'
                    : 'linear-gradient(135deg, #111118 0%, #0f0f1a 100%)',
                  border: isSelected ? '1px solid #a855f7' : '1px solid #1e1e2e',
                  boxShadow: isSelected ? '0 0 20px #7c3aed30' : 'none',
                }}
              >
                <div
                  className="rounded-full transition-all"
                  style={{
                    width: `${opt.dotSize}px`,
                    height: `${opt.dotSize}px`,
                    background: isSelected
                      ? 'linear-gradient(135deg, #7c3aed, #ec4899)'
                      : '#1e1e2e',
                    boxShadow: isSelected ? `0 0 ${opt.dotSize / 2}px #7c3aed50` : 'none',
                    border: isSelected ? 'none' : '1px solid #3f3f46',
                  }}
                />
                <div className="text-center">
                  <p className="text-sm font-display uppercase tracking-wider text-zinc-100" style={{ letterSpacing: '0.08em' }}>
                    {opt.short}
                  </p>
                  <p className="text-xs text-zinc-500 mt-0.5">{opt.sub}</p>
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-lg mx-auto"
    >
      {/* XP-style progress bar */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={goBack}
            className="text-zinc-500 hover:text-purple-300 transition-colors cursor-pointer shrink-0"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="flex-1 flex gap-1.5">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className="h-1.5 flex-1 rounded-full overflow-hidden"
                style={{ background: '#1e1e2e' }}
              >
                <motion.div
                  className="h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: i <= step ? '100%' : '0%' }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  style={{
                    background: i <= step
                      ? 'linear-gradient(90deg, #7c3aed, #ec4899)'
                      : 'transparent',
                    boxShadow: i <= step ? '0 0 8px #7c3aed80' : 'none',
                  }}
                />
              </div>
            ))}
          </div>
          <span className="text-xs font-display text-zinc-600 shrink-0" style={{ letterSpacing: '0.1em' }}>
            {step + 1}/{TOTAL_STEPS}
          </span>
        </div>

        {/* Step labels */}
        <div className="flex ml-8 gap-1.5">
          {stepLabels.map((label, i) => (
            <div key={label} className="flex-1 text-center">
              <span
                className="text-[9px] font-display uppercase tracking-widest"
                style={{
                  color: i <= step ? '#a855f7' : '#3f3f46',
                  letterSpacing: '0.12em',
                }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Question content */}
      <div
        className="rounded-2xl p-6 mb-5 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #111118 0%, #0f0f1a 100%)',
          border: '1px solid #1e1e2e',
        }}
      >
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-purple-700 rounded-tl-xl" />
        <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-purple-700 rounded-br-xl" />

        <div className="overflow-hidden">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={step}
              custom={dir}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: 'easeInOut' }}
            >
              <div className="mb-6">
                <p className="text-[10px] font-display text-purple-400 uppercase tracking-[0.25em] mb-1">
                  Step {step + 1} of {TOTAL_STEPS}
                </p>
                <h2 className="text-2xl font-display uppercase tracking-wider text-zinc-100" style={{ letterSpacing: '0.08em' }}>
                  {q.title}
                </h2>
                <p className="text-sm text-zinc-500 mt-1">{q.sub}</p>
              </div>
              {q.content}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Next button */}
      <button
        onClick={goNext}
        disabled={!stepComplete}
        className="btn-game w-full rounded-xl py-4 text-sm flex items-center justify-center gap-2 cursor-pointer"
      >
        {step === TOTAL_STEPS - 1 ? 'Choose Style' : 'Next'}
        <ChevronRight size={16} />
      </button>
    </motion.div>
  );
}
