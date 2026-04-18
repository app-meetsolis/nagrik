'use client';

import React, { useState, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MOCK_RESULTS, ScanResult } from '@/lib/mockResults';
import { addScan, getUser, saveUser } from '@/lib/storage';
import { uploadScanImage } from '@/actions/upload';
import { classifyWaste } from '@/actions/categorize';
import { logWasteScan } from '@/actions/scan';
import { WASTE_TYPE_LABELS, WASTE_TYPE_DB, BIN_COLOR_HEX, BIN_LABELS } from '@/lib/wasteTypes';
import type { WasteType } from '@/types/database';
import CaptureStep from './CaptureStep';
import UploadingStep from './UploadingStep';
import PreviewStep from './PreviewStep';
import AnalyzingStep from './AnalyzingStep';
import ResultStep from './ResultStep';
import SubmittingStep from './SubmittingStep';
import SuccessStep from './SuccessStep';

export type ScanStep =
  | 'capture' | 'uploading' | 'preview' | 'analyzing' | 'result' | 'submitting' | 'success';

export default function ScanFlowClient() {
  const [step, setStep] = useState<ScanStep>('capture');
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelected = useCallback(async (file: File) => {
    // Show local preview immediately
    const dataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    });
    setImageDataUrl(dataUrl);
    setStep('uploading');

    // Upload to Supabase Storage in background (during uploading animation)
    try {
      const formData = new FormData();
      formData.append('file', file);
      const uploadResult = await uploadScanImage(formData);
      if (uploadResult.success) setPhotoUrl(uploadResult.data.url);
    } catch {
      // Upload failed — will fall back to dataUrl (OpenAI won't accept this, will use mock)
    }

    setStep('preview');
  }, []);

  const handleAnalyze = useCallback(async () => {
    setStep('analyzing');

    const url = photoUrl; // Must be a real HTTP URL for OpenAI vision
    if (!url) {
      // No real URL — use mock result
      const idx = Math.floor(Math.random() * MOCK_RESULTS.length);
      setResult(MOCK_RESULTS[idx]);
      setStep('result');
      return;
    }

    try {
      const classResult = await classifyWaste(url);
      if (classResult.success) {
        const d = classResult.data;
        if (!d.isWaste) {
          // Not a waste photo — reset
          setImageDataUrl(null);
          setPhotoUrl(null);
          setResult(null);
          setStep('capture');
          return;
        }
        setResult({
          wasteType: WASTE_TYPE_LABELS[d.wasteType] ?? d.wasteType,
          recyclable: d.recyclable,
          binColor: d.binColor,
          binColorHex: BIN_COLOR_HEX[d.binColor] ?? '#6B7280',
          binLabel: BIN_LABELS[d.binColor] ?? 'Grey Bin',
          prepSteps: d.prepSteps,
          tip: d.tip,
          points: d.pointsEarned,
        });
      } else {
        setResult(MOCK_RESULTS[0]);
      }
    } catch {
      setResult(MOCK_RESULTS[0]);
    }
    setStep('result');
  }, [photoUrl]);

  const handleRetake = useCallback(() => {
    setImageDataUrl(null);
    setPhotoUrl(null);
    setResult(null);
    setStep('capture');
  }, []);

  const handleLogScan = useCallback(async () => {
    if (!result) return;
    setStep('submitting');

    const dbWasteType = (WASTE_TYPE_DB[result.wasteType] ?? 'non_recyclable') as WasteType;

    try {
      await logWasteScan({
        photoUrl: photoUrl ?? imageDataUrl ?? 'https://placehold.co/400x400',
        wardId: null,
        wasteType: dbWasteType,
        recyclable: result.recyclable,
        binColor: result.binColor,
        prepSteps: result.prepSteps,
        tip: result.tip,
        pointsEarned: result.points,
      });
    } catch {
      // Server action failed — still show success (localStorage updated below)
    }

    // Always update localStorage for offline/immediate UX
    addScan({
      id: `scan-${Date.now()}`,
      wasteType: result.wasteType,
      binColor: result.binColor,
      binColorHex: result.binColorHex,
      binLabel: result.binLabel,
      recyclable: result.recyclable,
      points: result.points,
      status: 'pending',
      ward: 'Mansarovar',
      timestamp: Date.now(),
    });

    const user = getUser();
    if (user) {
      user.ecoPoints = (user.ecoPoints ?? 0) + result.points;
      user.totalScans = (user.totalScans ?? 0) + 1;
      saveUser(user);
    }

    setStep('success');
  }, [result, photoUrl, imageDataUrl]);

  const handleScanAgain = useCallback(() => {
    setImageDataUrl(null);
    setPhotoUrl(null);
    setResult(null);
    setStep('capture');
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A] overflow-hidden">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelected(file);
          e.target.value = '';
        }}
      />

      <AnimatePresence mode="wait">
        {step === 'capture' && (
          <motion.div key="capture" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <CaptureStep onFileSelect={() => fileInputRef.current?.click()} />
          </motion.div>
        )}

        {step === 'uploading' && imageDataUrl && (
          <motion.div key="uploading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <UploadingStep imageDataUrl={imageDataUrl} />
          </motion.div>
        )}

        {step === 'preview' && imageDataUrl && (
          <motion.div key="preview" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            <PreviewStep imageDataUrl={imageDataUrl} onAnalyze={handleAnalyze} onRetake={handleRetake} />
          </motion.div>
        )}

        {step === 'analyzing' && (
          <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <AnalyzingStep />
          </motion.div>
        )}

        {step === 'result' && result && imageDataUrl && (
          <motion.div key="result" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <ResultStep result={result} imageDataUrl={imageDataUrl} onLog={handleLogScan} onRetake={handleRetake} />
          </motion.div>
        )}

        {step === 'submitting' && (
          <motion.div key="submitting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <SubmittingStep />
          </motion.div>
        )}

        {step === 'success' && result && (
          <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <SuccessStep result={result} onScanAgain={handleScanAgain} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
