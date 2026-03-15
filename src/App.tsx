import { BrowserRouter, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { PenTool, QrCode, X, Wifi, Images, Copy, Check, Share2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { AppProvider, useApp } from './context/AppContext';
import { InksightLogo } from './components/InksightLogo';
import InitialPage from './pages/InitialPage';
import QuestionnairePage from './pages/QuestionnairePage';
import StyleSelectionPage from './pages/StyleSelectionPage';
import ResultsPage from './pages/ResultsPage';
import AftercarePage from './pages/AftercarePage';
import GalleryPage from './pages/GalleryPage';
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
  const [copied, setCopied] = useState(false);
  const canShare = typeof navigator.share === 'function';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: select the input
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({ title: 'Tattoo Design', url });
    } catch {
      // user cancelled or not supported
    }
  };

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
          <div className="flex gap-2">
            <input
              type="text"
              value={url}
              onChange={e => setUrl(e.target.value)}
              className="flex-1 min-w-0 text-xs font-mono rounded-lg px-3 py-2 text-[#ccc] focus:outline-none transition-colors"
              style={{ background: '#141414', border: '1px solid #333' }}
            />
            <button
              onClick={handleCopy}
              title="Copy link"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium shrink-0 cursor-pointer transition-all"
              style={{
                background: copied ? '#1a2a1a' : '#1a1a1a',
                border: copied ? '1px solid rgba(100,200,100,0.4)' : '1px solid #333',
                color: copied ? '#6dc96d' : '#c9a870',
              }}
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        <div className={`w-full grid gap-2 ${canShare ? 'grid-cols-2' : 'grid-cols-1'}`}>
          <button
            onClick={handleCopy}
            className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium cursor-pointer transition-all"
            style={{
              background: copied ? '#1a2a1a' : '#141414',
              border: copied ? '1px solid rgba(100,200,100,0.3)' : '1px solid #2a2a2a',
              color: copied ? '#6dc96d' : '#e8e4de',
            }}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Link copied!' : 'Copy link'}
          </button>
          {canShare && (
            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium cursor-pointer"
              style={{
                background: '#1a150a',
                border: '1px solid rgba(201,168,112,0.35)',
                color: '#c9a870',
              }}
            >
              <Share2 size={14} />
              Send to friend
            </button>
          )}
        </div>

        <p className="text-xs text-[#555] text-center leading-relaxed">
          Scan to open on phone, or share the link with a friend.
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
          background: 'rgba(6,6,6,0.94)',
          borderBottom: '1px solid #1a1a1a',
        }}
      >
        {/* Animated top line: purple → pink → gold */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          style={{
            height: '1px',
            background: 'linear-gradient(90deg, transparent 0%, #7B52C1 20%, #C05090 50%, #E84393 70%, #C9A870 88%, transparent 100%)',
            transformOrigin: 'center',
          }}
        />

        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <motion.div
            className="flex items-center gap-2.5 cursor-pointer group"
            onClick={onLogoClick}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <InksightLogo size={46} className="transition-opacity group-hover:opacity-85" />
            <div>
              <h1
                className="font-ink leading-none text-[#f0ece4]"
                style={{ fontSize: '20px', letterSpacing: '0.06em' }}
              >
                INKSIGHT <span style={{ color: '#C9A870' }}>AI</span>
              </h1>
              <p
                className="label-overline mt-0.5"
                style={{ color: '#7B52C1', letterSpacing: '0.18em', fontSize: '8px' }}
              >
                TATTOO DESIGN STUDIO
              </p>
            </div>
          </motion.div>

          <div className="flex items-center gap-2">
            <motion.button
              onClick={() => navigate('/gallery')}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.18, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-xs cursor-pointer uppercase tracking-wider"
              style={{ border: '1px solid #1e1e1e', color: '#555550' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,168,112,0.4)';
                (e.currentTarget as HTMLElement).style.color = '#f0ece4';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = '#1e1e1e';
                (e.currentTarget as HTMLElement).style.color = '#555550';
              }}
              title="View collection"
            >
              <Images size={13} />
              <span className="hidden sm:inline">Collection</span>
            </motion.button>

            <motion.button
              onClick={() => setShowQR(true)}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-xs cursor-pointer uppercase tracking-wider"
              style={{ border: '1px solid #1e1e1e', color: '#555550' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,168,112,0.4)';
                (e.currentTarget as HTMLElement).style.color = '#f0ece4';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = '#1e1e1e';
                (e.currentTarget as HTMLElement).style.color = '#555550';
              }}
              title="Open on phone"
            >
              <QrCode size={13} />
              <span className="hidden sm:inline">Phone</span>
            </motion.button>
          </div>
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
        <AnimatePresence mode="wait" initial={false}>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<InitialPage />} />
            <Route path="/details" element={<QuestionnairePage />} />
            <Route path="/style" element={<StyleSelectionPage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/aftercare" element={<AftercarePage />} />
            <Route path="/gallery" element={<GalleryPage />} />
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
