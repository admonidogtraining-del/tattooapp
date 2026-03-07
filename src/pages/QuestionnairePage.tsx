import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { SKIN_TONES } from '../constants';

export default function QuestionnairePage() {
  const navigate = useNavigate();
  const { questionnaire, setQuestionnaire } = useApp();

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/style');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-xl mx-auto mt-8"
    >
      <button
        onClick={() => navigate('/')}
        className="text-sm text-zinc-400 hover:text-zinc-200 flex items-center gap-2 mb-8 transition-colors"
      >
        <ChevronLeft size={16} /> Back
      </button>

      <div className="mb-8">
        <h2 className="text-3xl font-light tracking-tight mb-2">Quick Details</h2>
        <p className="text-sm text-zinc-400">
          A few inputs so the AI can tailor recommendations to you.
        </p>
      </div>

      <form onSubmit={handleContinue} className="space-y-8">
        {/* Gender */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-zinc-400 uppercase tracking-wider block">
            Gender
          </label>
          <div className="flex gap-3">
            {['Male', 'Female', 'Other'].map(g => (
              <button
                key={g}
                type="button"
                onClick={() => setQuestionnaire({ ...questionnaire, gender: g })}
                className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all ${
                  questionnaire.gender === g
                    ? 'bg-zinc-100 text-zinc-900 border-zinc-100'
                    : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Skin tone */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-zinc-400 uppercase tracking-wider block">
            Skin Tone
          </label>
          <div className="flex gap-5 flex-wrap">
            {SKIN_TONES.map((tone) => (
              <button
                key={tone.value}
                type="button"
                onClick={() => setQuestionnaire({ ...questionnaire, skinColor: tone.value })}
                className="flex flex-col items-center gap-2 group"
              >
                <div
                  className={`w-12 h-12 rounded-full transition-all ${
                    questionnaire.skinColor === tone.value
                      ? 'ring-2 ring-offset-2 ring-offset-zinc-950 ring-zinc-300 scale-110'
                      : 'opacity-70 hover:opacity-100 hover:scale-105'
                  }`}
                  style={{ backgroundColor: tone.color }}
                />
                <span className={`text-xs transition-colors ${questionnaire.skinColor === tone.value ? 'text-zinc-200' : 'text-zinc-500'}`}>
                  {tone.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Color preference */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-zinc-400 uppercase tracking-wider block">
            Color Preference
          </label>
          <div className="flex flex-col gap-2">
            {[
              { value: 'Black & Grey Only', desc: 'Timeless, works on all skin tones' },
              { value: 'Full Color', desc: 'Vibrant, painterly or traditional' },
              { value: 'Black with Color Accents', desc: 'Best of both' },
            ].map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setQuestionnaire({ ...questionnaire, colorPreference: opt.value })}
                className={`p-4 rounded-xl border text-left transition-all ${
                  questionnaire.colorPreference === opt.value
                    ? 'bg-zinc-800 border-zinc-500'
                    : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <p className="text-sm font-medium text-zinc-100">{opt.value}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Size */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-zinc-400 uppercase tracking-wider block">
            Size
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'Micro (Under 2 inches)', short: 'Micro' },
              { value: 'Small (2-4 inches)', short: 'Small' },
              { value: 'Medium (4-7 inches)', short: 'Medium' },
              { value: 'Large (7-12 inches)', short: 'Large' },
              { value: 'Extra Large (Full Sleeve/Back)', short: 'Extra Large' },
            ].map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setQuestionnaire({ ...questionnaire, size: opt.value })}
                className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all text-left ${
                  questionnaire.size === opt.value
                    ? 'bg-zinc-800 border-zinc-500 text-zinc-100'
                    : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                {opt.short}
                <span className="text-xs text-zinc-600 ml-1 font-normal hidden sm:inline">
                  {opt.value.slice(opt.short.length)}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-900">
          <button
            type="submit"
            disabled={!questionnaire.gender || !questionnaire.skinColor || !questionnaire.colorPreference || !questionnaire.size}
            className="w-full bg-zinc-100 text-zinc-950 rounded-xl py-4 text-base font-medium hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            Choose Style <ChevronRight size={16} />
          </button>
        </div>
      </form>
    </motion.div>
  );
}
