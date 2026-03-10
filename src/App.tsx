import { BrowserRouter, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { PenTool, QrCode, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { AppProvider, useApp } from './context/AppContext';
import InitialPage from './pages/InitialPage';
import QuestionnairePage from './pages/QuestionnairePage';
import StyleSelectionPage from './pages/StyleSelectionPage';
import ResultsPage from './pages/ResultsPage';
import TryOnModal from './components/TryOnModal';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function QRModal({ onClose }: { onClose: () => void }) {
  const url = window.location.href;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.15 }}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 flex flex-col items-center gap-5 max-w-xs w-full mx-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between w-full">
          <p className="text-sm font-semibold text-zinc-100">Open on your phone</p>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-200 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="bg-white p-4 rounded-xl">
          <QRCodeSVG value={url} size={180} />
        </div>
        <p className="text-xs text-zinc-500 text-center leading-relaxed">
          Make sure your phone is on the <br />same Wi-Fi network, then scan.
        </p>
        <p className="text-xs text-zinc-600 break-all text-center font-mono">{url}</p>
      </motion.div>
    </div>
  );
}

function Header() {
  const { handleReset } = useApp();
  const navigate = useNavigate();
  const [showQR, setShowQR] = useState(false);

  const onLogoClick = () => {
    handleReset();
    navigate('/');
  };

  return (
    <>
      <header className="border-b border-zinc-900 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={onLogoClick}
          >
            <div className="w-8 h-8 rounded-full bg-zinc-100 text-zinc-950 flex items-center justify-center">
              <PenTool size={18} className="stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight leading-none">InkSight AI <span className="text-xs bg-emerald-500 text-black px-1.5 py-0.5 rounded font-bold ml-1">NEW</span></h1>
              <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest">
                Art Director & Prompt Architect
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowQR(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-all text-xs font-medium"
            title="Open on phone"
          >
            <QrCode size={16} />
            <span className="hidden sm:inline">Open on Phone</span>
          </button>
        </div>
      </header>
      <AnimatePresence>
        {showQR && <QRModal onClose={() => setShowQR(false)} />}
      </AnimatePresence>
    </>
  );
}

function AppRoutes() {
  const location = useLocation();
  return (
    <>
      <ScrollToTop />
      <Header />
      <main className="px-6 py-12">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<InitialPage />} />
            <Route path="/details" element={<QuestionnairePage />} />
            <Route path="/style" element={<StyleSelectionPage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </main>
      <TryOnModal />
    </>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 selection:bg-zinc-800 selection:text-zinc-50">
      <BrowserRouter>
        <AppProvider>
          <AppRoutes />
        </AppProvider>
      </BrowserRouter>
    </div>
  );
}
