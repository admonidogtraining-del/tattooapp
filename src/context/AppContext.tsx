import React, { createContext, useContext, useState, useRef } from 'react';
import { useMotionValue, MotionValue } from 'motion/react';
import {
  generateTattooConsultation,
  generateTattooImage,
  TattooConsultation,
  QuestionnaireData,
} from '../services/geminiService';
import { buildStylePrompt } from '../constants';

interface AppContextValue {
  // State
  prompt: string;
  setPrompt: (v: string) => void;
  images: { data: string; mimeType: string; url: string }[];
  questionnaire: QuestionnaireData;
  setQuestionnaire: React.Dispatch<React.SetStateAction<QuestionnaireData>>;
  discoveryAnswers: Record<string, string>;
  result: TattooConsultation | null;
  error: string | null;
  setError: (v: string | null) => void;
  generatedImage: string | null;
  setGeneratedImage: (v: string | null) => void;
  customImagePrompt: string;
  setCustomImagePrompt: (v: string) => void;
  isGeneratingImage: boolean;
  isConsulting: boolean;
  showTryOn: boolean;
  setShowTryOn: (v: boolean) => void;
  tattooScale: number;
  setTattooScale: React.Dispatch<React.SetStateAction<number>>;
  tattooX: MotionValue<number>;
  tattooY: MotionValue<number>;
  fileInputRef: React.RefObject<HTMLInputElement>;

  // Actions
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeImage: (index: number) => void;
  /** Start image generation + consultation in parallel. Navigate to /results immediately. */
  startParallelGeneration: () => void;
  handleDiscoveryAnswer: (question: string, answer: string) => void;
  handleReset: () => void;
  handleGenerateImage: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [prompt, setPrompt] = useState('');
  const [images, setImages] = useState<{ data: string; mimeType: string; url: string }[]>([]);
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireData>({
    skinColor: '',
    colorPreference: '',
    size: '',
    style: '',
  });
  const [discoveryAnswers, setDiscoveryAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<TattooConsultation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [customImagePrompt, setCustomImagePrompt] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isConsulting, setIsConsulting] = useState(false);
  const [showTryOn, setShowTryOn] = useState(false);
  const [tattooScale, setTattooScale] = useState(1);

  const tattooX = useMotionValue(0);
  const tattooY = useMotionValue(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length === 0) return;
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        setImages(prev => [...prev, { data: base64Data, mimeType: file.type, url: URL.createObjectURL(file) }]);
      };
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  /**
   * Start image generation and consultation in parallel.
   * Image gen starts immediately from the user prompt + style (no consultation needed).
   * Consultation runs in background and fills in supplementary data.
   */
  const startParallelGeneration = () => {
    setIsGeneratingImage(true);
    setIsConsulting(true);
    setGeneratedImage(null);
    setResult(null);
    setError(null);

    // Snapshot current values immediately (avoids stale closure issues)
    const currentPrompt = prompt;
    const currentStyle = questionnaire.style;
    const currentImages = images;
    const currentQuestionnaire = questionnaire;

    // ── Image generation: starts IMMEDIATELY from the user's prompt + style ──
    generateTattooImage(
      buildStylePrompt(
        customImagePrompt.trim() || currentPrompt,
        currentStyle
      )
    )
      .then(img => setGeneratedImage(img))
      .catch(err => {
        console.error('Image generation failed:', err);
        setError(err instanceof Error ? err.message : 'Image generation failed.');
      })
      .finally(() => setIsGeneratingImage(false));

    // ── Consultation: runs in parallel for supplementary design data ──
    generateTattooConsultation(
      currentPrompt,
      currentImages.map(img => ({ data: img.data, mimeType: img.mimeType })),
      currentQuestionnaire
    )
      .then(consultation => setResult(consultation))
      .catch(err => console.error('Consultation failed:', err))
      .finally(() => setIsConsulting(false));
  };

  const handleDiscoveryAnswer = (question: string, answer: string) => {
    setDiscoveryAnswers(prev => ({ ...prev, [question]: answer }));
  };

  const handleReset = () => {
    setPrompt('');
    setImages([]);
    setQuestionnaire({ skinColor: '', colorPreference: '', size: '', style: '' });
    setResult(null);
    setError(null);
    setGeneratedImage(null);
    setCustomImagePrompt('');
    setIsGeneratingImage(false);
    setIsConsulting(false);
    setDiscoveryAnswers({});
    setShowTryOn(false);
    setTattooScale(1);
    tattooX.set(0);
    tattooY.set(0);
  };

  const handleGenerateImage = async () => {
    if (!result && !prompt) return;
    setIsGeneratingImage(true);
    setError(null);
    try {
      const basePrompt = result?.image_generation.dalle_prompt ?? prompt;
      const promptToUse = customImagePrompt.trim() || buildStylePrompt(basePrompt, questionnaire.style);
      const img = await generateTattooImage(promptToUse);
      setGeneratedImage(img);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to generate image. Please try again.';
      setError(message);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <AppContext.Provider value={{
      prompt, setPrompt,
      images,
      questionnaire, setQuestionnaire,
      discoveryAnswers,
      result,
      error, setError,
      generatedImage, setGeneratedImage,
      customImagePrompt, setCustomImagePrompt,
      isGeneratingImage,
      isConsulting,
      showTryOn, setShowTryOn,
      tattooScale, setTattooScale,
      tattooX, tattooY,
      fileInputRef,
      handleImageUpload,
      removeImage,
      startParallelGeneration,
      handleDiscoveryAnswer,
      handleReset,
      handleGenerateImage,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
