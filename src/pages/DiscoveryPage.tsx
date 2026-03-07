import { useNavigate, Navigate } from 'react-router-dom';
import { Sparkles, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';

export default function DiscoveryPage() {
  const navigate = useNavigate();
  const { result, discoveryAnswers, handleDiscoveryAnswer, handleSubmit, triggerAutoImageGeneration, setError, error } = useApp();

  if (!result?.discovery_questions) return <Navigate to="/" replace />;

  const allAnswered = Object.keys(discoveryAnswers).length === result.discovery_questions.length;

  const handleFinalize = async () => {
    navigate('/generating');
    try {
      const consultation = await handleSubmit(true);
      navigate('/results');
      triggerAutoImageGeneration(consultation);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to generate consultation. Please try again.';
      setError(message);
      navigate('/discovery');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-3xl mx-auto mt-8"
    >
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg mb-6">
          <AlertTriangle size={14} className="text-yellow-500" />
          <span className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
            Discovery Loop Triggered
          </span>
        </div>
        <h2 className="text-3xl font-light tracking-tight mb-2">Clarify Your Concept</h2>
        <p className="text-base text-zinc-400 leading-relaxed">
          Your prompt is a bit ambiguous. To give you the best technical blueprint, please clarify the following:
        </p>
      </div>

      <div className="space-y-8">
        {result.discovery_questions.map((q, idx) => (
          <div key={idx} className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6">
            <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4">
              {q.question}
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {q.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleDiscoveryAnswer(q.question, opt)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    discoveryAnswers[q.question] === opt
                      ? 'bg-zinc-800 border-zinc-500 text-zinc-100'
                      : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  <span className="text-base">{opt}</span>
                </button>
              ))}
            </div>
          </div>
        ))}

        <div className="pt-4 border-t border-zinc-900">
          <button
            onClick={handleFinalize}
            disabled={!allAnswered}
            className="w-full bg-zinc-100 text-zinc-950 rounded-xl py-4 px-4 text-base font-medium hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            <Sparkles size={16} />
            Finalize Blueprint
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-950/30 border border-red-900/50 rounded-xl text-red-400 text-sm flex items-start gap-3">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
