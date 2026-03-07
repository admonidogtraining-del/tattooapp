import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PenTool } from 'lucide-react';

const MESSAGES = [
  'Consulting the Art Director...',
  'Mapping your symbolic metaphors...',
  'Analyzing body mechanics & placement...',
  'Building your technical brief...',
  'Crafting visual generation prompts...',
  'Finalizing your blueprint...',
];

export default function GeneratingPage() {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex(i => (i + 1) % MESSAGES.length);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-md mx-auto mt-32 flex flex-col items-center justify-center space-y-10"
    >
      {/* Spinner */}
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 border-2 border-zinc-800 rounded-full" />
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-zinc-300"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <PenTool size={22} className="text-zinc-400" />
        </div>
      </div>

      {/* Cycling messages */}
      <div className="text-center h-14 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={msgIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className="text-base font-medium text-zinc-300"
          >
            {MESSAGES[msgIndex]}
          </motion.p>
        </AnimatePresence>
        <p className="text-xs text-zinc-600 uppercase tracking-widest mt-3">
          InkSight AI · Processing
        </p>
      </div>

      {/* Progress dots */}
      <div className="flex gap-2">
        {MESSAGES.map((_, i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full"
            animate={{ backgroundColor: i === msgIndex ? '#a1a1aa' : '#27272a' }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
    </motion.div>
  );
}
