
import React, { useState, useEffect } from 'react';
import SceneCard from './components/SceneCard';
import Spinner from './components/Spinner';
import { SCENE_STRUCTURES } from './constants';
import { Scene, GenerationStatus, SceneStructure } from './types';
import * as geminiService from './services/geminiService';
import Sidebar from './components/Sidebar';
import SettingsPanel from './components/SettingsPanel';
import AttentionModal from './components/AttentionModal';
import Switch from './components/Switch';
import UgcToolIcon from './components/icons/UgcToolIcon';
import PersonalBrandingIcon from './components/icons/PersonalBrandingIcon';
import ImageIcon from './components/icons/ImageIcon';
import ColoringBookIcon from './components/icons/ColoringBookIcon';
import ImageUploader from './components/ImageUploader';
import CopyIcon from './components/icons/CopyIcon';
import CheckIcon from './components/icons/CheckIcon';
import DownloadIcon from './components/icons/DownloadIcon';

// Template Naskah Referensi
const SCRIPT_TEMPLATES: Record<string, string> = {
  'nasihat_bijak': `Hai, kalian pasangan-pasangan muda, baru menikah ya? Dimungkinkan belum punya tempat tinggal ya? Kan pilihannya mau ngontrak atau mau tinggal sementara dengan orang tua. Ya, dengan orang tua siapapun. Mau orang tua dari pihak perempuan, mau orang tua dari pihak laki-laki, pokoknya di orang tua.
Itu boleh-boleh saja. Yang namanya juga persiapan, kan? Baru belajar berumah tangganya.
Hal yang Harus Dipertimbangkan
Hanya, harus dipertimbangkan. Apa itu? Terutama satu:
Kemandirian dan Keseimbangan Hubungan:
Jadi anaknya, jangan tetap jadi anak yang bergantung pada orang tua. Kan, sebagai anak kemarin masih bergantung penuh ya sama orang tua.
Juga jangan terlalu menjadi lepas, gitu kan.
Seimbang terhadap orang tua seperti apa, terhadap pasangan seperti apa.
Visi Pengasuhan (Terutama Setelah Punya Anak):
Apalagi nanti ketika sudah punya anak. Harus dibicarakan dari awal.
Nanti kalau sudah punya anak, kita harus satu arah ya, harus satu konsisten.
Misalnya, "Saya mau mengasuhnya dalam cara ini, Mah." Itu enggak apa-apa, boleh dibicarakan kok.
"Kalau saya punya visi misinya kalau punya anak, saya mau gini-gini-gini." Sampaikan pada orang tua yang saat ini tinggal dengan kalian.
Jangan sampai anak-anak bingung nanti. Hal ini enggak boleh sama ibunya, boleh sama neneknya, gitu kan, atau sama kakeknya.`,
  'casual_gaul': `Eh guys, lo pernah gak sih ngerasa stuck banget pas lagi ngerjain sesuatu? Jujur gue dulu sering banget kayak gitu. Rasanya kayak, "Duh, ini kapan kelarnya sih?"
Tapi, setelah gue coba satu trik ini, sumpah ngebantu banget sih. Kerjaan gue jadi lebih sat-set, dan gue gak gampang burnout.
Kuncinya tuh sebenernya simpel banget. Lo cuma perlu ubah mindset lo dikit aja. Coba deh lo bayangin kalau lo lagi main game...`,
  'profesional': `Dalam dunia profesional saat ini, integritas dan efisiensi adalah dua mata uang yang paling berharga. Saya sering menemui kasus di mana strategi yang baik gagal hanya karena eksekusi yang kurang disiplin.
Mari kita bedah datanya. 70% keberhasilan sebuah proyek ditentukan di tahap perencanaan.
Oleh karena itu, sebagai pemimpin, Anda harus bisa melihat "Big Picture" tanpa melupakan detail kecil.`,
  'puitis_story': `Senja selalu punya cara untuk mengingatkan kita pada hal-hal yang belum selesai. Dulu, aku pikir melepaskan itu berarti melupakan. 
Ternyata aku salah. Melepaskan adalah berdamai dengan ingatan.
Seperti kopi yang aku seduh pagi ini, pahitnya tetap ada, tapi aromanya menenangkan. Begitu juga dengan kenangan...`,
  'emosional_rant': `(Intro: Musik dramatis, ekspresi wajah mulai tegang menahan kesal)

Weh, kendalanya ya Bapak! Kendalanya Bapak! Kok bisa nggak tahu?
Eh, egonya tinggi, tapi self awareness-nya kok rendah.
Dari dulu kendalanya Bapak! Bapak sibuk otak-atik bawahan. Reshuffle, reshuffle, reshuffle.
Padahal masalahnya Bapak! Teman-teman yang kemarin resign-resign itu karena...
BAPAK!!`,
  'custom': ''
};

const App: React.FC = () => {
  // Shared State
  const [error, setError] = useState<string | null>(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(window.innerWidth > 768);
  const [activeTool, setActiveTool] = useState('ugc-tool');
  const [showAttentionModal, setShowAttentionModal] = useState(true);
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash'); // Default to Flash

  // UGC Tool State
  const [productImage, setProductImage] = useState<File | null>(null);
  const [productImage2, setProductImage2] = useState<File | null>(null); // State for 2nd image
  const [modelImage, setModelImage] = useState<File | null>(null);
  const [productName, setProductName] = useState('');
  const [additionalBrief, setAdditionalBrief] = useState('');
  const [sceneStructureId, setSceneStructureId] = useState(SCENE_STRUCTURES[0].id);
  const [ugcSceneCount, setUgcSceneCount] = useState(4);
  const [ugcWordCount, setUgcWordCount] = useState(25); // New Word Count
  const [ugcGlobalCaption, setUgcGlobalCaption] = useState(''); // Global caption
  const [ugcCaptionCopied, setUgcCaptionCopied] = useState(false);
  
  const [generateVoiceOver, setGenerateVoiceOver] = useState(true);
  const [addBackgroundMusic, setAddBackgroundMusic] = useState(false);
  const [ctaPerScene, setCtaPerScene] = useState(false); // State for CTA checkbox
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [ugcHasGenerated, setUgcHasGenerated] = useState(false);

  // Personal Branding Tool State
  const [pbModelImage, setPbModelImage] = useState<File | null>(null);
  const [pbComments, setPbComments] = useState('');
  // Initialize with Default Template
  const [pbReferenceScript, setPbReferenceScript] = useState(SCRIPT_TEMPLATES['nasihat_bijak']);
  const [pbScriptStyle, setPbScriptStyle] = useState('nasihat_bijak');
  
  const [pbHook, setPbHook] = useState('The Contradiction Hook (Intrik)');
  const [pbCta, setPbCta] = useState('Save & Share');
  const [pbWordCount, setPbWordCount] = useState(20);
  const [pbAdditionalBrief, setPbAdditionalBrief] = useState('');
  const [pbSceneCount, setPbSceneCount] = useState(4);
  const [pbVideoType, setPbVideoType] = useState('podcast'); // Default
  const [pbScenes, setPbScenes] = useState<Scene[]>([]);
  const [pbThumbnailTitle, setPbThumbnailTitle] = useState('');
  const [pbDescription, setPbDescription] = useState('');
  
  const [isPbLoading, setIsPbLoading] = useState(false);
  const [pbGenerateVo, setPbGenerateVo] = useState(true);
  const [pbAddMusic, setPbAddMusic] = useState(false);
  const [pbLoadingMessage, setPbLoadingMessage] = useState('');
  const [pbHasGenerated, setPbHasGenerated] = useState(false);
  const [pbDescCopied, setPbDescCopied] = useState(false);
  
  // --- Gemini 3 Image Tool State ---
  const [g3Prompt, setG3Prompt] = useState('');
  const [g3InspirationImage, setG3InspirationImage] = useState<File | null>(null);
  const [g3StyleImage, setG3StyleImage] = useState<File | null>(null);
  const [g3BackgroundImage, setG3BackgroundImage] = useState<File | null>(null);
  const [g3AspectRatio, setG3AspectRatio] = useState('9:16');
  const [g3Style, setG3Style] = useState('Fotografi Realistis');
  const [g3Character, setG3Character] = useState('(Tidak ditentukan)');
  const [g3Hijab, setG3Hijab] = useState('(Tidak ditentukan)');
  const [g3Origin, setG3Origin] = useState('Korea Selatan');
  const [g3Nuance, setG3Nuance] = useState('Dalam Ruangan (Studio)');
  const [g3Images, setG3Images] = useState<string[]>([]);
  const [isG3Loading, setIsG3Loading] = useState(false);

  // --- Coloring Book Tool State ---
  const [cbTheme, setCbTheme] = useState('');
  const [cbImages, setCbImages] = useState<string[]>([]);
  const [isCbLoading, setIsCbLoading] = useState(false);

  // Initialize or adjust scenes for UGC Tool based on count
  useEffect(() => {
    if (activeTool === 'ugc-tool') {
        if (scenes.length !== ugcSceneCount) {
             const initialScenes = Array.from({ length: ugcSceneCount }, (_, i) => ({
                id: i + 1,
                title: `Adegan ${i + 1}`,
                description: 'Menunggu pembuatan konten...',
                image: '',
                script: '',
                overlayTextSuggestion: '',
                status: GenerationStatus.PENDING,
                imagePrompt: '',
                videoPrompt: '',
            }));
            setScenes(initialScenes);
        }
    }
  }, [activeTool, ugcSceneCount, scenes.length]);
  
  // Initialize or adjust scenes for Personal Branding Tool based on count
  useEffect(() => {
    if (activeTool === 'personal-branding') {
        if (pbScenes.length !== pbSceneCount) {
            const initialScenes = Array.from({ length: pbSceneCount }, (_, i) => ({
                id: i + 1,
                title: `Adegan ${i + 1}`,
                description: 'Konten personal branding',
                image: '',
                script: '',
                overlayTextSuggestion: '',
                status: GenerationStatus.PENDING,
                imagePrompt: '',
                videoPrompt: `Animasi halus seolah model sedang berbicara dengan natural.`,
                errorMessage: ''
            }));
            setPbScenes(initialScenes);
        }
    }
  }, [activeTool, pbSceneCount, pbScenes.length]);
  
  // --- UGC Tool Handlers ---
  const ugcHandleVideoPromptChange = (sceneId: number, prompt: string) => setScenes(prev => prev.map(s => s.id === sceneId ? { ...s, videoPrompt: prompt } : s));
  const ugcHandleScriptChange = (sceneId: number, script: string) => setScenes(prev => prev.map(s => s.id === sceneId ? { ...s, script: script } : s));
  const ugcResetState = () => {
    const initialScenes = Array.from({ length: ugcSceneCount }, (_, i) => ({ id: i + 1, title: `Adegan ${i + 1}`, description: 'Menunggu pembuatan konten...', image: '', script: '', overlayTextSuggestion: '', status: GenerationStatus.PENDING, imagePrompt: '', videoPrompt: '' }));
    setScenes(initialScenes);
    setUgcGlobalCaption('');
    setError(null);
    setIsLoading(false);
    setLoadingMessage('');
    setUgcHasGenerated(false);
  };
  const handleGenerateInitialAssets = async () => {
    setError(null);
    const selectedStructure = SCENE_STRUCTURES.find(s => s.id === sceneStructureId)!;
    const modelIsRequired = selectedStructure.requiredParts.includes('model');
    const productIsRequired = selectedStructure.requiredParts.includes('product');

    if (modelIsRequired && !modelImage) { setError(`Struktur adegan "${selectedStructure.name}" membutuhkan gambar model. Mohon unggah.`); return; }
    if (productIsRequired && !productImage) { setError('Mohon unggah gambar produk.'); return; }
    if (!productName) { setError('Mohon isi Nama Produk atau Topik Video.'); return; }
    
    // Reset scenes but show the panel
    const initialScenes = Array.from({ length: ugcSceneCount }, (_, i) => ({ id: i + 1, title: `Adegan ${i + 1}`, description: 'Menunggu pembuatan konten...', image: '', script: '', overlayTextSuggestion: '', status: GenerationStatus.PENDING, imagePrompt: '', videoPrompt: '' }));
    setScenes(initialScenes);
    setUgcGlobalCaption('');
    setUgcHasGenerated(true);
    setIsLoading(true);

    try {
      setLoadingMessage('Menyiapkan aset...');
      let imageParts: any = { products: [] };
      if (productImage) {
        imageParts.products.push(await geminiService.fileToGenerativePart(productImage));
      }
      if (productImage2) {
        imageParts.products.push(await geminiService.fileToGenerativePart(productImage2));
      }
      if (productIsRequired && imageParts.products.length === 0) {
         throw new Error("Product image missing");
      }
      
      if (!productImage && !productImage2 && modelImage) {
         imageParts.products.push(await geminiService.fileToGenerativePart(modelImage));
      }

      const modelPart = modelImage ? await geminiService.fileToGenerativePart(modelImage) : undefined;
      
      if (modelImage) {
          imageParts.model = modelPart;
      }

      setLoadingMessage('Membuat rencana konten & naskah...');
      // Pass CTA config and Word Count
      const planningPrompt = selectedStructure.planningPrompt(productName, additionalBrief, ugcSceneCount, ctaPerScene, ugcWordCount);
      const { scenes: plan, globalCaption } = await geminiService.generateUgcPlan(planningPrompt, ugcSceneCount);
      
      setUgcGlobalCaption(globalCaption);
      const imagePrompts = plan.map(p => p.image_prompt);
      
      setLoadingMessage(`Membuat gambar dengan ${selectedModel === 'gemini-3-pro' ? 'Gemini 3' : 'Gemini Flash'}...`);
      // Pass selectedModel to generation
      const images = await geminiService.generateUgcImages(imagePrompts, imageParts, selectedModel);
      
      const updatedScenes = scenes.map((scene, index) => ({ 
        ...scene, 
        image: images[index], 
        title: plan[index].title,
        description: plan[index].description,
        script: plan[index].script, 
        socialCaption: plan[index].social_caption, // Capture per-scene caption if exists
        overlayTextSuggestion: plan[index].overlay_text, 
        imagePrompt: plan[index].image_prompt,
        videoPrompt: plan[index].video_prompt,
        status: GenerationStatus.IMAGE_READY,
      }));
      setScenes(updatedScenes);
    } catch (e: any) { console.error('Initial generation failed:', e); setError(e.message || 'Terjadi kesalahan tak terduga.'); setScenes(prev => prev.map(s => ({...s, status: GenerationStatus.ERROR, errorMessage: e.message}))); } finally { setIsLoading(false); setLoadingMessage(''); }
  };

  const handleRegenerateImage = async (sceneId: number) => {
    const selectedStructure = SCENE_STRUCTURES.find(s => s.id === sceneStructureId)!;
    const modelIsRequired = selectedStructure.requiredParts.includes('model');
    const productIsRequired = selectedStructure.requiredParts.includes('product');
    const scene = scenes.find(s => s.id === sceneId);

    if (!scene || !scene.imagePrompt) { setError("Prompt gambar tidak ditemukan."); return; }
    if (modelIsRequired && !modelImage) { setScenes(prev => prev.map(s => s.id === sceneId ? { ...s, status: GenerationStatus.ERROR, errorMessage: 'Gambar model diperlukan untuk adegan ini.' } : s)); return; }
    if (productIsRequired && !productImage) { setScenes(prev => prev.map(s => s.id === sceneId ? { ...s, status: GenerationStatus.ERROR, errorMessage: 'Gambar produk diperlukan.' } : s)); return; }

    setScenes(prev => prev.map(s => s.id === sceneId ? { ...s, status: GenerationStatus.GENERATING_IMAGE, errorMessage: '' } : s));
    try { 
      let imageParts: any = { products: [] };
      if (productImage) {
          imageParts.products.push(await geminiService.fileToGenerativePart(productImage));
      }
      if (productImage2) {
          imageParts.products.push(await geminiService.fileToGenerativePart(productImage2));
      }
      if (!productImage && !productImage2 && modelImage) {
          imageParts.products.push(await geminiService.fileToGenerativePart(modelImage));
      }
      
      const modelPart = modelImage ? await geminiService.fileToGenerativePart(modelImage) : undefined; 
      if (modelPart) imageParts.model = modelPart;

      // Pass selectedModel
      const newImage = await geminiService.regenerateSingleImage(scene.imagePrompt, imageParts, selectedModel); 
      setScenes(prev => prev.map(s => s.id === sceneId ? { ...s, image: newImage, status: GenerationStatus.IMAGE_READY } : s)); 
    } catch (e: any) { 
        console.error(`Error regenerating image for scene ${sceneId}:`, e); 
        setScenes(prev => prev.map(s => s.id === sceneId ? { ...s, status: GenerationStatus.ERROR, errorMessage: e.message } : s)); 
    }
  };
  const handleGenerateVideo = async (sceneId: number, customPrompt: string) => {
      const scene = scenes.find(s => s.id === sceneId); if (!scene || !scene.image) return;
      setScenes(prev => prev.map(s => s.id === sceneId ? { ...s, status: GenerationStatus.GENERATING_VIDEO, errorMessage: '' } : s));
      try { const videoUrl = await geminiService.generateVideoFromImage(scene.image, customPrompt, scene.script, addBackgroundMusic); setScenes(prev => prev.map(s => s.id === scene.id ? { ...s, videoUrl, status: GenerationStatus.COMPLETED } : s)); } catch (videoError: any) { console.error(`Error generating video for scene ${scene.id}:`, videoError); const errorMessage = videoError.message || 'Unknown error'; let displayError = 'Gagal membuat video.'; if (errorMessage.includes("RESOURCE_EXHAUSTED") || errorMessage.includes("429")) { displayError = "Batas kuota untuk key ini habis."; } setScenes(prev => prev.map(s => s.id === scene.id ? { ...s, status: GenerationStatus.ERROR, errorMessage: displayError } : s)); }
  };
  const isAnySceneProcessing = scenes.some(s => s.status === GenerationStatus.GENERATING_IMAGE || s.status === GenerationStatus.GENERATING_VIDEO);
  
  const handleCopyUgcGlobalCaption = () => {
      navigator.clipboard.writeText(ugcGlobalCaption).then(() => {
          setUgcCaptionCopied(true);
          setTimeout(() => setUgcCaptionCopied(false), 2000);
      });
  };

  // --- Personal Branding Tool Handlers ---
  const pbHandleVideoPromptChange = (sceneId: number, prompt: string) => setPbScenes(prev => prev.map(s => s.id === sceneId ? { ...s, videoPrompt: prompt } : s));
  const pbHandleScriptChange = (sceneId: number, script: string) => setPbScenes(prev => prev.map(s => s.id === sceneId ? { ...s, script: script } : s));
  const pbResetState = () => {
    const initialScenes = Array.from({ length: pbSceneCount }, (_, i) => ({ id: i + 1, title: `Adegan ${i + 1}`, description: 'Konten personal branding', image: '', script: '', overlayTextSuggestion: '', status: GenerationStatus.PENDING, imagePrompt: '', videoPrompt: `Animasi halus seolah model sedang berbicara dengan natural.`, errorMessage: '' }));
    setPbScenes(initialScenes);
    setPbThumbnailTitle('');
    setPbDescription('');
    setError(null);
    setIsPbLoading(false);
    setPbLoadingMessage('');
    setPbHasGenerated(false);
  };
  
  const handleGeneratePbContent = async () => {
      if (!pbComments || !pbReferenceScript) { setError("Mohon isi kolom komentar dan naskah referensi."); return; }
      if (!pbModelImage) { setError("Mohon unggah foto model untuk personal branding."); return; }

      const initialScenes = Array.from({ length: pbSceneCount }, (_, i) => ({ id: i + 1, title: `Adegan ${i + 1}`, description: 'Konten personal branding', image: '', script: '', overlayTextSuggestion: '', status: GenerationStatus.PENDING, imagePrompt: '', videoPrompt: `Animasi halus seolah model sedang berbicara dengan natural.`, errorMessage: '' }));
      setPbScenes(initialScenes);
      setPbThumbnailTitle('');
      setPbDescription('');
      setPbHasGenerated(true);
      setIsPbLoading(true);
      
      try {
          setPbLoadingMessage('Menganalisis gaya & membuat naskah...');
          const modelPart = await geminiService.fileToGenerativePart(pbModelImage);
          
          const { scenes: scenesData, images, thumbnailTitle, socialDescription } = await geminiService.generatePersonalBrandingContent(
              pbComments, 
              pbReferenceScript, 
              pbAdditionalBrief, 
              pbSceneCount,
              pbHook,
              pbCta,
              pbWordCount,
              pbVideoType, // Pass selected type
              modelPart,
              selectedModel // Pass model choice
          );
          
          setPbThumbnailTitle(thumbnailTitle);
          setPbDescription(socialDescription);

          const updatedScenes = pbScenes.map((scene, i) => ({
              ...scene,
              script: scenesData[i].script,
              overlayTextSuggestion: scenesData[i].overlay,
              imagePrompt: scenesData[i].imagePrompt, 
              videoPrompt: `Animasi halus seolah model sedang berbicara dengan natural, sesuai naskah.`,
              image: images[i],
              status: GenerationStatus.IMAGE_READY,
          }));
          setPbScenes(updatedScenes);
      } catch (e: any) { console.error('PB generation failed:', e); setError(e.message || 'Gagal membuat konten personal branding.'); setPbScenes(prev => prev.map(s => ({...s, status: GenerationStatus.ERROR, errorMessage: e.message}))); } finally { setIsPbLoading(false); setPbLoadingMessage(''); }
  };

   const handleRegeneratePbImage = async (sceneId: number) => {
    const scene = pbScenes.find(s => s.id === sceneId);
    if (!scene || !scene.imagePrompt) {
        setError("Prompt gambar tidak ditemukan untuk adegan ini.");
        return;
    }
    if (!pbModelImage) { setError("Foto model diperlukan untuk regenerasi."); return; }

    setPbScenes(prev => prev.map(s => s.id === sceneId ? { ...s, status: GenerationStatus.GENERATING_IMAGE, errorMessage: '' } : s));
    try {
        // Reuse regenerateSingleImage but treat model as product to simplify
        let imageParts: any = { products: [] };
        imageParts.products.push(await geminiService.fileToGenerativePart(pbModelImage));
        
        // Pass selectedModel
        const newImage = await geminiService.regenerateSingleImage(scene.imagePrompt, imageParts, selectedModel);
        setPbScenes(prev => prev.map(s => s.id === sceneId ? { ...s, image: newImage, status: GenerationStatus.IMAGE_READY } : s));
    } catch (e: any) { console.error(`Error regenerating PB image for scene ${sceneId}:`, e); setPbScenes(prev => prev.map(s => s.id === sceneId ? { ...s, status: GenerationStatus.ERROR, errorMessage: e.message } : s)); }
  };

  const handleGeneratePbVideo = async (sceneId: number, customPrompt: string) => {
    const scene = pbScenes.find(s => s.id === sceneId); if (!scene || !scene.image) return;
    setPbScenes(prev => prev.map(s => s.id === sceneId ? { ...s, status: GenerationStatus.GENERATING_VIDEO, errorMessage: '' } : s));
    try { const videoUrl = await geminiService.generateVideoFromImage(scene.image, customPrompt, scene.script, pbAddMusic); setPbScenes(prev => prev.map(s => s.id === scene.id ? { ...s, videoUrl, status: GenerationStatus.COMPLETED } : s)); } catch (videoError: any) { console.error(`Error generating video for scene ${scene.id}:`, videoError); const errorMessage = videoError.message || 'Unknown error'; let displayError = 'Gagal membuat video.'; if (errorMessage.includes("RESOURCE_EXHAUSTED") || errorMessage.includes("429")) { displayError = "Batas kuota untuk key ini habis."; } setPbScenes(prev => prev.map(s => s.id === scene.id ? { ...s, status: GenerationStatus.ERROR, errorMessage: displayError } : s)); }
  };
  const isAnyPbSceneProcessing = pbScenes.some(s => s.status === GenerationStatus.GENERATING_IMAGE || s.status === GenerationStatus.GENERATING_VIDEO);
  
  const handleCopyDescription = () => {
      const text = `TITLE: ${pbThumbnailTitle}\n\n${pbDescription}`;
      navigator.clipboard.writeText(text).then(() => {
          setPbDescCopied(true);
          setTimeout(() => setPbDescCopied(false), 2000);
      });
  };

  // --- Gemini 3 Image Tool Logic ---
  const handleGenerateGemini3Images = async () => {
    if (!g3Prompt) { setError("Prompt utama harus diisi."); return; }
    setIsG3Loading(true);
    setG3Images([]);
    setError(null);
    try {
        const generatedImages = await geminiService.generateGemini3Images(
            g3Prompt,
            g3AspectRatio,
            g3Style,
            g3Character,
            g3Hijab,
            g3Origin,
            g3Nuance,
            { inspiration: g3InspirationImage || undefined, styleRef: g3StyleImage || undefined, background: g3BackgroundImage || undefined }
        );
        setG3Images(generatedImages);
    } catch (e: any) {
        console.error("Gemini 3 generation failed:", e);
        setError(e.message || "Gagal membuat gambar.");
    } finally {
        setIsG3Loading(false);
    }
  };

  // --- Coloring Book Logic ---
  const handleGenerateColoringBook = async () => {
      if (!cbTheme) { setError("Silakan masukkan tema atau cerita."); return; }
      setIsCbLoading(true);
      setCbImages([]);
      setError(null);
      try {
          const generatedImages = await geminiService.generateColoringBookImages(cbTheme);
          setCbImages(generatedImages);
      } catch (e: any) {
          console.error("Coloring book generation failed:", e);
          setError(e.message || "Gagal membuat gambar mewarnai.");
      } finally {
          setIsCbLoading(false);
      }
  };
  
  const downloadImage = (url: string, index: number, prefix: string) => {
      const link = document.createElement('a');
      link.href = url;
      link.download = `${prefix}-${index + 1}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 text-gray-800">
        {showAttentionModal && <AttentionModal onClose={() => setShowAttentionModal(false)} />}
        <Sidebar isExpanded={isSidebarExpanded} onToggle={() => setIsSidebarExpanded(prev => !prev)} activeTool={activeTool} onToolChange={(toolId) => { setError(null); ugcResetState(); pbResetState(); setActiveTool(toolId); }} />
        
        {(isLoading || isPbLoading || isG3Loading || isCbLoading) && (
          <div className="fixed inset-0 bg-white bg-opacity-70 flex flex-col items-center justify-center z-50 text-gray-900">
            <Spinner />
            <p className="mt-4 text-lg font-semibold">{loadingMessage || pbLoadingMessage || 'Sedang membuat karya seni...'}</p>
          </div>
        )}

        <div className="flex-1 flex flex-col pt-16 md:pt-0">
          {/* --- Main Content --- */}
          {activeTool === 'ugc-tool' && (
            <div className="flex-1 flex flex-col md:flex-row">
              <SettingsPanel 
                  className="md:order-2"
                  productImage={productImage} 
                  productImage2={productImage2} // Pass new image
                  modelImage={modelImage} 
                  productName={productName} 
                  additionalBrief={additionalBrief} 
                  sceneStructureId={sceneStructureId} 
                  ugcSceneCount={ugcSceneCount}
                  ugcWordCount={ugcWordCount}
                  generateVoiceOver={generateVoiceOver} 
                  addBackgroundMusic={addBackgroundMusic} 
                  ctaPerScene={ctaPerScene} // Pass CTA state
                  selectedModel={selectedModel} // Pass selected model
                  onProductImageUpload={setProductImage} 
                  onProductImage2Upload={setProductImage2} // Pass new handler
                  onModelImageUpload={setModelImage} 
                  onProductNameChange={setProductName} 
                  onAdditionalBriefChange={setAdditionalBrief} 
                  onSceneStructureChange={setSceneStructureId} 
                  onUgcSceneCountChange={setUgcSceneCount}
                  onUgcWordCountChange={setUgcWordCount}
                  onGenerateVoiceOverChange={setGenerateVoiceOver} 
                  onAddBackgroundMusicChange={setAddBackgroundMusic} 
                  onCtaPerSceneChange={setCtaPerScene} // Pass handler
                  onModelChange={setSelectedModel} // Pass handler
                  onGenerate={handleGenerateInitialAssets} 
                  isLoading={isLoading || isAnySceneProcessing} 
                  error={error} 
              />
              {ugcHasGenerated ? (
                <main className="flex-1 flex flex-col md:order-1 md:overflow-y-auto">
                    <header className="px-8 py-4 border-b border-gray-200 flex justify-between items-center bg-white sticky top-0 z-10">
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">UGC Filmmaker</h1>
                            <p className="text-sm text-gray-500">Studio produksi iklan AI</p>
                        </div>
                    </header>
                    <div className="flex-1 p-4 md:p-8 space-y-6">
                         {/* Global Caption Display (Only if CTA mode is OFF) */}
                         {!ctaPerScene && ugcGlobalCaption && (
                            <div className="bg-gradient-to-r from-blue-50 to-white border border-blue-100 rounded-xl p-6 shadow-sm mb-6">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider">Deskripsi & Hashtag Video</h3>
                                    <button onClick={handleCopyUgcGlobalCaption} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium transition">
                                        {ugcCaptionCopied ? <CheckIcon className="w-3 h-3" /> : <CopyIcon className="w-3 h-3" />}
                                        {ugcCaptionCopied ? 'Disalin' : 'Salin'}
                                    </button>
                                </div>
                                <div className="bg-white border border-gray-200 rounded-lg p-3 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                                    {ugcGlobalCaption}
                                </div>
                            </div>
                        )}

                        <h2 className="text-lg font-semibold">Storyboard Scene <span className="text-sm text-gray-500 font-normal">({scenes.filter(s => s.image).length}/{ugcSceneCount} adegan selesai)</span></h2>
                        <div className="grid grid-cols-1 gap-6">{scenes.map(scene => (<SceneCard key={scene.id} scene={scene} onRegenerateImage={handleRegenerateImage} onGenerateVideo={handleGenerateVideo} onVideoPromptChange={ugcHandleVideoPromptChange} onScriptChange={ugcHandleScriptChange} isVoiceOverEnabled={generateVoiceOver} addBackgroundMusic={addBackgroundMusic} />))}</div>
                    </div>
                </main>
              ) : (
                <div className="hidden md:flex flex-1 flex-col items-center justify-center text-center p-8 bg-gray-50 md:order-1">
                    <div className="max-w-md">
                        <UgcToolIcon className="w-16 h-16 mx-auto text-gray-300" />
                        <h2 className="mt-4 text-xl font-bold text-gray-800">Selamat Datang di UGC Filmmaker</h2>
                        <p className="mt-2 text-gray-500">
                            Isi pengaturan di panel sebelah kanan untuk memulai. Unggah gambar, berikan nama produk, dan biarkan AI membuatkan konten video untuk Anda.
                        </p>
                    </div>
                </div>
              )}
            </div>
          )}

          {activeTool === 'personal-branding' && (
             <div className="flex-1 flex flex-col md:flex-row">
              <aside className="w-full md:w-80 flex-shrink-0 bg-white border-l border-gray-200 flex flex-col md:order-2">
                  <header className="p-4 border-b border-gray-200"><h2 className="text-lg font-semibold text-gray-900">Setup Branding</h2><p className="text-xs text-gray-500">Konfigurasi konten & strategi</p></header>
                  <div className="flex-1 p-4 space-y-4 md:overflow-y-auto">
                      <ImageUploader id="pb-model" title="Foto Model (Wajib)" onImageUpload={setPbModelImage} disabled={isPbLoading} />
                      
                      <div>
                          <label htmlFor="pb-style" className="text-sm font-semibold text-gray-600 mb-2 block">Gaya Bahasa (Tone)</label>
                          <select 
                              id="pb-style"
                              value={pbScriptStyle} 
                              onChange={(e) => {
                                  const newStyle = e.target.value;
                                  setPbScriptStyle(newStyle);
                                  if (SCRIPT_TEMPLATES[newStyle]) {
                                      setPbReferenceScript(SCRIPT_TEMPLATES[newStyle]);
                                  } else if (newStyle === 'custom') {
                                      setPbReferenceScript('');
                                  }
                              }} 
                              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-900 focus:ring-2 focus:ring-purple-500 mb-2" 
                              disabled={isPbLoading}
                          >
                              <option value="nasihat_bijak">Nasihat Bijak (Default)</option>
                              <option value="casual_gaul">Casual & Gaul (Gue-Elo)</option>
                              <option value="profesional">Profesional & Edukatif</option>
                              <option value="puitis_story">Puitis & Storyteller</option>
                              <option value="emosional_rant">Emosional & Rant (Dramatis)</option>
                              <option value="custom">Custom (Tulis Sendiri)</option>
                          </select>

                          <label htmlFor="pb-ref-script" className="text-xs font-medium text-gray-500 mb-1 block">Isi Naskah Referensi</label>
                          <textarea 
                              id="pb-ref-script" 
                              rows={6} 
                              value={pbReferenceScript} 
                              onChange={(e) => {
                                  setPbReferenceScript(e.target.value);
                                  setPbScriptStyle('custom'); // Switch to custom if user types
                              }} 
                              placeholder="Contoh teks yang menggambarkan tone..." 
                              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-xs text-gray-900 focus:ring-2 focus:ring-purple-500" 
                              disabled={isPbLoading} 
                          />
                      </div>
                      
                      <div>
                          <label className="text-sm font-semibold text-gray-600 mb-2 block">Strategi Hook</label>
                          <select value={pbHook} onChange={(e) => setPbHook(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-xs text-gray-900 focus:ring-2 focus:ring-purple-500" disabled={isPbLoading}>
                              <optgroup label="Storytelling / Awareness (ToFu/MoFu)">
                                  <option value="The Contradiction Hook (Intrik): 'Mereka Bilang [Topik] Nggak Cocok... Aku Buktikan Salah.'">The Contradiction Hook (Intrik/Curiosity)</option>
                                  <option value="The Transformation Hook (Relatability): 'Dilema [Masalah] Pagi Ini... Akhirnya Temu Jawaban.'">The Transformation Hook (Masalah Sehari-hari)</option>
                                  <option value="The Mistake Hook (Otoritas): '5 Kesalahan Fatal Saat [Aktivitas]...'">The Mistake Hook (Edukasi/Shock)</option>
                                  <option value="The Specific OOTD/Tips Hook (Utility): 'Tips [Topik] Anti Gagal Check...'">The Specific Tips Hook (Solusi Praktis)</option>
                                  <option value="The Identity Hook (Value): 'Kenapa Aku Memilih [Topik] Ini Bukan Sekedar Tren...'">The Identity Hook (Prinsip/Value)</option>
                              </optgroup>
                              <optgroup label="Sales / Konversi (BoFu)">
                                  <option value="The Urgency Timer Hook (FOMO): 'Hanya Berlaku 3 Jam! Jangan Sampai Nyesel.'">The Urgency Timer Hook (Flash Sale/FOMO)</option>
                                  <option value="The Pain Solution Hook (Solusi): 'Sumpah! Ini Satu-satunya [Produk] yang Beneran Ampuh.'">The Pain Solution Hook (Solusi Langsung)</option>
                                  <option value="The Proof Challenge Hook (Bukti): 'Aku Tantang Kamu Cari Lebih Bagus dari Ini!'">The Proof Challenge Hook (Tantangan Kualitas)</option>
                                  <option value="The Direct Scarcity Hook (Stok): 'Warning: Best-Seller Sisa Sedikit!'">The Direct Scarcity Hook (Stok Terbatas)</option>
                                  <option value="The Price Reveal Hook (Value Prop): 'Kenapa Aku Rela Jual [Produk] Premium Ini Murah?'">The Price Reveal Hook (Value for Money)</option>
                              </optgroup>
                          </select>
                      </div>

                      <div><label htmlFor="pb-comments" className="text-sm font-semibold text-gray-600 mb-2 block">Referensi Komentar / Topik</label><textarea id="pb-comments" rows={3} value={pbComments} onChange={(e) => setPbComments(e.target.value)} placeholder="Apa kata audiens Anda?" className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-900 focus:ring-2 focus:ring-purple-500" disabled={isPbLoading} /></div>
                      
                      <div>
                        <label htmlFor="pb-brief" className="text-sm font-semibold text-gray-600 mb-2 block">Brief Tambahan</label>
                        <textarea 
                            id="pb-brief" 
                            rows={4} 
                            value={pbAdditionalBrief} 
                            onChange={(e) => setPbAdditionalBrief(e.target.value)} 
                            placeholder="Instruksi spesifik (Lokasi, Pakaian, Mood)..." 
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-900 focus:ring-2 focus:ring-purple-500" 
                            disabled={isPbLoading} 
                        />
                      </div>

                      <div>
                          <label className="text-sm font-semibold text-gray-600 mb-2 block">Tipe Video Visual</label>
                          <select value={pbVideoType} onChange={(e) => setPbVideoType(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-900 focus:ring-2 focus:ring-purple-500" disabled={isPbLoading}>
                              <option value="podcast">Podcast Background Statis (Default)</option>
                              <option value="talking_head_selfie">Talking Head Selfie (POV Kamera Depan)</option>
                              <option value="storytelling">Storytelling (Background Berubah-ubah)</option>
                          </select>
                      </div>

                      <div>
                          <label className="text-sm font-semibold text-gray-600 mb-2 block">Call to Action (CTA)</label>
                          <select value={pbCta} onChange={(e) => setPbCta(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-900 focus:ring-2 focus:ring-purple-500" disabled={isPbLoading}>
                              <option value="Save & Share">Save & Share (Edukasi)</option>
                              <option value="Komen di Bawah">Komen Pendapatmu (Diskusi)</option>
                              <option value="Cek Link Bio">Cek Link di Bio (Sales/Lead)</option>
                              <option value="DM untuk Info">DM untuk Info Lebih Lanjut</option>
                          </select>
                      </div>

                      <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-sm font-semibold text-gray-600">Kata per Scene</label>
                            <span className="text-xs text-purple-600 font-bold">{pbWordCount} kata</span>
                          </div>
                          <input type="range" min="10" max="60" step="5" value={pbWordCount} onChange={(e) => setPbWordCount(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600" disabled={isPbLoading} />
                      </div>

                      <div>
                          <label className="text-sm font-semibold text-gray-600 mb-2 block">Jumlah Adegan</label>
                          <select value={pbSceneCount} onChange={(e) => setPbSceneCount(Number(e.target.value))} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-900 focus:ring-2 focus:ring-purple-500" disabled={isPbLoading}>
                              <option value="4">4 Adegan</option>
                              <option value="6">6 Adegan</option>
                              <option value="8">8 Adegan</option>
                          </select>
                      </div>
                      <div className="space-y-3 pt-4 border-t border-gray-200"><Switch label="Buat Voice Over" enabled={pbGenerateVo} onChange={setPbGenerateVo} disabled={isPbLoading} /><Switch label="Tambah Musik Latar" enabled={pbAddMusic} onChange={setPbAddMusic} disabled={isPbLoading} /></div>

                      <div className="pt-4 border-t border-gray-200">
                        <label className="text-sm font-semibold text-gray-600 mb-2 block">Model Generasi Image</label>
                        <select
                            value={selectedModel}
                            onChange={(e) => setSelectedModel(e.target.value)}
                            className="w-full px-3 py-2 bg-purple-50 border border-purple-200 rounded-md text-sm text-gray-900 focus:ring-2 focus:ring-purple-500"
                            disabled={isPbLoading}
                        >
                            <option value="gemini-2.5-flash">Gemini 2.5 Flash (Cepat & Hemat)</option>
                            <option value="gemini-3-pro">Gemini 3 Pro (High Quality 2K)</option>
                        </select>
                    </div>
                  </div>
                  <footer className="p-4 border-t border-gray-200 bg-white">
                      <button onClick={handleGeneratePbContent} disabled={isPbLoading || !pbModelImage || !pbComments || !pbReferenceScript || isAnyPbSceneProcessing} className="w-full bg-purple-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"><span className="text-xl">👤✨</span>{isPbLoading ? 'Membuat...' : 'Buat Konten'}</button>
                      {error && <p className="text-red-500 text-xs mt-2 text-center">{error}</p>}
                  </footer>
              </aside>
              {pbHasGenerated ? (
                <main className="flex-1 flex flex-col md:order-1 md:overflow-y-auto">
                    <header className="px-8 py-4 border-b border-gray-200 flex justify-between items-center bg-white sticky top-0 z-10">
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Hasil Personal Branding</h1>
                            <p className="text-sm text-gray-500">Strategi konten berbasis data audiens</p>
                        </div>
                    </header>
                    <div className="flex-1 p-4 md:p-8 space-y-6">
                        {/* Summary Card for Title & Description */}
                        <div className="bg-gradient-to-r from-purple-50 to-white border border-purple-100 rounded-xl p-6 shadow-sm">
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="flex-1">
                                    <h3 className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-2">Thumbnail Title</h3>
                                    <div className="bg-white border-2 border-purple-200 rounded-lg p-3 text-lg font-black text-gray-900 shadow-sm text-center">
                                        {pbThumbnailTitle || "Generating title..."}
                                    </div>
                                </div>
                                <div className="flex-[2]">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="text-xs font-bold text-purple-600 uppercase tracking-wider">Caption & Hashtags</h3>
                                        {pbDescription && (
                                            <button onClick={handleCopyDescription} className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 font-medium transition">
                                                {pbDescCopied ? <CheckIcon className="w-3 h-3" /> : <CopyIcon className="w-3 h-3" />}
                                                {pbDescCopied ? 'Disalin' : 'Salin'}
                                            </button>
                                        )}
                                    </div>
                                    <div className="bg-white border border-gray-200 rounded-lg p-3 text-sm text-gray-700 h-full whitespace-pre-wrap leading-relaxed">
                                        {pbDescription || "Generating description..."}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <h2 className="text-lg font-semibold">Storyboard Visual <span className="text-sm text-gray-500 font-normal">({pbScenes.filter(s => s.image).length}/{pbSceneCount} scene ready)</span></h2>
                        <div className="grid grid-cols-1 gap-6">{pbScenes.map(scene => (<SceneCard key={scene.id} scene={scene} onRegenerateImage={handleRegeneratePbImage} onGenerateVideo={handleGeneratePbVideo} onVideoPromptChange={pbHandleVideoPromptChange} onScriptChange={pbHandleScriptChange} isVoiceOverEnabled={pbGenerateVo} addBackgroundMusic={pbAddMusic} />))}</div>
                    </div>
                </main>
              ) : (
                <div className="hidden md:flex flex-1 flex-col items-center justify-center text-center p-8 bg-gray-50 md:order-1">
                    <div className="max-w-md">
                        <PersonalBrandingIcon className="w-16 h-16 mx-auto text-gray-300" />
                        <h2 className="mt-4 text-xl font-bold text-gray-800">Konten Personal Branding</h2>
                        <p className="mt-2 text-gray-500">
                           Gunakan masukan dari audiens dan inspirasi dari konten lain untuk membuat video yang otentik dan menarik. Mulai dengan mengisi panel di sebelah kanan.
                        </p>
                    </div>
                </div>
              )}
            </div>
          )}

           {/* --- Gemini 3 Image Tool --- */}
           {activeTool === 'image-gemini-3' && (
            <div className="flex-1 flex flex-col md:flex-row bg-[#0B0F19] text-gray-200">
                {/* -- Left Input Panel (Dark Theme) -- */}
                <aside className="w-full md:w-96 flex-shrink-0 bg-[#111827] border-r border-gray-800 flex flex-col">
                    <header className="p-6 border-b border-gray-800">
                        <h2 className="text-xl font-bold text-white">Image Gemini 3</h2>
                        <p className="text-xs text-gray-400 mt-1">Buat foto Hi-Res dengan skenario detail</p>
                    </header>
                    <div className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar">
                        
                        <div>
                            <label className="text-xs font-bold text-blue-400 mb-2 block uppercase tracking-wide">Prompt Utama Anda</label>
                            <textarea
                                rows={5}
                                value={g3Prompt}
                                onChange={(e) => setG3Prompt(e.target.value)}
                                placeholder="Deskripsikan gambar dengan sangat detail..."
                                className="w-full px-4 py-3 bg-[#1F2937] border border-gray-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                disabled={isG3Loading}
                            />
                        </div>

                        {/* File Uploads - Styled Dark */}
                        <div className="space-y-4">
                            {[
                                { id: 'inspiration', title: 'Upload Foto sebagai Prompt (Inspirasi)', setter: setG3InspirationImage },
                                { id: 'style', title: 'Upload Foto Referensi (Gaya)', setter: setG3StyleImage },
                                { id: 'background', title: 'Upload Latar Belakang (Komposisi)', setter: setG3BackgroundImage },
                            ].map((input) => (
                                <div key={input.id}>
                                    <label className="text-xs font-bold text-blue-400 mb-2 block uppercase tracking-wide">{input.title}</label>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            className="w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 bg-[#1F2937] border border-gray-700 rounded-lg cursor-pointer"
                                            onChange={(e) => input.setter(e.target.files?.[0] || null)}
                                            disabled={isG3Loading}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                             <div>
                                <label className="text-xs font-bold text-blue-400 mb-2 block uppercase tracking-wide">Ukuran Foto (Aspek Rasio)</label>
                                <select 
                                    value={g3AspectRatio} onChange={(e) => setG3AspectRatio(e.target.value)} 
                                    className="w-full px-3 py-2 bg-[#1F2937] border border-gray-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-blue-500"
                                    disabled={isG3Loading}
                                >
                                    <option value="9:16">9:16 (Potret)</option>
                                    <option value="16:9">16:9 (Landscape)</option>
                                    <option value="1:1">1:1 (Square)</option>
                                    <option value="3:4">3:4 (Potret Pendek)</option>
                                    <option value="4:3">4:3 (Landscape Pendek)</option>
                                </select>
                            </div>

                             <div>
                                <label className="text-xs font-bold text-blue-400 mb-2 block uppercase tracking-wide">Gaya Foto</label>
                                <select 
                                    value={g3Style} onChange={(e) => setG3Style(e.target.value)} 
                                    className="w-full px-3 py-2 bg-[#1F2937] border border-gray-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-blue-500"
                                    disabled={isG3Loading}
                                >
                                    <option value="Fotografi Realistis">Fotografi Realistis</option>
                                    <option value="Cinematic">Cinematic</option>
                                    <option value="3D Render">3D Render (Pixar Style)</option>
                                    <option value="Anime">Anime</option>
                                    <option value="Oil Painting">Lukisan Minyak</option>
                                    <option value="Cyberpunk">Cyberpunk</option>
                                </select>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-blue-400 mb-2 block uppercase tracking-wide">Karakter</label>
                                    <select 
                                        value={g3Character} onChange={(e) => setG3Character(e.target.value)} 
                                        className="w-full px-3 py-2 bg-[#1F2937] border border-gray-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-blue-500"
                                        disabled={isG3Loading}
                                    >
                                        <option value="(Tidak ditentukan)">(Tidak ditentukan)</option>
                                        <option value="Wanita Muda">Wanita Muda</option>
                                        <option value="Pria Muda">Pria Muda</option>
                                        <option value="Wanita Dewasa">Wanita Dewasa</option>
                                        <option value="Anak Kecil">Anak Kecil</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-blue-400 mb-2 block uppercase tracking-wide">Hijab</label>
                                    <select 
                                        value={g3Hijab} onChange={(e) => setG3Hijab(e.target.value)} 
                                        className="w-full px-3 py-2 bg-[#1F2937] border border-gray-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-blue-500"
                                        disabled={isG3Loading}
                                    >
                                        <option value="(Tidak ditentukan)">(Tidak ditentukan)</option>
                                        <option value="None">Tidak Berhijab</option>
                                        <option value="Pashmina">Pashmina</option>
                                        <option value="Square">Segi Empat</option>
                                        <option value="Syar'i">Syar'i</option>
                                        <option value="Turban">Turban</option>
                                    </select>
                                </div>
                            </div>

                             <div>
                                <label className="text-xs font-bold text-blue-400 mb-2 block uppercase tracking-wide">Asal Negara Karakter</label>
                                <input
                                    type="text"
                                    value={g3Origin} onChange={(e) => setG3Origin(e.target.value)}
                                    className="w-full px-3 py-2 bg-[#1F2937] border border-gray-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-blue-500"
                                    disabled={isG3Loading}
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-blue-400 mb-2 block uppercase tracking-wide">Nuansa / Latar</label>
                                <select 
                                    value={g3Nuance} onChange={(e) => setG3Nuance(e.target.value)} 
                                    className="w-full px-3 py-2 bg-[#1F2937] border border-gray-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-blue-500"
                                    disabled={isG3Loading}
                                >
                                    <option value="Dalam Ruangan (Studio)">Dalam Ruangan (Studio)</option>
                                    <option value="Luar Ruangan (Alam)">Luar Ruangan (Alam)</option>
                                    <option value="Perkotaan (Urban)">Perkotaan (Urban)</option>
                                    <option value="Cafe Aesthetic">Cafe Aesthetic</option>
                                    <option value="Luxury Home">Rumah Mewah</option>
                                </select>
                            </div>
                        </div>

                    </div>
                    <footer className="p-6 bg-[#111827] border-t border-gray-800">
                        <button 
                            onClick={handleGenerateGemini3Images}
                            disabled={isG3Loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-lg text-lg shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isG3Loading ? 'Sedang Memproses...' : 'Generate 4 Foto'}
                        </button>
                        {error && <p className="text-red-400 text-xs mt-3 text-center">{error}</p>}
                    </footer>
                </aside>

                {/* -- Right Results Panel (Dark Theme) -- */}
                <main className="flex-1 p-8 overflow-y-auto bg-[#0B0F19]">
                    {g3Images.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
                            {g3Images.map((imgSrc, idx) => (
                                <div key={idx} className="group relative bg-[#1F2937] rounded-xl overflow-hidden shadow-2xl border border-gray-800 transition transform hover:-translate-y-1">
                                    <img src={imgSrc} alt={`Result ${idx}`} className="w-full h-auto object-cover" />
                                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black via-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <button 
                                            onClick={() => downloadImage(imgSrc, idx, 'gemini-3-image')}
                                            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2"
                                        >
                                            <DownloadIcon className="w-5 h-5" />
                                            Download Foto
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                            <ImageIcon className="w-24 h-24 mb-4 opacity-20" />
                            <p className="text-xl font-medium">Belum ada foto yang dibuat.</p>
                            <p className="text-sm mt-2 opacity-60">Isi parameter di sebelah kiri dan klik Generate.</p>
                        </div>
                    )}
                </main>
            </div>
           )}

           {/* --- Coloring Book Tool --- */}
           {activeTool === 'coloring-book' && (
            <div className="flex-1 flex flex-col md:flex-row bg-[#0B0F19] text-gray-200">
                {/* -- Left Input Panel (Dark Theme) -- */}
                <aside className="w-full md:w-96 flex-shrink-0 bg-[#111827] border-r border-gray-800 flex flex-col">
                    <header className="p-6 border-b border-gray-800">
                        <h2 className="text-xl font-bold text-white">Coloring Book Generator</h2>
                        <p className="text-xs text-gray-400 mt-1">Buat halaman mewarnai anak dari tema cerita</p>
                    </header>
                    <div className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar">
                        <div>
                            <label className="text-xs font-bold text-blue-400 mb-2 block uppercase tracking-wide">Tema / Cerita</label>
                            <textarea
                                rows={5}
                                value={cbTheme}
                                onChange={(e) => setCbTheme(e.target.value)}
                                placeholder="Contoh: Seekor dinosaurus kecil yang bermain bola di taman..."
                                className="w-full px-4 py-3 bg-[#1F2937] border border-gray-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                disabled={isCbLoading}
                            />
                        </div>
                    </div>
                    <footer className="p-6 bg-[#111827] border-t border-gray-800">
                        <button 
                            onClick={handleGenerateColoringBook}
                            disabled={isCbLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-lg text-lg shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isCbLoading ? 'Sedang Memproses...' : 'Generate 4 Halaman'}
                        </button>
                        {error && <p className="text-red-400 text-xs mt-3 text-center">{error}</p>}
                    </footer>
                </aside>

                {/* -- Right Results Panel (Dark Theme) -- */}
                <main className="flex-1 p-8 overflow-y-auto bg-[#0B0F19]">
                    {cbImages.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
                            {cbImages.map((imgSrc, idx) => (
                                <div key={idx} className="group relative bg-white rounded-xl overflow-hidden shadow-2xl border border-gray-800 transition transform hover:-translate-y-1">
                                    <img src={imgSrc} alt={`Result ${idx}`} className="w-full h-auto object-cover" />
                                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-gray-900 via-gray-900/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <button 
                                            onClick={() => downloadImage(imgSrc, idx, 'coloring-page')}
                                            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2"
                                        >
                                            <DownloadIcon className="w-5 h-5" />
                                            Download Halaman
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                            <ColoringBookIcon className="w-24 h-24 mb-4 opacity-20" />
                            <p className="text-xl font-medium">Belum ada halaman mewarnai.</p>
                            <p className="text-sm mt-2 opacity-60">Masukkan tema cerita di sebelah kiri dan klik Generate.</p>
                        </div>
                    )}
                </main>
            </div>
           )}

        </div>
    </div>
  );
};

export default App;
