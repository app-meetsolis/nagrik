'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';
import { MOCK_RESULTS, ScanResult } from '@/lib/mockResults';
import { addScan, getUser, saveUser } from '@/lib/storage';
import { uploadScanImage } from '@/actions/upload';
import { classifyWaste } from '@/actions/categorize';
import { logWasteScan } from '@/actions/scan';
import { WASTE_TYPE_LABELS, WASTE_TYPE_DB, BIN_COLOR_HEX, BIN_LABELS } from '@/lib/wasteTypes';
import type { WasteType } from '@/types/database';
import {
  getStreakBefore, saveStreakBefore, clearStreakBefore,
  getLastLocation, saveLastLocation, haversineMeters,
  incrementStreak, getStreakCount,
} from '@/lib/streak';
import CaptureStep from './CaptureStep';
import UploadingStep from './UploadingStep';
import PreviewStep from './PreviewStep';
import AnalyzingStep from './AnalyzingStep';
import ResultStep from './ResultStep';
import SubmittingStep from './SubmittingStep';
import SuccessStep from './SuccessStep';
import StreakBeforeDoneStep from './StreakBeforeDoneStep';

export type ScanStep =
  | 'capture' | 'uploading' | 'preview' | 'analyzing' | 'result'
  | 'submitting' | 'success' | 'streak_before_done';

// Resize to max 1024px and re-encode as JPEG ~0.85 quality.
// Keeps base64 payload well under the 5 MB server-action body limit.
function resizeDataUrl(dataUrl: string, maxPx = 1024, quality = 0.85): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width  = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(dataUrl); return; }
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

export default function ScanFlowClient() {
  const [step, setStep] = useState<ScanStep>('capture');
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [streakMode, setStreakMode] = useState(false);
  const [streakPhase, setStreakPhase] = useState<'before' | 'after'>('before');
  const [streakBonus, setStreakBonus] = useState(false);
  const [streakCount, setStreakCount] = useState(0);
  const currentLocation = useRef<{ lat: number; lng: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Resume pending streak if user left mid-flow
    const before = getStreakBefore();
    if (before) {
      setStreakMode(true);
      setStreakPhase('after');
    }
    setStreakCount(getStreakCount());

    // Try to capture location silently
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          currentLocation.current = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        },
        () => { /* denied — skip location checks */ },
        { timeout: 5000 }
      );
    }
  }, []);

  const handleFileSelected = useCallback(async (file: File) => {
    // Same-location fraud check: warn if < 100m from last scan
    const loc = currentLocation.current;
    if (loc) {
      const last = getLastLocation();
      if (last) {
        const dist = haversineMeters(loc.lat, loc.lng, last.lat, last.lng);
        if (dist < 100) {
          console.warn(`[Nagrik] Location too close to last scan: ${dist.toFixed(0)}m — flagged for review`);
        }
      }
    }

    const rawDataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    });

    // Resize client-side so the base64 fallback stays under the 5 MB server-action limit
    const dataUrl = await resizeDataUrl(rawDataUrl);
    setImageDataUrl(dataUrl);
    setStep('uploading');

    try {
      const formData = new FormData();
      formData.append('file', file);
      const uploadResult = await uploadScanImage(formData);
      if (uploadResult.success) setPhotoUrl(uploadResult.data.url);
    } catch {
      // Upload failed — fall back to dataUrl
    }

    setStep('preview');
  }, []);

  const handleAnalyze = useCallback(async () => {
    setStep('analyzing');

    // Use the uploaded public URL if available, otherwise fall back to the
    // client-side resized base64 dataUrl. Both are accepted by OpenAI vision.
    const imageSource = photoUrl ?? imageDataUrl;

    if (!imageSource) {
      // Nothing to analyse — this should never happen in practice
      toast.error('No image found. Please retake the photo.');
      setStep('capture');
      return;
    }

    try {
      const classResult = await classifyWaste(imageSource);

      if (!classResult.success) {
        toast.error('Analysis failed. Please try again.');
        setStep('preview');
        return;
      }

      const d = classResult.data;

      if (!d.isWaste) {
        setImageDataUrl(null);
        setPhotoUrl(null);
        setResult(null);
        const msg = d.reason ? `That looks like ${d.reason}` : 'That doesn\'t look like waste';
        toast.warning(`${msg}. Please scan a waste item.`, { duration: 4000 });
        setStep('capture');
        return;
      }

      setResult({
        wasteType:   WASTE_TYPE_LABELS[d.wasteType] ?? d.wasteType,
        recyclable:  d.recyclable,
        binColor:    d.binColor,
        binColorHex: BIN_COLOR_HEX[d.binColor] ?? '#6B7280',
        binLabel:    BIN_LABELS[d.binColor] ?? 'Grey Bin',
        prepSteps:   d.prepSteps,
        tip:         d.tip,
        points:      d.pointsEarned,
      });
      setStep('result');
    } catch {
      toast.error('Network error. Please check your connection and try again.');
      setStep('preview');
    }
  }, [photoUrl, imageDataUrl]);

  const handleRetake = useCallback(() => {
    setImageDataUrl(null);
    setPhotoUrl(null);
    setResult(null);
    setStep('capture');
  }, []);

  const handleLogScan = useCallback(async () => {
    if (!result) return;
    setStep('submitting');

    const isStreakAfter = streakMode && streakPhase === 'after';
    const finalPoints = isStreakAfter ? result.points * 3 : result.points;
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
        pointsEarned: finalPoints,
      });
    } catch {
      // Server action failed — localStorage updated below
    }

    addScan({
      id: `scan-${Date.now()}`,
      wasteType: result.wasteType,
      binColor: result.binColor,
      binColorHex: result.binColorHex,
      binLabel: result.binLabel,
      recyclable: result.recyclable,
      points: finalPoints,
      status: 'pending',
      ward: 'Mansarovar',
      timestamp: Date.now(),
    });

    const user = getUser();
    if (user) {
      user.ecoPoints = (user.ecoPoints ?? 0) + finalPoints;
      user.totalScans = (user.totalScans ?? 0) + 1;
      saveUser(user);
    }

    if (currentLocation.current) {
      saveLastLocation(currentLocation.current.lat, currentLocation.current.lng);
    }

    if (streakMode && streakPhase === 'before') {
      saveStreakBefore({
        beforeTimestamp: Date.now(),
        beforeLat: currentLocation.current?.lat ?? null,
        beforeLng: currentLocation.current?.lng ?? null,
      });
      setStep('streak_before_done');
    } else {
      if (isStreakAfter) {
        clearStreakBefore();
        const newCount = incrementStreak();
        setStreakCount(newCount);
        setStreakBonus(true);
      }
      setStep('success');
    }
  }, [result, photoUrl, imageDataUrl, streakMode, streakPhase]);

  const handleStartAfterPhoto = useCallback(() => {
    setStreakPhase('after');
    setImageDataUrl(null);
    setPhotoUrl(null);
    setResult(null);
    setStep('capture');
  }, []);

  const handleToggleStreak = useCallback(() => {
    setStreakMode((prev) => !prev);
  }, []);

  const handleScanAgain = useCallback(() => {
    setImageDataUrl(null);
    setPhotoUrl(null);
    setResult(null);
    setStreakBonus(false);
    setStreakPhase('before');
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
            <CaptureStep
              onFileSelect={() => fileInputRef.current?.click()}
              streakMode={streakMode}
              streakPhase={streakPhase}
              onToggleStreak={handleToggleStreak}
            />
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
            <AnalyzingStep streakMode={streakMode} streakPhase={streakPhase} />
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

        {step === 'streak_before_done' && (
          <motion.div key="streak_before_done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <StreakBeforeDoneStep onStartAfterPhoto={handleStartAfterPhoto} />
          </motion.div>
        )}

        {step === 'success' && result && (
          <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <SuccessStep
              result={result}
              onScanAgain={handleScanAgain}
              streakBonus={streakBonus}
              streakCount={streakCount}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
