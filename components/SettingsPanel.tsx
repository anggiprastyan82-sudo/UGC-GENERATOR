
import React from 'react';
import ImageUploader from './ImageUploader';
import Switch from './Switch';
import { SCENE_STRUCTURES } from '../constants';
import { SceneStructure } from '../types';

interface SettingsPanelProps {
    productImage: File | null;
    productImage2: File | null; 
    modelImage: File | null;
    productName: string;
    additionalBrief: string;
    sceneStructureId: string;
    ugcSceneCount: number;
    ugcWordCount: number; 
    generateVoiceOver: boolean;
    addBackgroundMusic: boolean;
    ctaPerScene: boolean; 
    selectedModel: string; 
    onProductImageUpload: (file: File) => void;
    onProductImage2Upload: (file: File) => void; 
    onModelImageUpload: (file: File) => void;
    onProductNameChange: (name: string) => void;
    onAdditionalBriefChange: (brief: string) => void;
    onSceneStructureChange: (id: string) => void;
    onUgcSceneCountChange: (count: number) => void;
    onUgcWordCountChange: (count: number) => void; 
    onGenerateVoiceOverChange: (enabled: boolean) => void;
    onAddBackgroundMusicChange: (enabled: boolean) => void;
    onCtaPerSceneChange: (enabled: boolean) => void; 
    onModelChange: (model: string) => void; 
    onGenerate: () => void;
    apiKeySelected: boolean;
    onSelectKey: () => void;
    isLoading: boolean;
    error: string | null;
    className?: string;
}

const SettingsPanel: React.FC<SettingsPanelProps> = (props) => {
    const {
        productName, onProductNameChange,
        additionalBrief, onAdditionalBriefChange,
        sceneStructureId, onSceneStructureChange,
        ugcSceneCount, onUgcSceneCountChange,
        ugcWordCount, onUgcWordCountChange,
        generateVoiceOver, onGenerateVoiceOverChange,
        addBackgroundMusic, onAddBackgroundMusicChange,
        ctaPerScene, onCtaPerSceneChange,
        selectedModel, onModelChange,
        onProductImageUpload, onProductImage2Upload, onModelImageUpload,
        onGenerate, apiKeySelected, onSelectKey, isLoading, error,
        className = ''
    } = props;
    
    const currentStructure = SCENE_STRUCTURES.find(s => s.id === sceneStructureId);
    const isTopicBased = sceneStructureId === 'talking-head-awareness' || sceneStructureId === 'storytelling-camera';
    const productRequired = currentStructure?.requiredParts.includes('product') ?? true;
    
    const canGenerate = productName && (productRequired ? props.productImage : true) && apiKeySelected && !isLoading;

    return (
        <aside className={`w-full md:w-80 flex-shrink-0 bg-white border-l border-gray-200 flex flex-col shadow-sm ${className}`}>
            <header className="p-5 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-xl font-black text-gray-900 tracking-tight">Konfigurasi Video</h2>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">UGC Filmmaker Setup</p>
            </header>

            <div className="flex-1 p-5 space-y-6 overflow-y-auto custom-scrollbar">
                {/* Product Reference Images from Gallery */}
                {productRequired && (
                    <div className="space-y-4">
                        <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                           <p className="text-[10px] font-black text-blue-600 uppercase mb-3">Referensi Produk (Gallery)</p>
                            <ImageUploader 
                                id="product" 
                                title="Foto Produk 1" 
                                onImageUpload={onProductImageUpload} 
                                disabled={isLoading} 
                            />
                             <ImageUploader 
                                id="product2" 
                                title="Foto Produk 2" 
                                onImageUpload={onProductImage2Upload} 
                                disabled={isLoading} 
                                isOptional={true}
                            />
                        </div>
                    </div>
                )}
                
                <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100">
                    <p className="text-[10px] font-black text-purple-600 uppercase mb-3">Referensi Model (Gallery)</p>
                    <ImageUploader 
                        id="model" 
                        title="Foto Model Utama" 
                        onImageUpload={onModelImageUpload} 
                        disabled={isLoading} 
                        isOptional={false} 
                    />
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label htmlFor="product-name" className="text-xs font-bold text-gray-700 mb-2 block uppercase tracking-wide">
                            {isTopicBased ? "Judul Video / Topik" : "Nama Produk"}
                        </label>
                        <input
                            type="text"
                            id="product-name"
                            value={productName}
                            onChange={(e) => onProductNameChange(e.target.value)}
                            placeholder={isTopicBased ? "Contoh: Tips Karir" : "Contoh: Serum HydraGlow"}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                            disabled={isLoading}
                        />
                    </div>

                    <div>
                        <label htmlFor="scene-structure" className="text-xs font-bold text-gray-700 mb-2 block uppercase tracking-wide">Gaya Iklan (Prompt)</label>
                        <select
                            id="scene-structure"
                            value={sceneStructureId}
                            onChange={(e) => onSceneStructureChange(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-purple-500 transition-all outline-none"
                            disabled={isLoading}
                        >
                            {SCENE_STRUCTURES.map((structure: SceneStructure) => (
                                <option key={structure.id} value={structure.id}>{structure.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="ugc-scene-count" className="text-[10px] font-bold text-gray-600 mb-1 block uppercase tracking-wide">Jumlah Scene</label>
                            <select
                                id="ugc-scene-count"
                                value={ugcSceneCount}
                                onChange={(e) => onUgcSceneCountChange(Number(e.target.value))}
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-900 focus:ring-2 focus:ring-purple-500"
                                disabled={isLoading}
                            >
                                <option value="4">4 Adegan</option>
                                <option value="6">6 Adegan</option>
                                <option value="8">8 Adegan</option>
                            </select>
                        </div>
                        <div>
                             <label className="text-[10px] font-bold text-gray-600 mb-1 block uppercase tracking-wide">Durasi Naskah</label>
                             <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                                <span className="text-xs font-black text-purple-600">{ugcWordCount}</span>
                                <span className="text-[10px] text-gray-400 uppercase">Kata</span>
                             </div>
                        </div>
                    </div>
                    
                    <div className="px-1">
                        <input type="range" min="15" max="50" step="5" value={ugcWordCount} onChange={(e) => onUgcWordCountChange(Number(e.target.value))} className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600" disabled={isLoading} />
                    </div>

                    <div>
                        <label htmlFor="additional-brief" className="text-xs font-bold text-gray-700 mb-2 block uppercase tracking-wide">Instruksi Tambahan</label>
                        <textarea
                            id="additional-brief"
                            rows={3}
                            value={additionalBrief}
                            onChange={(e) => onAdditionalBriefChange(e.target.value)}
                            placeholder="Contoh: Fokus pada detail jahitan atau suasana ceria..."
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-purple-500 transition-all outline-none resize-none"
                            disabled={isLoading}
                        />
                    </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-gray-100">
                    <Switch label="Gunakan AI Voice Over" enabled={generateVoiceOver} onChange={onGenerateVoiceOverChange} disabled={isLoading} />
                    <Switch label="Gunakan Background Musik" enabled={addBackgroundMusic} onChange={onAddBackgroundMusicChange} disabled={isLoading} />
                    <Switch label="Mode Keranjang Kuning (CTA)" enabled={ctaPerScene} onChange={onCtaPerSceneChange} disabled={isLoading} />
                </div>

                <div className="pt-6 border-t border-gray-100">
                    <label className="text-xs font-bold text-gray-700 mb-2 block uppercase tracking-wide">Kekuatan AI (Model)</label>
                    <select
                        value={selectedModel}
                        onChange={(e) => onModelChange(e.target.value)}
                        className="w-full px-4 py-3 bg-purple-50/50 border border-purple-100 rounded-xl text-sm font-bold text-purple-900 focus:ring-2 focus:ring-purple-500 transition-all outline-none cursor-pointer"
                        disabled={isLoading}
                    >
                        <option value="gemini-2.5-flash">Gemini 2.5 Flash (Cepat)</option>
                        <option value="gemini-3-pro">Gemini 3 Pro (High-End 2K)</option>
                    </select>
                </div>
            </div>

            <footer className="p-5 border-t border-gray-100 bg-white">
                {!apiKeySelected ? (
                    <div className="flex flex-col items-center text-center">
                        <div className="w-10 h-10 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-3">
                            <span className="text-xl">⚠️</span>
                        </div>
                        <p className="mb-1 text-xs text-red-600 font-black uppercase tracking-tighter">Kunci API Belum Dipilih</p>
                        <p className="mb-4 text-[10px] text-gray-400 leading-tight">Video Generation memerlukan biaya kuota token.</p>
                        <button onClick={onSelectKey} className="w-full bg-red-500 text-white font-black py-3 px-4 rounded-xl hover:bg-red-600 transition-all shadow-md active:scale-95 uppercase tracking-wider text-xs">
                            Pilih Kunci API
                        </button>
                    </div>
                ) : (
                    <button 
                        onClick={onGenerate} 
                        disabled={!canGenerate}
                        className="w-full bg-purple-600 text-white font-black py-4 px-4 rounded-xl flex items-center justify-center gap-3 hover:bg-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-purple-100 active:scale-95 uppercase tracking-widest text-sm"
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>Memproses...</span>
                            </div>
                        ) : (
                            <>
                                <span className="text-xl">✨</span>
                                <span>Buat UGC Sekarang</span>
                            </>
                        )}
                    </button>
                )}
                {error && <p className="text-red-500 text-[10px] font-bold mt-3 text-center bg-red-50 p-2 rounded-lg border border-red-100 uppercase tracking-tighter">{error}</p>}
                
                <div className="mt-4 text-[9px] text-gray-300 text-center font-bold uppercase tracking-widest">
                    AI UGC Generator v3.0
                </div>
            </footer>
        </aside>
    );
};

export default SettingsPanel;
