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

  const questions = [
    {
      title: 'What\'s your skin tone?',
      sub: 'Helps the AI recommend colors that look great on you.',
      content: (
        <div className="flex justify-center gap-5 flex-wrap">
          {SKIN_TONES.map((tone) => (
            <button
              key={tone.value}
              type="button"
              onClick={() => { setQuestionnaire({ ...questionnaire, skinColor: tone.value }); }}
              className="flex flex-col items-center gap-3 group"
            >
              <div
                className={`w-16 h-16 rounded-full transition-all ${
                  questionnaire.skinColor === tone.value
                    ? 'ring-4 ring-offset-4 ring-offset-zinc-950 ring-zinc-200 scale-110'
                    : 'opacity-60 hover:opacity-100 hover:scale-105'
                }`}
                style={{ backgroundColor: tone.color }}
              />
              <span className={`text-sm font-medium transition-colors ${questionnaire.skinColor === tone.value ? 'text-zinc-100' : 'text-zinc-500'}`}>
                {tone.label}
              </span>
            </button>
          ))}
        </div>
      ),
    },
    {
      title: 'Color or black & grey?',
      sub: 'This shapes the entire palette of your tattoo.',
      content: (
        <div className="flex flex-col gap-3">
          {[
            { value: 'Black & Grey Only', emoji: '◾', desc: 'Timeless, works on all skin tones' },
            { value: 'Full Color', emoji: '🎨', desc: 'Vibrant, painterly or traditional' },
            { value: 'Black with Color Accents', emoji: '✦', desc: 'Best of both worlds' },
          ].map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { setQuestionnaire({ ...questionnaire, colorPreference: opt.value }); }}
              className={`w-full p-5 rounded-2xl border-2 text-left transition-all flex items-center gap-4 ${
                questionnaire.colorPreference === opt.value
                  ? 'bg-zinc-800 border-zinc-400'
                  : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <span className="text-2xl">{opt.emoji}</span>
              <div>
                <p className="text-base font-semibold text-zinc-100">{opt.value}</p>
                <p className="text-sm text-zinc-500 mt-0.5">{opt.desc}</p>
              </div>
            </button>
          ))}
        </div>
      ),
    },
    {
      title: 'How big should it be?',
      sub: 'Size affects detail, placement options, and healing.',
      content: (
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: 'Micro (Under 2 inches)', short: 'Micro', sub: 'Under 2 inches', size: 'w-7 h-7' },
            { value: 'Small (2-4 inches)', short: 'Small', sub: '2–4 inches', size: 'w-9 h-9' },
            { value: 'Medium (4-7 inches)', short: 'Medium', sub: '4–7 inches', size: 'w-11 h-11' },
            { value: 'Large (7-12 inches)', short: 'Large', sub: '7–12 inches', size: 'w-14 h-14' },
            { value: 'Extra Large (Full Sleeve/Back)', short: 'XL', sub: 'Full Sleeve / Back', size: 'w-16 h-16' },
          ].map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { setQuestionnaire({ ...questionnaire, size: opt.value }); }}
              className={`p-4 rounded-2xl border-2 text-left transition-all flex flex-col items-center gap-2 ${
                questionnaire.size === opt.value
                  ? 'bg-zinc-800 border-zinc-400'
                  : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div className={`${opt.size} rounded-full border-2 ${
                questionnaire.size === opt.value ? 'border-zinc-200 bg-zinc-600' : 'border-zinc-600 bg-zinc-800'
              } transition-all`} />
              <p className="text-sm font-semibold text-zinc-100">{opt.short}</p>
              <p className="text-xs text-zinc-500">{opt.sub}</p>
            </button>
          ))}
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
      className="max-w-lg mx-auto mt-8"
    >
      {/* Progress bar */}
      <div className="flex items-center gap-2 mb-8">
        <button
          onClick={goBack}
          className="text-sm text-zinc-400 hover:text-zinc-200 flex items-center gap-1 transition-colors shrink-0"
        >
          <ChevronLeft size={16} />
        </button>
        <div className="flex-1 flex gap-1.5">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                i <= step ? 'bg-zinc-200' : 'bg-zinc-800'
              }`}
            />
          ))}
        </div>
        <span className="text-xs text-zinc-500 shrink-0">{step + 1} / {TOTAL_STEPS}</span>
      </div>

      {/* Question content */}
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
            <div className="mb-8">
              <h2 className="text-3xl font-light tracking-tight mb-2">{q.title}</h2>
              <p className="text-sm text-zinc-400">{q.sub}</p>
            </div>
            {q.content}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Next button */}
      <div className="mt-8">
        <button
          onClick={goNext}
          disabled={!stepComplete}
          className="w-full bg-zinc-100 text-zinc-950 rounded-xl py-4 text-base font-medium hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {step === TOTAL_STEPS - 1 ? 'Choose Style' : 'Next'}
          <ChevronRight size={16} />
        </button>
      </div>
    </motion.div>
  );
}
