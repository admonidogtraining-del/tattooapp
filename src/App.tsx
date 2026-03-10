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
        className="relative rounded-2xl p-8 flex flex-col items-center gap-5 max-w-sm w-full mx-4"
        style={{
          background: 'linear-gradient(135deg, #111118 0%, #0f0f1a 100%)',
          border: '1px solid #7c3aed80',
          boxShadow: '0 0 40px #7c3aed30, 0 20px 60px #00000080',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-purple-500 rounded-tl-lg" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-purple-500 rounded-br-lg" />

        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Wifi size={14} className="text-purple-400" />
            <p className="text-sm font-semibold text-zinc-100 font-display tracking-wider uppercase">Open on Phone</p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-200 transition-colors cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <div className="bg-white p-4 rounded-xl" style={{ boxShadow: '0 0 20px #a855f760' }}>
          <QRCodeSVG value={url} size={180} />
        </div>

        {isLocalhost && (
          <div className="w-full p-3 rounded-xl text-xs text-amber-300 bg-amber-950/40 border border-amber-800/50 leading-relaxed">
            <strong>Localhost detected.</strong> Replace the URL below with your <span className="font-mono text-amber-200">192.168.x.x:5173</span> address from the <code>npm run dev</code> terminal output.
          </div>
        )}

        <div className="w-full space-y-1.5">
          <p className="text-xs text-zinc-500 uppercase tracking-widest font-display">URL</p>
          <input
            type="text"
            value={url}
            onChange={e => setUrl(e.target.value)}
            className="w-full text-xs font-mono bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-200 focus:outline-none focus:border-purple-600 transition-colors"
          />
        </div>

        <p className="text-xs text-zinc-600 text-center leading-relaxed">
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
          background: 'linear-gradient(180deg, #09090b 0%, #09090be0 100%)',
          borderBottom: '1px solid #1e1e2e',
          boxShadow: '0 0 30px #7c3aed15',
        }}
      >
        {/* Top neon line */}
        <div style={{ height: '2px', background: 'linear-gradient(90deg, transparent 0%, #7c3aed 30%, #ec4899 60%, transparent 100%)' }} />

        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={onLogoClick}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center transition-all group-hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
                boxShadow: '0 0 16px #7c3aed60',
              }}
            >
              <PenTool size={18} className="text-white stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-base font-display tracking-widest text-zinc-100 uppercase leading-none group-hover:text-purple-300 transition-colors" style={{ letterSpacing: '0.12em' }}>
                InkSight <span className="text-purple-400">AI</span>
                <span
                  className="ml-2 text-[10px] px-1.5 py-0.5 rounded font-bold align-middle"
                  style={{ background: '#7c3aed', color: '#fff', letterSpacing: '0.05em' }}
                >
                  NEW
                </span>
              </h1>
              <p className="text-[10px] text-zinc-600 mt-0.5 uppercase tracking-[0.2em]">
                Art Director &amp; Prompt Architect
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowQR(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-zinc-400 hover:text-purple-300 transition-all text-xs font-medium cursor-pointer uppercase tracking-wider"
            style={{ border: '1px solid #1e1e2e' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = '#7c3aed60';
              (e.currentTarget as HTMLElement).style.background = '#7c3aed10';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = '#1e1e2e';
              (e.currentTarget as HTMLElement).style.background = 'transparent';
            }}
            title="Open on phone"
          >
            <QrCode size={15} />
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
      className="min-h-screen text-slate-200 selection:bg-purple-900 selection:text-purple-100"
      style={{ background: '#09090b' }}
    >
      {/* Subtle grid background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(124,58,237,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(124,58,237,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          zIndex: 0,
        }}
      />
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
