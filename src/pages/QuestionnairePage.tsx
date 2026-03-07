import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { BODY_SHAPES, SKIN_TONES } from '../constants';

export default function QuestionnairePage() {
  const navigate = useNavigate();
  const { questionnaire, setQuestionnaire, error } = useApp();

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/style');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-3xl mx-auto mt-8"
    >
      <button
        onClick={() => navigate('/')}
        className="text-sm text-zinc-400 hover:text-zinc-200 flex items-center gap-2 mb-8 transition-colors"
      >
        <ChevronLeft size={16} /> Back
      </button>

      <div className="mb-8">
        <h2 className="text-3xl font-light tracking-tight mb-2">Technical Specifications</h2>
        <p className="text-sm text-zinc-400 leading-relaxed">
          To give the absolute best technical foundation for editing and generating tattoos,
          we need to move beyond "vibes". Please provide the mechanical constraints.
        </p>
      </div>

      <form onSubmit={handleContinue} className="space-y-8">
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3 block">
              Gender
            </label>
            <select
              required
              value={questionnaire.gender}
              onChange={(e) => setQuestionnaire({ ...questionnaire, gender: e.target.value })}
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-base text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-500"
            >
              <option value="" disabled>Select...</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other / Prefer not to say</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3 flex justify-between">
              <span>Body Weight Scale</span>
              <span>{questionnaire.weight}/10</span>
            </label>
            <input
              type="range" min="1" max="10"
              value={questionnaire.weight}
              onChange={(e) => setQuestionnaire({ ...questionnaire, weight: e.target.value })}
              className="w-full accent-zinc-500 mt-4"
            />
            <div className="flex justify-between text-sm font-medium text-zinc-400 uppercase tracking-wider mt-2">
              <span>Very Slim</span>
              <span>Average</span>
              <span>Heavy</span>
            </div>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3 block">
              Body Shape
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {BODY_SHAPES.map((shape) => (
                <div
                  key={shape.id}
                  onClick={() => setQuestionnaire({ ...questionnaire, bodyShape: shape.id })}
                  className={`cursor-pointer p-4 rounded-xl border transition-all ${
                    questionnaire.bodyShape === shape.id
                      ? 'bg-zinc-800 border-zinc-500'
                      : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <p className="text-base text-zinc-100 mb-1">{shape.name}</p>
                  <p className="text-sm text-zinc-400">{shape.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3 block">
              Skin Color (Melanin)
            </label>
            <div className="flex gap-4 flex-wrap">
              {SKIN_TONES.map((tone) => (
                <button
                  key={tone.value}
                  type="button"
                  onClick={() => setQuestionnaire({ ...questionnaire, skinColor: tone.value })}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div
                    className={`w-11 h-11 rounded-full transition-all ${
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

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3 block">
              Placement
            </label>
            <input
              required
              type="text"
              placeholder="e.g., Inner Forearm, Upper Back, Ribs..."
              value={questionnaire.placement}
              onChange={(e) => setQuestionnaire({ ...questionnaire, placement: e.target.value })}
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-base text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-500 placeholder:text-zinc-600"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3 block">
              Color Preference
            </label>
            <select
              required
              value={questionnaire.colorPreference}
              onChange={(e) => setQuestionnaire({ ...questionnaire, colorPreference: e.target.value })}
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-base text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-500"
            >
              <option value="" disabled>Select...</option>
              <option value="Black & Grey Only">Black & Grey Only</option>
              <option value="Full Color">Full Color</option>
              <option value="Black with Color Accents">Black with Color Accents</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3 block">
              Size
            </label>
            <select
              required
              value={questionnaire.size}
              onChange={(e) => setQuestionnaire({ ...questionnaire, size: e.target.value })}
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-base text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-500"
            >
              <option value="" disabled>Select...</option>
              <option value="Micro (Under 2 inches)">Micro (Under 2 inches)</option>
              <option value="Small (2-4 inches)">Small (2-4 inches)</option>
              <option value="Medium (4-7 inches)">Medium (4-7 inches)</option>
              <option value="Large (7-12 inches)">Large (7-12 inches)</option>
              <option value="Extra Large (Full Sleeve/Back)">Extra Large (Full Sleeve/Back)</option>
            </select>
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-900">
          <button
            type="submit"
            disabled={!questionnaire.bodyShape || !questionnaire.skinColor}
            className="w-full bg-zinc-100 text-zinc-950 rounded-xl py-4 px-4 text-base font-medium hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            Continue to Style Selection <ChevronRight size={16} />
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-950/30 border border-red-900/50 rounded-xl text-red-400 text-sm flex items-start gap-3">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}
      </form>
    </motion.div>
  );
}
