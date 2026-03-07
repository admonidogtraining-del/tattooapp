import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useMotionValue, MotionValue } from 'motion/react';
import {
  generateTattooConsultation,
  generateTattooImage,
  TattooConsultation,
  QuestionnaireData,
} from '../services/geminiService';
import { buildStylePrompt, stylePreviewPublicUrl, TATTOO_STYLES } from '../constants';

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
  showTryOn: boolean;
  setShowTryOn: (v: boolean) => void;
  tattooScale: number;
  setTattooScale: React.Dispatch<React.SetStateAction<number>>;
  stylePreviewImages: Record<string, string>;
  tattooX: MotionValue<number>;
  tattooY: MotionValue<number>;
  fileInputRef: React.RefObject<HTMLInputElement>;

  // Actions
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeImage: (index: number) => void;
  handleSubmit: (isDiscoverySubmit?: boolean) => Promise<TattooConsultation>;
  handleDiscoveryAnswer: (question: string, answer: string) => void;
  handleReset: () => void;
  handleGenerateImage: () => Promise<void>;
  triggerAutoImageGeneration: (consultation: TattooConsultation) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [prompt, setPrompt] = useState('');
  const [images, setImages] = useState<{ data: string; mimeType: string; url: string }[]>([]);
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireData>({
    gender: '',
    weight: '5',
    bodyShape: '',
    skinColor: '',
    placement: '',
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
  const [showTryOn, setShowTryOn] = useState(false);
  const [tattooScale, setTattooScale] = useState(1);
  const [stylePreviewImages, setStylePreviewImages] = useState<Record<string, string>>({});

  const tattooX = useMotionValue(0);
  const tattooY = useMotionValue(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load style preview images on mount
  useEffect(() => {
    TATTOO_STYLES.forEach(style => {
      const url = stylePreviewPublicUrl(style.id);
      if (!url) return;
      fetch(url, { method: 'HEAD' })
        .then(r => {
          if (!r.ok) return;
          return fetch(url).then(r2 => r2.blob()).then(blob => new Promise<string>(resolve => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          }));
        })
        .then(dataUrl => {
          if (!dataUrl) return;
          setStylePreviewImages(prev => prev[style.id] ? prev : { ...prev, [style.id]: dataUrl });
        })
        .catch(() => {});
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const triggerAutoImageGeneration = (consultation: TattooConsultation) => {
    setIsGeneratingImage(true);
    generateTattooImage(
      buildStylePrompt(consultation.image_generation.dalle_prompt, questionnaire.style),
      stylePreviewImages[questionnaire.style]
    )
      .then(img => setGeneratedImage(img))
      .catch(err => console.error('Auto image generation failed:', err))
      .finally(() => setIsGeneratingImage(false));
  };

  const handleSubmit = async (isDiscoverySubmit = false) => {
    setError(null);
    let finalPrompt = prompt;
    if (isDiscoverySubmit) {
      const answersText = Object.entries(discoveryAnswers)
        .map(([q, a]) => `Q: ${q}\nA: ${a}`)
        .join('\n');
      finalPrompt += `\n\nClarifications:\n${answersText}`;
    }

    const consultation = await generateTattooConsultation(
      finalPrompt,
      images.map(img => ({ data: img.data, mimeType: img.mimeType })),
      questionnaire
    );

    setResult(consultation);
    return consultation;
  };

  const handleDiscoveryAnswer = (question: string, answer: string) => {
    setDiscoveryAnswers(prev => ({ ...prev, [question]: answer }));
  };

  const handleReset = () => {
    setPrompt('');
    setImages([]);
    setQuestionnaire({ gender: '', weight: '5', bodyShape: '', skinColor: '', placement: '', colorPreference: '', size: '', style: '' });
    setResult(null);
    setError(null);
    setGeneratedImage(null);
    setCustomImagePrompt('');
    setIsGeneratingImage(false);
    setDiscoveryAnswers({});
    setShowTryOn(false);
    setTattooScale(1);
    tattooX.set(0);
    tattooY.set(0);
  };

  const handleGenerateImage = async () => {
    if (!result) return;
    setIsGeneratingImage(true);
    setError(null);
    try {
      const promptToUse = customImagePrompt.trim() || buildStylePrompt(result.image_generation.dalle_prompt, questionnaire.style);
      const imageBase64 = await generateTattooImage(promptToUse, stylePreviewImages[questionnaire.style]);
      setGeneratedImage(imageBase64);
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
      showTryOn, setShowTryOn,
      tattooScale, setTattooScale,
      stylePreviewImages,
      tattooX, tattooY,
      fileInputRef,
      handleImageUpload,
      removeImage,
      handleSubmit,
      handleDiscoveryAnswer,
      handleReset,
      handleGenerateImage,
      triggerAutoImageGeneration,
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
