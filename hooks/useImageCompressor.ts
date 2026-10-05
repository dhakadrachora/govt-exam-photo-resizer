'use client';

import { useState, useCallback, useEffect } from 'react';

export interface CompressionOptions {
  targetWidth: number;
  targetHeight: number;
  maxKb: number;
  aspectMode?: 'exact' | 'contain';
  enhanceSignature?: boolean;
  isSignatureMode?: boolean;
  enableDop?: boolean;
  candidateName?: string;
  photoDate?: string;
  zoom?: number;
  panX?: number;
  panY?: number;
}

export interface CompressionResult {
  originalFile: File | null;
  originalUrl: string | null;
  originalDimensions: { width: number; height: number } | null;
  compressedBlob: Blob | null;
  compressedUrl: string | null;
  compressedDataUri: string | null;
  compressedDimensions: { width: number; height: number } | null;
  reductionPercent: number;
  isProcessing: boolean;
  progress: number;
  error: string | null;
  processImage: (file: File, options: CompressionOptions) => Promise<void>;
  reset: () => void;
  loadSample: (type: 'photo' | 'signature', options: CompressionOptions) => void;
}

export function useImageCompressor(): CompressionResult {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number } | null>(null);

  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
  const [compressedDataUri, setCompressedDataUri] = useState<string | null>(null);
  const [compressedDimensions, setCompressedDimensions] = useState<{ width: number; height: number } | null>(null);

  // Clean up object URLs on unmount or file reset
  useEffect(() => {
    return () => {
      if (originalUrl) URL.revokeObjectURL(originalUrl);
      if (compressedUrl) URL.revokeObjectURL(compressedUrl);
    };
  }, [originalUrl, compressedUrl]);

  const reset = useCallback(() => {
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (compressedUrl) URL.revokeObjectURL(compressedUrl);
    setOriginalFile(null);
    setOriginalUrl(null);
    setOriginalDimensions(null);
    setCompressedBlob(null);
    setCompressedUrl(null);
    setCompressedDataUri(null);
    setCompressedDimensions(null);
    setError(null);
    setIsProcessing(false);
    setProgress(0);
  }, [originalUrl, compressedUrl]);

  const toBlobPromise = (canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> => {
    return new Promise(resolve => {
      canvas.toBlob(blob => resolve(blob), 'image/jpeg', quality);
    });
  };

  const processImage = useCallback(
    async (file: File, options: CompressionOptions) => {
      try {
        setError(null);
        setIsProcessing(true);
        setProgress(15);

        const newOriginalUrl = URL.createObjectURL(file);
        setOriginalFile(file);
        setOriginalUrl(newOriginalUrl);

        const img = new Image();
        img.src = newOriginalUrl;

        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error('Failed to load image file.'));
        });

        const origW = img.naturalWidth;
        const origH = img.naturalHeight;
        setOriginalDimensions({ width: origW, height: origH });
        setProgress(35);

        const maxBytes = Math.max(5, options.maxKb) * 1024;
        let targetW = Math.max(50, options.targetWidth);
        let targetH = Math.max(40, options.targetHeight);
        const aspectMode = options.aspectMode || 'exact';

        // Offscreen Canvas
        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) throw new Error('HTML5 Canvas 2D context unavailable.');

        // Fill background with exam-standard pure white
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, targetW, targetH);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        let baseDrawW = targetW;
        let baseDrawH = targetH;
        let baseOffsetX = 0;
        let baseOffsetY = 0;

        if (aspectMode === 'contain') {
          const aspect = origW / origH;
          const targetAspect = targetW / targetH;
          if (aspect > targetAspect) {
            baseDrawW = targetW;
            baseDrawH = Math.round(targetW / aspect);
            baseOffsetY = Math.round((targetH - baseDrawH) / 2);
          } else {
            baseDrawH = targetH;
            baseDrawW = Math.round(targetH * aspect);
            baseOffsetX = Math.round((targetW - baseDrawW) / 2);
          }
        }

        // Apply interactive Zoom & Pan offsets
        const zoom = Math.max(1, options.zoom || 1);
        const panX = options.panX || 0;
        const panY = options.panY || 0;

        const scaledW = baseDrawW * zoom;
        const scaledH = baseDrawH * zoom;
        const finalDrawX = baseOffsetX - ((scaledW - baseDrawW) / 2) + (panX * (targetW / 100));
        const finalDrawY = baseOffsetY - ((scaledH - baseDrawH) / 2) + (panY * (targetH / 100));

        ctx.drawImage(img, finalDrawX, finalDrawY, scaledW, scaledH);
        setProgress(55);

        // Feature: Stamp Candidate Name & Date on Photo (DOP)
        if (!options.isSignatureMode && options.enableDop && (options.candidateName?.trim() || options.photoDate)) {
          const barHeight = Math.max(34, Math.round(targetH * 0.16));
          const barY = targetH - barHeight;

          // Solid white strip with dark hairline border line
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, barY, targetW, barHeight);
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(0, barY, targetW, 1.5);

          ctx.fillStyle = '#000000';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          const fontSize = Math.max(10, Math.round(barHeight * 0.34));
          ctx.font = `bold ${fontSize}px sans-serif`;

          const cName = options.candidateName?.trim().toUpperCase();
          const pDate = options.photoDate;

          if (cName && pDate) {
            ctx.fillText(cName, targetW / 2, barY + barHeight * 0.32);
            ctx.font = `600 ${Math.round(fontSize * 0.88)}px sans-serif`;
            ctx.fillText(`DOP: ${pDate}`, targetW / 2, barY + barHeight * 0.74);
          } else if (cName) {
            ctx.fillText(cName, targetW / 2, barY + barHeight * 0.5);
          } else if (pDate) {
            ctx.fillText(`DOP: ${pDate}`, targetW / 2, barY + barHeight * 0.5);
          }
        }

        // Feature: Clean & Enhance Signature Contrast
        if (options.isSignatureMode && options.enhanceSignature) {
          try {
            const imgData = ctx.getImageData(0, 0, targetW, targetH);
            const d = imgData.data;
            for (let i = 0; i < d.length; i += 4) {
              const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
              if (lum > 175) {
                d[i] = 255;
                d[i + 1] = 255;
                d[i + 2] = 255;
              } else {
                const dark = Math.max(0, lum * 0.68);
                d[i] = dark;
                d[i + 1] = dark;
                d[i + 2] = dark;
              }
            }
            ctx.putImageData(imgData, 0, 0);
          } catch (e) {
            console.warn('Canvas filter warning:', e);
          }
        }

        setProgress(75);

        // Iterative Binary Search Optimization Loop for JPEG Quality Factor
        let bestBlob: Blob | null = null;
        let low = 0.05;
        let high = 0.96;

        const initialProbe = await toBlobPromise(canvas, 0.92);
        if (initialProbe && initialProbe.size <= maxBytes) {
          bestBlob = initialProbe;
        } else {
          for (let iter = 0; iter < 10; iter++) {
            const mid = (low + high) / 2;
            const b = await toBlobPromise(canvas, mid);
            if (!b) break;

            if (b.size <= maxBytes) {
              bestBlob = b;
              low = mid + 0.02;
            } else {
              high = mid - 0.02;
            }
            if (high < low) break;
          }
        }

        let finalW = targetW;
        let finalH = targetH;

        // Downscale fallback if still exceeding ceiling
        if (!bestBlob || bestBlob.size > maxBytes) {
          let tempCanvas = canvas;
          const scaleDown = 0.92;
          for (let step = 0; step < 6; step++) {
            const nw = Math.max(80, Math.round(tempCanvas.width * scaleDown));
            const nh = Math.max(40, Math.round(tempCanvas.height * scaleDown));
            const sc = document.createElement('canvas');
            sc.width = nw;
            sc.height = nh;
            const sctx = sc.getContext('2d');
            if (sctx) {
              sctx.fillStyle = '#ffffff';
              sctx.fillRect(0, 0, nw, nh);
              sctx.imageSmoothingEnabled = true;
              sctx.imageSmoothingQuality = 'high';
              sctx.drawImage(tempCanvas, 0, 0, nw, nh);
              const b = await toBlobPromise(sc, 0.5);
              if (b && b.size <= maxBytes) {
                bestBlob = b;
                finalW = nw;
                finalH = nh;
                break;
              }
              tempCanvas = sc;
            }
          }
        }

        if (!bestBlob) {
          bestBlob = await toBlobPromise(canvas, 0.08);
        }

        setProgress(100);

        if (bestBlob) {
          const newCompUrl = URL.createObjectURL(bestBlob);
          const dataUri = canvas.toDataURL('image/jpeg', 0.85);
          setCompressedBlob(bestBlob);
          setCompressedUrl(newCompUrl);
          setCompressedDataUri(dataUri);
          setCompressedDimensions({ width: finalW, height: finalH });
        }
      } catch (err) {
        console.error('Compression error:', err);
        setError(err instanceof Error ? err.message : 'Error processing image.');
      } finally {
        setTimeout(() => setIsProcessing(false), 120);
      }
    },
    []
  );

  const loadSample = useCallback(
    (type: 'photo' | 'signature', options: CompressionOptions) => {
      const c = document.createElement('canvas');
      if (type === 'photo') {
        c.width = 600;
        c.height = 750;
        const ctx = c.getContext('2d')!;
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(0, 0, 600, 750);
        ctx.fillStyle = '#1e3a8a';
        ctx.beginPath();
        ctx.ellipse(300, 650, 240, 200, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(250, 480);
        ctx.lineTo(300, 560);
        ctx.lineTo(350, 480);
        ctx.fill();
        ctx.fillStyle = '#fcd34d';
        ctx.beginPath();
        ctx.ellipse(300, 310, 110, 140, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.ellipse(300, 220, 115, 60, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        c.width = 500;
        c.height = 200;
        const ctx = c.getContext('2d')!;
        ctx.fillStyle = '#f1f5f9';
        ctx.fillRect(0, 0, 500, 200);
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 4.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(60, 120);
        ctx.bezierCurveTo(90, 40, 120, 160, 160, 90);
        ctx.bezierCurveTo(200, 50, 230, 130, 280, 85);
        ctx.bezierCurveTo(320, 60, 360, 140, 440, 100);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(100, 145);
        ctx.lineTo(410, 145);
        ctx.stroke();
      }

      c.toBlob(blob => {
        if (blob) {
          const file = new File([blob], `sample_${type}.jpg`, { type: 'image/jpeg' });
          processImage(file, options);
        }
      }, 'image/jpeg', 0.95);
    },
    [processImage]
  );

  const reductionPercent =
    originalFile && compressedBlob
      ? Math.max(0, Math.round((1 - compressedBlob.size / originalFile.size) * 100))
      : 0;

  return {
    originalFile,
    originalUrl,
    originalDimensions,
    compressedBlob,
    compressedUrl,
    compressedDataUri,
    compressedDimensions,
    reductionPercent,
    isProcessing,
    progress,
    error,
    processImage,
    reset,
    loadSample
  };
}
