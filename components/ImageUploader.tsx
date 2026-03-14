
import React, { useState, useRef, useCallback } from 'react';
import UploadIcon from './icons/UploadIcon';
import CropIcon from './icons/CropIcon';
import MagicIcon from './icons/MagicIcon';
import CloseIcon from './icons/CloseIcon';
import Cropper from 'react-easy-crop';
import getCroppedImg, { dataURLtoFile } from '../utils/canvasUtils';
import * as geminiService from '../services/geminiService';
import Spinner from './Spinner';

interface ImageUploaderProps {
  id: string;
  title: string;
  onImageUpload: (file: File) => void;
  disabled: boolean;
  isOptional?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ id, title, onImageUpload, disabled, isOptional = false }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit/Crop State
  const [showCropModal, setShowCropModal] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  
  // AI Edit State
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [isAiCropMode, setIsAiCropMode] = useState(false); // New state to track if we are cropping for AI
  const [aiObjectDescription, setAiObjectDescription] = useState(''); // User defined object focus

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setOriginalFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      onImageUpload(file);
    }
  };

  const handleAreaClick = () => {
    if (!disabled && !previewUrl) {
      fileInputRef.current?.click();
    }
  };
  
  const handleRemoveImage = (e: React.MouseEvent) => {
      e.stopPropagation();
      setPreviewUrl(null);
      setOriginalFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSaveCrop = async () => {
      if (originalFile && previewUrl && croppedAreaPixels) {
          try {
              // 1. Generate the cropped image based on user selection
              const croppedImageBase64 = await getCroppedImg(previewUrl, croppedAreaPixels);
              
              if (croppedImageBase64) {
                  const croppedFile = dataURLtoFile(croppedImageBase64, `crop-${originalFile.name}`);

                  if (isAiCropMode) {
                      // 2a. If in AI Mode, send this cropped file to Gemini WITH description
                      if (!aiObjectDescription.trim()) {
                          alert("Mohon isi deskripsi objek yang ingin difokuskan.");
                          return;
                      }
                      setShowCropModal(false); // Close modal first
                      await performAiCleanse(croppedFile, aiObjectDescription);
                  } else {
                      // 2b. If Normal Crop, just update the preview
                      setPreviewUrl(croppedImageBase64);
                      onImageUpload(croppedFile);
                      setShowCropModal(false);
                  }
              }
          } catch (e) {
              console.error(e);
              setShowCropModal(false);
          }
      } else {
          setShowCropModal(false);
      }
      setIsAiCropMode(false); // Reset mode
  };

  const handleAiCleanseClick = () => {
      if (!originalFile) return;
      // Open crop modal first to let user define the product area
      setIsAiCropMode(true);
      setAiObjectDescription(''); // Reset description
      setShowCropModal(true);
      setZoom(1); // Reset zoom
  };

  const performAiCleanse = async (fileToProcess: File, description: string) => {
      setIsAiProcessing(true);
      try {
          // Call Gemini Service with the CROPPED file and DESCRIPTION
          const processedImageBase64 = await geminiService.editImageFocusProduct(fileToProcess, description);
          setPreviewUrl(processedImageBase64);
          const newFile = dataURLtoFile(processedImageBase64, `cleaned-${originalFile?.name || 'image'}`);
          onImageUpload(newFile);
      } catch (e) {
          console.error("AI Cleanse Failed:", e);
          alert("Gagal memproses gambar dengan AI. Coba lagi.");
      } finally {
          setIsAiProcessing(false);
      }
  };

  const handleCancelCrop = () => {
      setShowCropModal(false);
      setIsAiCropMode(false);
      setAiObjectDescription('');
  };

  return (
    <div className="w-full mb-4">
      <h3 className="text-sm font-semibold text-gray-600 mb-2 flex items-center justify-between">
        <span>
            {title}
            {isOptional && <span className="text-xs text-gray-500 ml-2">(Opsional)</span>}
        </span>
        {previewUrl && !disabled && (
            <div className="flex gap-2">
                 {(id.includes('product')) && (
                     <button
                        onClick={handleAiCleanseClick}
                        disabled={isAiProcessing}
                        className="text-[10px] flex items-center gap-1 text-purple-600 hover:text-purple-800 font-bold px-2 py-1 bg-purple-50 rounded-full border border-purple-200 uppercase tracking-tighter"
                        title="Crop dulu, lalu AI akan memfokuskan produk"
                     >
                         {isAiProcessing ? <Spinner /> : <MagicIcon className="w-3 h-3" />}
                         {isAiProcessing ? 'Proses...' : 'AI Fokus'}
                     </button>
                 )}
                 <button
                    onClick={() => { setShowCropModal(true); setIsAiCropMode(false); }}
                    className="text-[10px] flex items-center gap-1 text-blue-600 hover:text-blue-800 font-bold px-2 py-1 bg-blue-50 rounded-full border border-blue-200 uppercase tracking-tighter"
                 >
                     <CropIcon className="w-3 h-3" />
                     Potong
                 </button>
                 <button
                    onClick={handleRemoveImage}
                    className="text-[10px] text-red-500 hover:text-red-700 px-2 font-bold uppercase tracking-tighter"
                 >
                     Hapus
                 </button>
            </div>
        )}
      </h3>

      <div
        onClick={handleAreaClick}
        className={`relative w-full h-40 border-2 border-dashed rounded-xl flex items-center justify-center text-center p-2 transition-all duration-300 overflow-hidden ${
          disabled
            ? 'bg-gray-100 cursor-not-allowed border-gray-200'
            : previewUrl ? 'bg-white border-purple-200 shadow-sm' : 'bg-gray-50 border-gray-300 hover:border-purple-500 hover:bg-white cursor-pointer'
        }`}
      >
        <input
          type="file"
          id={id}
          ref={fileInputRef}
          className="hidden"
          accept="image/png, image/jpeg, image/jpg"
          onChange={handleFileChange}
          disabled={disabled}
        />
        
        {isAiProcessing ? (
             <div className="flex flex-col items-center justify-center text-purple-600">
                <Spinner />
                <p className="text-[10px] mt-2 font-bold uppercase tracking-widest">Memoles Produk...</p>
             </div>
        ) : previewUrl ? (
          <img src={previewUrl} alt="Preview" className="w-full h-full object-contain rounded-lg" />
        ) : (
          <div className="flex flex-col items-center text-gray-500 pointer-events-none">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-2 border border-gray-100 group-hover:scale-110 transition-transform">
                <UploadIcon className="w-6 h-6 text-purple-500" />
            </div>
            <span className="text-xs font-bold text-gray-700">Pilih dari Galeri</span>
            <span className="text-[10px] text-gray-400 mt-1 uppercase font-medium">Format: JPG, PNG</span>
          </div>
        )}
      </div>

      {/* Crop Modal */}
      {showCropModal && previewUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4 backdrop-blur-sm">
              <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden flex flex-col h-[85vh] shadow-2xl">
                  <header className="p-4 border-b border-gray-100 flex justify-between items-center bg-purple-50/50">
                      <div>
                        <h3 className="text-lg font-black text-gray-900 tracking-tight">
                            {isAiCropMode ? "Tentukan Fokus Produk" : "Potong Foto"}
                        </h3>
                        {isAiCropMode && (
                            <p className="text-[11px] text-purple-600 font-medium leading-tight">
                                Rapikan area produk, lalu beri tahu AI apa nama barangnya.
                            </p>
                        )}
                      </div>
                      <button onClick={handleCancelCrop} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
                          <CloseIcon className="w-5 h-5" />
                      </button>
                  </header>
                  <div className="relative flex-1 bg-gray-900">
                      <Cropper
                        image={previewUrl}
                        crop={crop}
                        zoom={zoom}
                        aspect={id.includes('model') ? 9/16 : 1} // Model typically 9:16 context, Product 1:1
                        onCropChange={setCrop}
                        onCropComplete={onCropComplete}
                        onZoomChange={setZoom}
                      />
                  </div>
                  <div className="p-6 bg-white border-t border-gray-100">
                      {isAiCropMode && (
                          <div className="mb-6">
                              <label htmlFor="ai-object-desc" className="text-xs font-bold text-gray-700 mb-2 block uppercase tracking-wide">
                                  Nama Objek yang ingin Difokuskan <span className="text-red-500">*</span>
                              </label>
                              <input 
                                  type="text" 
                                  id="ai-object-desc"
                                  value={aiObjectDescription}
                                  onChange={(e) => setAiObjectDescription(e.target.value)}
                                  placeholder="Contoh: Gamis Hijau, Botol Parfum, Tas..."
                                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                              />
                          </div>
                      )}

                      <div className="mb-6">
                          <div className="flex justify-between items-center mb-2">
                             <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Perbesar (Zoom)</label>
                             <span className="text-xs font-bold text-purple-600">{(zoom * 100).toFixed(0)}%</span>
                          </div>
                          <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            aria-labelledby="Zoom"
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-purple-600"
                          />
                      </div>
                      <div className="flex justify-end gap-3">
                          <button 
                            onClick={handleCancelCrop}
                            className="px-6 py-2.5 text-sm font-bold text-gray-600 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                          >
                              Batal
                          </button>
                          <button 
                            onClick={handleSaveCrop}
                            disabled={isAiCropMode && !aiObjectDescription.trim()}
                            className={`px-8 py-2.5 text-sm font-bold text-white rounded-xl shadow-md flex items-center gap-2 transition-all active:scale-95
                                ${isAiCropMode 
                                    ? (aiObjectDescription.trim() ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-300 cursor-not-allowed') 
                                    : 'bg-blue-600 hover:bg-blue-700'}`}
                          >
                              {isAiCropMode ? (
                                  <>
                                    <MagicIcon className="w-4 h-4" />
                                    Mulai AI
                                  </>
                              ) : (
                                  'Simpan'
                              )}
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default ImageUploader;
