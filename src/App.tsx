import { BrowserRouter, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { PenTool, QrCode, X, Wifi } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { AppProvider, useApp } from './context/AppContext';
import InitialPage from './pages/InitialPage';
import QuestionnairePage from './pages/QuestionnairePage';
import StyleSelectionPage from './pages/StyleSelectionPage';
import ResultsPage from './pages/ResultsPage';
import AftercarePage from './pages/AftercarePage';
import TryOnModal from './components/TryOnModal';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function QRModal({ onClose }: { onClose: () => void }) {
  const isLocalhost =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';

  const defaultUrl = window.location.href;
  const [url, setUrl] = useState(defaultUrl);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.15 }}
        className="relative rounded-2xl p-7 flex flex-col items-center gap-5 max-w-sm w-full mx-4"
        style={{
          background: '#1a1a1a',
          border: '1px solid #2a2a2a',
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Wifi size={13} style={{ color: '#c9a870' }} />
            <p className="font-display text-sm font-medium text-[#e8e4de] tracking-wide">Open on Phone</p>
          </div>
          <button onClick={onClose} className="text-[#555] hover:text-[#e8e4de] transition-colors cursor-pointer">
            <X size={17} />
          </button>
        </div>

        <div className="bg-white p-4 rounded-xl">
          <QRCodeSVG value={url} size={180} />
        </div>

        {isLocalhost && (
          <div className="w-full p-3 rounded-xl text-xs text-amber-300 leading-relaxed"
            style={{ background: '#1a150a', border: '1px solid #4a3510' }}>
            <strong>Localhost detected.</strong> Replace with your <span className="font-mono text-amber-200">192.168.x.x:5173</span> address.
          </div>
        )}

        <div className="w-full space-y-1.5">
          <p className="label-overline">URL</p>
          <input
            type="text"
            value={url}
            onChange={e => setUrl(e.target.value)}
            className="w-full text-xs font-mono rounded-lg px-3 py-2 text-[#ccc] focus:outline-none transition-colors"
            style={{ background: '#141414', border: '1px solid #333' }}
          />
        </div>

        <p className="text-xs text-[#555] text-center leading-relaxed">
          Make sure your phone is on the same Wi-Fi, then scan.
        </p>
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
      <header
        className="sticky top-0 z-10 backdrop-blur-md"
        style={{
          background: 'rgba(18,18,18,0.92)',
          borderBottom: '1px solid #2a2a2a',
        }}
      >
        {/* Thin gold top line */}
        <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent 0%, #c9a870 40%, #c9a870 60%, transparent 100%)' }} />

        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={onLogoClick}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
              style={{ background: '#1f1a13', border: '1px solid #3a2e1a' }}
            >
              <PenTool size={15} style={{ color: '#c9a870' }} strokeWidth={2} />
            </div>
            <div>
              <h1
                className="font-display text-sm font-semibold text-[#e8e4de] uppercase leading-none group-hover:text-[#c9a870] transition-colors"
                style={{ letterSpacing: '0.1em' }}
              >
                InkSight <span style={{ color: '#c9a870' }}>AI</span>
              </h1>
              <p className="text-[10px] text-[#555] mt-0.5 uppercase tracking-[0.18em]">
                Tattoo Design Studio
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowQR(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[#666] hover:text-[#e8e4de] transition-all text-xs cursor-pointer uppercase tracking-wider"
            style={{ border: '1px solid #2a2a2a' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = '#444';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = '#2a2a2a';
            }}
            title="Open on phone"
          >
            <QrCode size={14} />
            <span className="hidden sm:inline">Phone</span>
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
      <main className="px-6 py-10">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<InitialPage />} />
            <Route path="/details" element={<QuestionnairePage />} />
            <Route path="/style" element={<StyleSelectionPage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/aftercare" element={<AftercarePage />} />
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
    <div
      className="min-h-screen selection:bg-[#2e2410] selection:text-[#f0ece4]"
      style={{ background: '#0a0a0a' }}
    >
      <div className="relative z-[1]">
        <BrowserRouter>
          <AppProvider>
            <AppRoutes />
          </AppProvider>
        </BrowserRouter>
      </div>
    </div>
  );
}
