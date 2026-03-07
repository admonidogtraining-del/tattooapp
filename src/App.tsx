import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { PenTool } from 'lucide-react';
import { AppProvider, useApp } from './context/AppContext';
import InitialPage from './pages/InitialPage';
import QuestionnairePage from './pages/QuestionnairePage';
import StyleSelectionPage from './pages/StyleSelectionPage';
import GeneratingPage from './pages/GeneratingPage';
import DiscoveryPage from './pages/DiscoveryPage';
import ResultsPage from './pages/ResultsPage';
import TryOnModal from './components/TryOnModal';

function Header() {
  const { handleReset } = useApp();
  const navigate = useNavigate();

  const onLogoClick = () => {
    handleReset();
    navigate('/');
  };

  return (
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
            <h1 className="text-lg font-semibold tracking-tight leading-none">InkSight AI</h1>
            <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest">
              Art Director & Prompt Architect
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

function AppRoutes() {
  const location = useLocation();
  return (
    <>
      <Header />
      <main className="px-6 py-12">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<InitialPage />} />
            <Route path="/details" element={<QuestionnairePage />} />
            <Route path="/style" element={<StyleSelectionPage />} />
            <Route path="/generating" element={<GeneratingPage />} />
            <Route path="/discovery" element={<DiscoveryPage />} />
            <Route path="/results" element={<ResultsPage />} />
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
