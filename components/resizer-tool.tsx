'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  PenTool,
  Upload,
  Download,
  RotateCcw,
  CheckCircle2,
  Calendar,
  User,
  Sparkles,
  Zap,
  Sliders,
  ZoomIn,
  ZoomOut,
  Copy,
  Check,
  Split,
  Columns,
  Layers,
  FileCheck2,
  Lock,
  ArrowDown,
  HardDrive
} from 'lucide-react';
import { useImageCompressor, CompressionOptions } from '@/hooks/useImageCompressor';

export interface PresetCard {
  id: string;
  name: string;
  agency: string;
  width: number;
  height: number;
  maxKb: number;
  dimensionsText: string;
  kbText: string;
  rules: string;
  aspectMode: 'exact' | 'contain';
}

const PRESET_TILES: { photo: PresetCard[]; signature: PresetCard[] } = {
  photo: [
    {
      id: 'ssc_photo',
      name: 'SSC CGL / CHSL / MTS',
      agency: 'Staff Selection Commission',
      width: 350,
      height: 450,
      maxKb: 50,
      dimensionsText: '3.5 × 4.5 cm (350×450 px)',
      kbText: '20 KB – 50 KB',
      rules: 'Light white background, straight face with ears visible. No cap/glasses.',
      aspectMode: 'exact'
    },
    {
      id: 'upsc_photo',
      name: 'UPSC Civil Services / OTR',
      agency: 'Union Public Service Commission',
      width: 350,
      height: 350,
      maxKb: 300,
      dimensionsText: '1:1 Square (350×350 px min)',
      kbText: '20 KB – 300 KB',
      rules: 'Recent photo (within 10 days of notification). Face must occupy 3/4th of area.',
      aspectMode: 'exact'
    },
    {
      id: 'ibps_photo',
      name: 'IBPS / SBI Bank PO & Clerk',
      agency: 'Banking Recruitment',
      width: 200,
      height: 230,
      maxKb: 50,
      dimensionsText: '4.5 × 3.5 cm (200×230 px)',
      kbText: '20 KB – 50 KB',
      rules: 'Standard passport format. Capital initials or dark backgrounds rejected.',
      aspectMode: 'exact'
    },
    {
      id: 'rrb_photo',
      name: 'Railway RRB (NTPC/ALP)',
      agency: 'Railway Recruitment Boards',
      width: 320,
      height: 400,
      maxKb: 70,
      dimensionsText: '35 × 45 mm (320×400 px)',
      kbText: '30 KB – 70 KB',
      rules: 'Color photo on plain light background without shadows or reflections.',
      aspectMode: 'exact'
    },
    {
      id: 'custom_photo',
      name: 'Custom Dimensions',
      agency: 'User Defined Configuration',
      width: 350,
      height: 450,
      maxKb: 50,
      dimensionsText: 'Custom px / ratio',
      kbText: 'Custom KB',
      rules: 'Enter your custom width, height, and target maximum file size in KB.',
      aspectMode: 'exact'
    }
  ],
  signature: [
    {
      id: 'ssc_sign',
      name: 'SSC Signature (4×2 cm)',
      agency: 'Staff Selection Commission',
      width: 140,
      height: 60,
      maxKb: 20,
      dimensionsText: '4.0 × 2.0 cm (140×60 px)',
      kbText: '10 KB – 20 KB',
      rules: 'Black or dark blue ink pen on clean unruled white paper. No ALL-CAPS.',
      aspectMode: 'exact'
    },
    {
      id: 'upsc_sign',
      name: 'UPSC CSE Signature',
      agency: 'Union Public Service Commission',
      width: 350,
      height: 350,
      maxKb: 300,
      dimensionsText: '1:1 Square (350×350 px)',
      kbText: '20 KB – 300 KB',
      rules: 'Clear legible signature. Running handwriting only on pure white surface.',
      aspectMode: 'exact'
    },
    {
      id: 'ibps_sign',
      name: 'IBPS / SBI Bank Signature',
      agency: 'Banking Recruitment',
      width: 140,
      height: 60,
      maxKb: 20,
      dimensionsText: '140 × 60 px',
      kbText: '10 KB – 20 KB',
      rules: 'Candidate signature in running script. Signatures in BLOCK letters rejected.',
      aspectMode: 'exact'
    },
    {
      id: 'rrb_sign',
      name: 'Railway RRB Signature',
      agency: 'Railway Recruitment Boards',
      width: 200,
      height: 100,
      maxKb: 70,
      dimensionsText: '200 × 100 px',
      kbText: '30 KB – 70 KB',
      rules: 'Black ink on white paper, strictly between 30 KB and 70 KB.',
      aspectMode: 'exact'
    },
    {
      id: 'custom_sign',
      name: 'Custom Dimensions',
      agency: 'User Defined Configuration',
      width: 140,
      height: 60,
      maxKb: 20,
      dimensionsText: 'Custom px / ratio',
      kbText: 'Custom KB',
      rules: 'Enter your custom width, height, and target maximum file size in KB.',
      aspectMode: 'exact'
    }
  ]
};

export function ResizerTool() {
  const [activeTab, setActiveTab] = useState<'photo' | 'signature'>('photo');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('ssc_photo');
  const [maxKb, setMaxKb] = useState<number>(50);
  const [customWidth, setCustomWidth] = useState<number>(350);
  const [customHeight, setCustomHeight] = useState<number>(450);
  const [aspectMode, setAspectMode] = useState<'exact' | 'contain'>('exact');

  // Zoom & Pan Crop adjustments
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);
  const [showCropAdjuster, setShowCropAdjuster] = useState<boolean>(false);

  // Before vs After Split Slider
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [comparisonView, setComparisonView] = useState<'split' | 'side-by-side'>('split');
  const [inspectorZoom, setInspectorZoom] = useState<number>(1);
  const [isDraggingSlider, setIsDraggingSlider] = useState<boolean>(false);
  const sliderContainerRef = useRef<HTMLDivElement | null>(null);

  // Signature contrast booster
  const [enhanceContrast, setEnhanceContrast] = useState<boolean>(true);

  // Date & Name on Photo (DOP)
  const [enableDop, setEnableDop] = useState<boolean>(false);
  const [candidateName, setCandidateName] = useState<string>('');
  const [photoDate, setPhotoDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [copiedDataUri, setCopiedDataUri] = useState<boolean>(false);
  const [savedDeviceToast, setSavedDeviceToast] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const {
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
  } = useImageCompressor();

  const currentPresets = PRESET_TILES[activeTab];
  const currentPreset = currentPresets.find(p => p.id === selectedPresetId) || currentPresets[0];

  const getOptions = useCallback((): CompressionOptions => ({
    targetWidth: customWidth,
    targetHeight: customHeight,
    maxKb,
    aspectMode,
    isSignatureMode: activeTab === 'signature',
    enhanceSignature: enhanceContrast,
    enableDop,
    candidateName,
    photoDate,
    zoom: zoomLevel,
    panX,
    panY
  }), [
    customWidth,
    customHeight,
    maxKb,
    aspectMode,
    activeTab,
    enhanceContrast,
    enableDop,
    candidateName,
    photoDate,
    zoomLevel,
    panX,
    panY
  ]);

  const handleTabSwitch = (tab: 'photo' | 'signature') => {
    setActiveTab(tab);
    const defaultPreset = tab === 'photo' ? PRESET_TILES.photo[0] : PRESET_TILES.signature[0];
    setSelectedPresetId(defaultPreset.id);
    setMaxKb(defaultPreset.maxKb);
    setCustomWidth(defaultPreset.width);
    setCustomHeight(defaultPreset.height);
    setAspectMode(defaultPreset.aspectMode);
    setZoomLevel(1.0);
    setPanX(0);
    setPanY(0);
  };

  const handlePresetSelect = (preset: PresetCard) => {
    setSelectedPresetId(preset.id);
    setMaxKb(preset.maxKb);
    setCustomWidth(preset.width);
    setCustomHeight(preset.height);
    setAspectMode(preset.aspectMode);
  };

  const handleFileDrop = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPG, PNG, WEBP, BMP).');
      return;
    }
    setZoomLevel(1.0);
    setPanX(0);
    setPanY(0);
    processImage(file, getOptions());
  };

  // Re-run compression when settings change if file is loaded
  useEffect(() => {
    if (originalFile && !isProcessing) {
      const timer = setTimeout(() => {
        processImage(originalFile, getOptions());
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [originalFile, isProcessing, processImage, getOptions]);

  // Handle Dragging on Comparison Split Slider
  const handleSliderMove = useCallback((clientX: number) => {
    if (!sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    const offsetX = clientX - rect.left;
    const pos = Math.max(0, Math.min(100, (offsetX / rect.width) * 100));
    setSliderPosition(pos);
  }, []);

  const handleMouseDown = () => setIsDraggingSlider(true);

  useEffect(() => {
    const handleMouseUp = () => setIsDraggingSlider(false);
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingSlider) handleSliderMove(e.clientX);
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (isDraggingSlider && e.touches[0]) handleSliderMove(e.touches[0].clientX);
    };

    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchend', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove);

    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isDraggingSlider, handleSliderMove]);

  const copyDataUri = async () => {
    if (!compressedDataUri) return;
    try {
      await navigator.clipboard.writeText(compressedDataUri);
      setCopiedDataUri(true);
      setTimeout(() => setCopiedDataUri(false), 2200);
    } catch {
      alert('Could not copy to clipboard.');
    }
  };

  const saveToDevice = async () => {
    if (!compressedBlob) return;
    const fileName = `${selectedPresetId}_${Math.round(compressedBlob.size / 1024)}kb.jpg`;

    // Support Web Share API on mobile devices
    if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [new File([compressedBlob], fileName, { type: 'image/jpeg' })] })) {
      try {
        await navigator.share({
          files: [new File([compressedBlob], fileName, { type: 'image/jpeg' })],
          title: 'Govt Exam Resized File',
          text: `Official resized image for ${currentPreset.name}`
        });
        setSavedDeviceToast(true);
        setTimeout(() => setSavedDeviceToast(false), 2500);
        return;
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
      }
    }

    // Direct automated download trigger
    const link = document.createElement('a');
    link.href = compressedUrl || '#';
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setSavedDeviceToast(true);
    setTimeout(() => setSavedDeviceToast(false), 2500);
  };

  const formatFileSize = (bytes: number): string => {
    return (bytes / 1024).toFixed(1) + ' KB';
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xl shadow-slate-900/5 overflow-hidden transition-all">
      
      {/* HEADER SECTION WITH LINEAR TABS */}
      <div className="border-b border-slate-200 bg-slate-50/70 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-600"></span>
            Govt Exam Image Optimizer Engine
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Strict 100% Client-Side In-Memory Processing &bull; No Server Uploads
          </p>
        </div>

        {/* TABS: PHOTO VS SIGNATURE */}
        <div className="flex bg-slate-200/80 p-1 rounded-xl gap-1 shrink-0">
          <button
            type="button"
            onClick={() => handleTabSwitch('photo')}
            className={`flex items-center gap-2 py-1.5 px-4 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'photo'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Camera className="h-3.5 w-3.5 text-blue-600" />
            <span>Passport Photo</span>
          </button>
          <button
            type="button"
            onClick={() => handleTabSwitch('signature')}
            className={`flex items-center gap-2 py-1.5 px-4 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'signature'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PenTool className="h-3.5 w-3.5 text-blue-600" />
            <span>Signature</span>
          </button>
        </div>
      </div>

      <div className="p-5 sm:p-7 space-y-6">
        
        {/* ONE-CLICK PRESET TILES GRID (LINEAR STYLE) */}
        <div>
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2.5">
            Select Official Exam Preset
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {currentPresets.map(preset => {
              const isSelected = preset.id === selectedPresetId;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handlePresetSelect(preset)}
                  className={`text-left p-3 rounded-xl border transition-all relative flex flex-col justify-between ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/50 shadow-sm ring-2 ring-blue-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 text-blue-600">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </div>
                  )}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                      {preset.agency}
                    </span>
                    <h3 className="text-xs font-bold text-slate-900 line-clamp-1">
                      {preset.name}
                    </h3>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-600">
                    <span>{preset.kbText}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* ACTIVE PRESET OFFICIAL NOTIFICATION GUIDELINE BANNER */}
          <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5">
            <FileCheck2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600 flex-1">
              <span className="font-bold text-slate-800">{currentPreset.name}:</span>{' '}
              {currentPreset.rules}{' '}
              <span className="font-mono text-blue-700 font-semibold">({currentPreset.dimensionsText})</span>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Strict Ceiling</span>
              <span className="text-xs font-extrabold font-mono text-emerald-700">&le; {maxKb} KB</span>
            </div>
          </div>
        </div>

        {/* CUSTOM CONFIGURATION DRAWER (SHOWN WHEN CUSTOM PRESET IS SELECTED) */}
        {selectedPresetId.includes('custom') && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Target Width (px)</label>
              <input
                type="number"
                value={customWidth}
                onChange={e => setCustomWidth(Number(e.target.value))}
                className="w-full h-9 px-3 border border-slate-300 rounded-lg text-xs font-mono bg-white"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Target Height (px)</label>
              <input
                type="number"
                value={customHeight}
                onChange={e => setCustomHeight(Number(e.target.value))}
                className="w-full h-9 px-3 border border-slate-300 rounded-lg text-xs font-mono bg-white"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Max KB Limit</label>
              <input
                type="number"
                value={maxKb}
                onChange={e => setMaxKb(Number(e.target.value))}
                className="w-full h-9 px-3 border border-slate-300 rounded-lg text-xs font-mono bg-white"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Fitting Mode</label>
              <select
                value={aspectMode}
                onChange={e => setAspectMode(e.target.value as 'exact' | 'contain')}
                className="w-full h-9 px-3 border border-slate-300 rounded-lg text-xs bg-white"
              >
                <option value="exact">Exact Stretch</option>
                <option value="contain">Fit (Keep Ratio)</option>
              </select>
            </div>
          </div>
        )}

        {/* DATE & NAME ON PHOTO (DOP) TOGGLE */}
        {activeTab === 'photo' && (
          <div className="p-3.5 bg-slate-50/80 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Calendar className="h-4 w-4 text-blue-600" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Add Candidate Name &amp; Date on Photo (DOP)</h4>
                  <p className="text-[11px] text-slate-500">
                    Mandatory for SSC, PEB, State Police &amp; Recruitment Boards to prevent application rejection.
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={enableDop}
                  onChange={e => setEnableDop(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {enableDop && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Candidate Name (Optional)
                  </label>
                  <div className="relative">
                    <User className="h-3.5 w-3.5 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      placeholder="e.g. ROHIT SHARMA"
                      value={candidateName}
                      onChange={e => setCandidateName(e.target.value)}
                      className="w-full h-9 pl-9 pr-3 text-xs uppercase font-semibold bg-white border border-slate-300 rounded-lg outline-none focus:border-blue-600"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Date of Photograph (DOP)
                  </label>
                  <input
                    type="date"
                    value={photoDate}
                    onChange={e => setPhotoDate(e.target.value)}
                    className="w-full h-9 px-3 text-xs font-semibold bg-white border border-slate-300 rounded-lg outline-none focus:border-blue-600"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* SIGNATURE CONTRAST ENHANCER */}
        {activeTab === 'signature' && (
          <div className="flex items-center justify-between p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 text-white rounded-lg">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Clean &amp; Enhance Signature Contrast</h4>
                <p className="text-[11px] text-slate-600">
                  Whitens gray camera shadows and darkens ink strokes for clear OCR verification.
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={enhanceContrast}
                onChange={e => setEnhanceContrast(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        )}

        {/* NATIVE OS-STYLE DROPZONE */}
        {!originalFile && !isProcessing && (
          <div
            onDragOver={e => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={e => {
              e.preventDefault();
              setIsDragging(false);
            }}
            onDrop={e => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                handleFileDrop(e.dataTransfer.files[0]);
              }
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[220px] relative ${
              isDragging
                ? 'border-blue-600 bg-blue-50/70 scale-[1.01] ring-4 ring-blue-500/20 shadow-inner'
                : 'border-slate-300/80 bg-slate-50/50 hover:border-blue-500 hover:bg-blue-50/20'
            }`}
          >
            <div className="h-14 w-14 rounded-2xl bg-white border border-slate-200 shadow-sm text-blue-600 flex items-center justify-center mb-4 transition-transform group-hover:scale-105">
              <Upload className="h-6 w-6" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1">
              Drag &amp; Drop {activeTab === 'photo' ? 'Passport Photo' : 'Signature'} here, or browse
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Supports JPEG, JPG, PNG, WEBP &bull; Max 25 MB file size
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold shadow-sm pointer-events-none">
                <Upload className="h-3.5 w-3.5" />
                Select File
              </span>
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  loadSample(activeTab, getOptions());
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 transition"
              >
                <Zap className="h-3.5 w-3.5 text-amber-500" />
                Try Sample {activeTab === 'photo' ? 'Photo' : 'Signature'}
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={e => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFileDrop(e.target.files[0]);
                }
              }}
              className="hidden"
            />
          </div>
        )}

        {/* PROCESSING LOADER */}
        {isProcessing && (
          <div className="py-14 px-6 text-center bg-slate-50/80 rounded-2xl border border-slate-200">
            <div className="h-10 w-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <h4 className="text-sm font-bold text-slate-900 mb-1">Optimizing &amp; Quantizing Matrix...</h4>
            <p className="text-xs text-slate-500 mb-4">
              Iteratively tuning DCT tables to guarantee &le; {maxKb} KB with maximum facial sharpness
            </p>
            <div className="w-full max-w-xs bg-slate-200 h-2 rounded-full mx-auto overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-200"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* CROP & ZOOM TOOLBAR (BEFORE EXPORT) */}
        {originalFile && !isProcessing && (
          <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/90">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowCropAdjuster(!showCropAdjuster)}
                className="flex items-center gap-2 text-xs font-bold text-slate-800 hover:text-blue-600 transition"
              >
                <Sliders className="h-3.5 w-3.5 text-blue-600" />
                <span>Fine-Tune Zoom &amp; Pan Offsets</span>
                <span className="text-[10px] font-mono text-slate-400">({zoomLevel.toFixed(1)}x)</span>
              </button>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setZoomLevel(prev => Math.max(1, +(prev - 0.1).toFixed(1)))}
                  className="p-1 rounded bg-white border border-slate-200 text-slate-600 hover:text-slate-900"
                  title="Zoom Out"
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoomLevel(prev => Math.min(2.5, +(prev + 0.1).toFixed(1)))}
                  className="p-1 rounded bg-white border border-slate-200 text-slate-600 hover:text-slate-900"
                  title="Zoom In"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </button>
                {(zoomLevel !== 1 || panX !== 0 || panY !== 0) && (
                  <button
                    type="button"
                    onClick={() => {
                      setZoomLevel(1);
                      setPanX(0);
                      setPanY(0);
                    }}
                    className="text-[10px] text-blue-600 font-bold ml-1 hover:underline"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {showCropAdjuster && (
              <div className="mt-3 pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">
                    Zoom Level ({zoomLevel.toFixed(1)}x)
                  </label>
                  <input
                    type="range"
                    min="1.0"
                    max="2.5"
                    step="0.05"
                    value={zoomLevel}
                    onChange={e => setZoomLevel(parseFloat(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">
                    Horizontal Pan ({panX}%)
                  </label>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    step="2"
                    value={panX}
                    onChange={e => setPanX(parseInt(e.target.value, 10))}
                    className="w-full accent-blue-600"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">
                    Vertical Pan ({panY}%)
                  </label>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    step="2"
                    value={panY}
                    onChange={e => setPanY(parseInt(e.target.value, 10))}
                    className="w-full accent-blue-600"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* RESULTS: LIVE BEFORE VS AFTER COMPARISON VIEW */}
        {originalFile && compressedBlob && !isProcessing && (
          <div className="space-y-6">
            
            {/* COMPARISON CONTROLS */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">Visual Quality Inspector</span>
                <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-semibold">
                  &darr; {reductionPercent}% Saved ({formatFileSize(compressedBlob.size)})
                </span>
              </div>

              {/* CONTROLS: ZOOM & VIEW TOGGLES */}
              <div className="flex items-center gap-2">
                {/* Real-time Facial Detail Zoom */}
                <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold">
                  <span className="text-slate-400 px-1.5 text-[10px] font-mono">Zoom</span>
                  {[1, 1.5, 2].map(z => (
                    <button
                      key={z}
                      type="button"
                      onClick={() => setInspectorZoom(z)}
                      className={`px-2 py-0.5 rounded text-[11px] transition ${
                        inspectorZoom === z ? 'bg-white text-blue-600 font-bold shadow-xs' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {z}x
                    </button>
                  ))}
                </div>

                {/* Split vs Side-by-Side */}
                <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setComparisonView('split')}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition ${
                      comparisonView === 'split' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Split className="h-3 w-3" />
                    <span>Split Slider</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setComparisonView('side-by-side')}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition ${
                      comparisonView === 'side-by-side' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Columns className="h-3 w-3" />
                    <span>Side-by-Side</span>
                  </button>
                </div>
              </div>
            </div>

            {/* SPLIT SLIDER VIEW */}
            {comparisonView === 'split' && (
              <div className="space-y-2">
                <div
                  ref={sliderContainerRef}
                  onMouseDown={handleMouseDown}
                  onTouchStart={handleMouseDown}
                  className="relative w-full h-[320px] sm:h-[380px] bg-slate-900 rounded-xl overflow-hidden cursor-ew-resize select-none border border-slate-300"
                >
                  {/* BASE LAYER: COMPRESSED (AFTER) */}
                  <div className="absolute inset-0 flex items-center justify-center p-4">
                    {compressedUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={compressedUrl}
                        alt="Compressed Output"
                        style={{ transform: `scale(${inspectorZoom})`, transition: 'transform 0.15s ease-out' }}
                        className="max-h-full max-w-full object-contain pointer-events-none"
                      />
                    )}
                  </div>
                  <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur text-white text-[10px] font-mono px-2 py-1 rounded shadow">
                    Compressed ({formatFileSize(compressedBlob.size)})
                  </div>

                  {/* TOP CLIPPED LAYER: ORIGINAL (BEFORE) */}
                  <div
                    className="absolute inset-0 flex items-center justify-center p-4 overflow-hidden border-r border-white/80"
                    style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                  >
                    {originalUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={originalUrl}
                        alt="Original Upload"
                        style={{ transform: `scale(${inspectorZoom})`, transition: 'transform 0.15s ease-out' }}
                        className="max-h-full max-w-full object-contain pointer-events-none"
                      />
                    )}
                  </div>
                  <div
                    className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur text-white text-[10px] font-mono px-2 py-1 rounded shadow"
                    style={{ opacity: sliderPosition > 15 ? 1 : 0 }}
                  >
                    Original ({formatFileSize(originalFile.size)})
                  </div>

                  {/* DIVIDER HANDLE */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-white shadow-2xl pointer-events-none"
                    style={{ left: `${sliderPosition}%` }}
                  >
                    <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-8 w-8 rounded-full bg-white text-slate-800 shadow-xl flex items-center justify-center text-xs font-bold border border-slate-300">
                      &harr;
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-center text-slate-400">
                  Drag the slider horizontally to compare facial sharpness and ink clarity. Use Zoom buttons above to inspect eyes/ears up to 2x.
                </p>
              </div>
            )}

            {/* SIDE-BY-SIDE VIEW */}
            {comparisonView === 'side-by-side' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 flex flex-col items-center">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Original Source
                  </span>
                  <div className="w-full h-48 bg-white border border-slate-200 rounded-lg p-2 flex items-center justify-center overflow-hidden mb-3">
                    {originalUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={originalUrl}
                        alt="Original"
                        style={{ transform: `scale(${inspectorZoom})`, transition: 'transform 0.15s ease-out' }}
                        className="max-h-full max-w-full object-contain"
                      />
                    )}
                  </div>
                  <div className="w-full text-xs space-y-1 pt-2 border-t border-slate-200">
                    <div className="flex justify-between">
                      <span className="text-slate-500">File Size:</span>
                      <span className="font-semibold font-mono text-slate-800">{formatFileSize(originalFile.size)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Dimensions:</span>
                      <span className="font-semibold font-mono text-slate-800">
                        {originalDimensions?.width} &times; {originalDimensions?.height} px
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border border-emerald-300 rounded-xl p-4 bg-emerald-50/30 flex flex-col items-center">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 mb-2">
                    Exam-Ready Output
                  </span>
                  <div className="w-full h-48 bg-white border border-emerald-200 rounded-lg p-2 flex items-center justify-center overflow-hidden mb-3">
                    {compressedUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={compressedUrl}
                        alt="Compressed"
                        style={{ transform: `scale(${inspectorZoom})`, transition: 'transform 0.15s ease-out' }}
                        className="max-h-full max-w-full object-contain"
                      />
                    )}
                  </div>
                  <div className="w-full text-xs space-y-1 pt-2 border-t border-emerald-200">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Resulting Size:</span>
                      <span className="font-bold font-mono text-emerald-700 text-sm">{formatFileSize(compressedBlob.size)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Dimensions:</span>
                      <span className="font-semibold font-mono text-slate-800">
                        {compressedDimensions?.width} &times; {compressedDimensions?.height} px
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* HIGH-CONTRAST EMERALD GREEN DOWNLOAD BUTTON & EXPORT ACTIONS */}
            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <a
                href={compressedUrl || '#'}
                download={`${selectedPresetId}_${Math.round(compressedBlob.size / 1024)}kb.jpg`}
                className="flex-1 inline-flex items-center justify-center gap-2.5 h-12 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-700/20 transition-all group"
              >
                <ArrowDown className="h-5 w-5 transition-transform group-hover:translate-y-0.5 animate-bounce" />
                <span>Download Resized JPG ({formatFileSize(compressedBlob.size)})</span>
              </a>

              <button
                type="button"
                onClick={saveToDevice}
                className="inline-flex items-center justify-center gap-2 h-12 px-4 bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-bold text-xs rounded-xl shadow-sm transition"
                title="Save directly to Device (Mobile Share or Instant Download)"
              >
                {savedDeviceToast ? <Check className="h-4 w-4 text-emerald-400" /> : <HardDrive className="h-4 w-4 text-blue-400" />}
                <span>{savedDeviceToast ? 'Saved!' : 'Save to Device'}</span>
              </button>

              <button
                type="button"
                onClick={copyDataUri}
                className="inline-flex items-center justify-center gap-2 h-12 px-3.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-sm transition"
                title="Copy Base64 Data URI"
              >
                {copiedDataUri ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                <span>{copiedDataUri ? 'Copied URI!' : 'Copy Data URI'}</span>
              </button>

              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center justify-center gap-2 h-12 px-3.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Resize Another</span>
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
