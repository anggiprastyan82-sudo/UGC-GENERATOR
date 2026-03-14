
import { GoogleGenAI, Part, Type, Modality, GenerateContentResponse } from "@google/genai";
import { SceneStructure } from "../types";

const fileToGenerativePart = async (file: File): Promise<Part> => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

const getAiClient = () => new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
export const generateUgcPlan = async (
    planningPrompt: string,
    sceneCount: number
): Promise<{ scenes: any[], globalCaption: string }> => {
    const ai = getAiClient();
    // Using gemini-3-flash-preview for the planning task as requested and per guidelines
    const model = 'gemini-3-flash-preview';

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            global_caption: { type: Type.STRING },
            scenes: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                        script: { type: Type.STRING },
                        social_caption: { type: Type.STRING },
                        image_prompt: { type: Type.STRING },
                        video_prompt: { type: Type.STRING },
                        overlay_text: { type: Type.STRING },
                    },
                    required: ['title', 'description', 'script', 'image_prompt', 'video_prompt', 'overlay_text']
                }
            }
        },
        required: ['global_caption', 'scenes']
    };

    const response = await ai.models.generateContent({
        model,
        contents: planningPrompt,
        config: { 
          responseMimeType: "application/json", 
          responseSchema,
          thinkingConfig: { thinkingBudget: 0 } // Disable thinking for simple structured JSON output to reduce latency
        }
    });

    const data = JSON.parse(response.text);
    if (!data.scenes || !Array.isArray(data.scenes) || data.scenes.length !== sceneCount) {
        console.error(`Invalid AI response structure. Expected ${sceneCount} scenes, but got:`, data);
        throw new Error(`AI memberikan respon tidak valid. Diharapkan ${sceneCount} adegan, tetapi tidak diterima.`);
    }
    return { scenes: data.scenes, globalCaption: data.global_caption || "" };
};


export const generateUgcImages = async (
  imagePrompts: string[],
  imageParts: { products: Part[], model?: Part },
  modelTier: string // 'gemini-2.5-flash' or 'gemini-3-pro'
): Promise<string[]> => {
    const ai = getAiClient();
    
    // Select model based on user input
    const model = modelTier === 'gemini-3-pro' ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';
    
    const imageConfig = modelTier === 'gemini-3-pro' 
        ? { aspectRatio: "9:16", imageSize: "2K" } 
        : undefined;

    // Combine all product parts and model part
    const allParts = [...imageParts.products];
    if (imageParts.model) {
        allParts.push(imageParts.model);
    }

    const imagePromises = imagePrompts.map(prompt => 
        ai.models.generateContent({
            model,
            contents: { parts: [...allParts, { text: prompt }] },
            config: {
                responseModalities: [Modality.IMAGE],
                imageConfig: imageConfig as any
            },
        }).catch(err => {
            console.error("Image generation failed for a scene:", err);
            return { error: true, message: err.message, details: err.details };
        })
    );

    const responses = await Promise.all(imagePromises);

    return responses.map((response, index) => {
        if ('error' in response) {
           throw new Error(`Pembuatan gambar gagal untuk adegan ${index + 1}.`);
        }
        const imagePart = response.candidates?.[0]?.content?.parts.find(part => part.inlineData);
        if (!imagePart?.inlineData) {
            console.error("Image generation response was missing inlineData:", JSON.stringify(response, null, 2));
            throw new Error(`Pembuatan gambar gagal untuk adegan ${index + 1}.`);
        }
        return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
    });
};

export const regenerateSingleImage = async (
    imagePrompt: string,
    imageParts: { products: Part[], model?: Part },
    modelTier: string // 'gemini-2.5-flash' or 'gemini-3-pro'
): Promise<string> => {
    const ai = getAiClient();
    const model = modelTier === 'gemini-3-pro' ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';
    
    const imageConfig = modelTier === 'gemini-3-pro' 
        ? { aspectRatio: "9:16", imageSize: "2K" } 
        : undefined;
    
    const allParts = [...imageParts.products];
    if (imageParts.model) {
        allParts.push(imageParts.model);
    }

    const response = await ai.models.generateContent({
        model,
        contents: { parts: [...allParts, { text: imagePrompt }] },
        config: {
            responseModalities: [Modality.IMAGE],
            imageConfig: imageConfig as any
        },
    });

    const imagePart = response.candidates?.[0]?.content?.parts.find(part => part.inlineData);
    if (!imagePart?.inlineData) {
        console.error("Image regeneration response was missing inlineData:", JSON.stringify(response, null, 2));
        throw new Error('Gagal membuat ulang gambar.');
    }
    return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
};

export const generateVoiceOver = async (fullScript: string): Promise<string> => {
    const ai = getAiClient();
    const model = 'gemini-2.5-flash-preview-tts';

    const response = await ai.models.generateContent({
        model,
        contents: [{ parts: [{ text: `Dengan nada yang ceria dan ramah dalam Bahasa Indonesia kasual, bacakan naskah berikut: ${fullScript}` }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Kore' }, // A friendly, consistent voice
                },
            },
        },
    });

    const audioPart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    if (!audioPart?.inlineData?.data) {
        throw new Error('Gagal membuat voice over.');
    }
    return `data:audio/mpeg;base64,${audioPart.inlineData.data}`;
};

export const generateVideoFromImage = async (
  imageBase64: string,
  animationPrompt: string,
  script: string,
  withBackgroundMusic: boolean
): Promise<string> => {
    const ai = getAiClient();
    const mimeType = imageBase64.split(';')[0].split(':')[1];
    const imageData = imageBase64.split(',')[1];
    
    const audioInstruction = withBackgroundMusic 
        ? 'AUDIO: Include subtle background music and speech.' 
        : 'AUDIO: Clear speech only. NO BACKGROUND MUSIC. The sound of the model speaking the script.';

    const baseInstructions = `
    STRICT OUTPUT FORMAT: (VERTICAL 9:16 ASPECT RATIO). The final video MUST BE 9:16 PORTRAIT. CROP THE INPUT IMAGE TO FILL THE VERTICAL SCREEN. NO LETTERBOX. NO BLACK BARS.
    NEGATIVE CONSTRAINTS: DO NOT include any TEXT, SUBTITLES, CAPTIONS, WATERMARKS, or LOGOS. DO NOT morph the face. NO DISTORTION of facial features.
    VISUAL QUALITY: High definition, cinematic lighting, social media aesthetic.
    CONSISTENCY: The character's face and identity MUST remain exactly the same as the input image.
    ACTION: ${animationPrompt}. The model should be looking at the camera and speaking naturally.
    CONTEXT: The character is speaking this line: "${script}".
    ${audioInstruction}`;

    const fullPrompt = `(VERTICAL 9:16 VIDEO) ${animationPrompt}. ${baseInstructions}`;

    if (!window.aistudio || !(await window.aistudio.hasSelectedApiKey())) {
        await window.aistudio.openSelectKey();
        if (!(await window.aistudio.hasSelectedApiKey())) {
            throw new Error("Kunci API belum dipilih. Mohon pilih kunci API di panel pengaturan.");
        }
    }

    let operation;
    try {
        operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: fullPrompt,
            image: {
                imageBytes: imageData,
                mimeType: mimeType,
            },
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: '9:16'
            }
        });
    } catch(e: any) {
        if (e.message.includes("API key not valid")) {
             throw new Error("Kunci API tidak valid. Mohon pilih kunci API yang valid.");
        }
        throw e;
    }


    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5 seconds
        operation = await ai.operations.getVideosOperation({ operation: operation });
    }
    
    if (operation.error) {
        console.error("Video generation operation failed:", operation.error);
        throw new Error(`Pembuatan video gagal: ${operation.error.message || 'Kesalahan tidak diketahui pada server AI'}`);
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
        console.error("No video link found in operation response:", operation);
        throw new Error('Pembuatan video gagal atau tidak mengembalikan tautan. Kemungkinan konten diblokir oleh filter keamanan.');
    }
    
    const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    if (!videoResponse.ok) {
        const errorText = await videoResponse.text();
        console.error("Video download failed:", errorText);
        if (errorText.includes("Requested entity was not found.")) {
            throw new Error("Entitas tidak ditemukan. Kunci API Anda mungkin tidak valid.");
        }
        throw new Error(`Gagal mengunduh video yang dihasilkan. Status: ${videoResponse.status}`);
    }

    const videoBlob = await videoResponse.blob();
    return URL.createObjectURL(videoBlob);
};

export const generateImageFromPrompt = async (prompt: string): Promise<string> => {
    const ai = getAiClient();
    const model = 'gemini-3-pro-image-preview';
   
    const response = await ai.models.generateContent({
        model,
        contents: { parts: [{ text: prompt }] },
        config: {
            responseModalities: [Modality.IMAGE],
            imageConfig: {
                aspectRatio: "9:16",
                imageSize: "2K" 
            }
        },
    });

    const imagePart = response.candidates?.[0]?.content?.parts.find(part => part.inlineData);
    if (!imagePart?.inlineData) {
        console.error("Image regeneration response was missing inlineData:", JSON.stringify(response, null, 2));
        throw new Error('Gagal membuat ulang gambar.');
    }
    return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
};

export const editImageFocusProduct = async (file: File, focusDescription: string): Promise<string> => {
    const ai = getAiClient();
    const model = 'gemini-3-pro-image-preview';

    if (!window.aistudio || !(await window.aistudio.hasSelectedApiKey())) {
        await window.aistudio.openSelectKey();
    }

    const imagePart = await fileToGenerativePart(file);

    const prompt = `
    PRODUCT PHOTOGRAPHY REGENERATION:
    - INPUT: The provided image is a specific crop.
    - TARGET OBJECT: "${focusDescription}".
    - TASK: Re-generate this specific object (${focusDescription}) into a high-end, professional e-commerce studio shot.
    - FOCUS: Identify the '${focusDescription}' in this crop and make it the absolute star. Preserve its texture, pattern, and color.
    - CLEANSING: Remove any distracting elements (messy background, other items, awkward cropping lines). If any human body parts (face, hands) are partially visible in this crop and not essential to the product, remove them or fix them.
    - BACKGROUND: Replace the background with a clean, soft, professional studio setting (White, Light Grey, or Soft Pastel).
    - QUALITY: Hyper-realistic, 2K resolution, perfect lighting.
    `;

    const response = await ai.models.generateContent({
        model,
        contents: { parts: [imagePart, { text: prompt }] },
        config: {
            responseModalities: [Modality.IMAGE],
            imageConfig: {
                aspectRatio: "1:1", 
                imageSize: "2K" 
            }
        },
    });

    const resultPart = response.candidates?.[0]?.content?.parts.find(part => part.inlineData);
    if (!resultPart?.inlineData) {
        throw new Error('Gagal memproses gambar produk.');
    }
    return `data:${resultPart.inlineData.mimeType};base64,${resultPart.inlineData.data}`;
};

export const generatePersonalBrandingContent = async (
    comments: string,
    referenceScript: string,
    additionalBrief: string,
    sceneCount: number,
    hookStrategy: string,
    ctaStrategy: string,
    wordCountPerScene: number,
    videoType: string,
    modelPart: Part,
    modelTier: string // 'gemini-2.5-flash' or 'gemini-3-pro'
): Promise<{ scenes: { script: string, imagePrompt: string, overlay: string }[], images: string[], thumbnailTitle: string, socialDescription: string }> => {
    const ai = getAiClient();
    // Using gemini-3-flash-preview for planning/structuring
    const model = 'gemini-3-flash-preview';

    let visualStyleInstruction = "";
    if (videoType === 'podcast') {
        visualStyleInstruction = `GAYA VISUAL (PODCAST STATIS):
        1. Background HARUS KONSISTEN (SAMA PERSIS) di setiap scene. Pilih satu setting (misal: "Aesthetic Podcast Studio with Mic" atau "Modern Home Office").
        2. Jangan ubah lokasi. Ubah hanya sedikit sudut kamera (misal: Medium shot ke Close Up) and ekspresi wajah model.
        3. KONSISTENSI WAJIB: Wajah model harus 100% sama dengan gambar input.
        4. SETTING: Modern Indonesian Podcast Studio aesthetic.`;
    } else if (videoType === 'talking_head_selfie') {
        visualStyleInstruction = `GAYA VISUAL (TALKING HEAD SELFIE):
        1. ANGLE: Handheld Selfie Camera Angle (POV Model memegang HP).
        2. COMPOSITION: Wajah Close-Up, terlihat sebagian bahu/lengan yang memegang kamera untuk kesan otentik.
        3. BACKGROUND: Authentic & Messy (Real Life) - Misal: Di dalam mobil, di kamar tidur yang "lived-in", atau sambil jalan di trotoar.
        4. KONSISTENSI WAJIB: Wajah model harus 100% sama dengan gambar input.
        5. IMPERFECTION: Tambahkan kesan "raw" dan tidak terlalu dipoles (UGC vibe).`;
    } else {
        visualStyleInstruction = `GAYA VISUAL (STORYTELLING DINAMIS - INDONESIA):
        1. LOKASI: Wajib setting INDONESIA modern yang relatable (misal: "Cafe aesthetic di Jakarta Selatan", "Teras rumah minimalis Indonesia", "Jalanan komplek perumahan", "Dalam mobil di kemacetan Jakarta").
        2. Background BERUBAH sesuai konteks cerita, tapi tetap nuansa lokal Indonesia.
        3. KONSISTENSI WAJIB: Wajah model harus 100% sama dengan gambar input.
        4. Kesan: Vlog, Day in my life, Perjalanan.`;
    }

    const prompt = `Anda adalah seorang Content Strategist ahli untuk Personal Branding (Tiktok/Reels) di pasar INDONESIA.
    
    INPUT DATA:
    - Naskah Referensi (Style): "${referenceScript}"
    - Topik/Komentar Audiens: "${comments}"
    - Brief Tambahan: "${additionalBrief || 'Tidak ada'}"
    - Strategi Hook: "${hookStrategy}" 
    - Call to Action (CTA): "${ctaStrategy}"
    - Batas Kata: Maksimal ${wordCountPerScene} kata per scene.
    - Tipe Video: ${videoType}
    
    ${visualStyleInstruction}

    PENTING: Adaptasikan contoh kalimat dalam Strategi Hook "${hookStrategy}" agar relevan dengan Topik/Komentar Audiens. 
    JANGAN menjiplak mentah-mentah contoh hook jika topiknya berbeda. Ambil esensi/struktur psikologisnya saja.

    TUGAS ANDA:
    Buat struktur video pendek ${sceneCount} adegan yang sangat engaging, beserta metadata pendukungnya.

    ATURAN OUTPUT:
    1. THUMBNAIL TITLE: Judul pendek (3-5 kata) yang "clickbait" tapi relevan untuk cover video. Bahasa Indonesia.
    2. DESCRIPTION: Caption media sosial pendek (Maks 50 kata) termasuk 3-5 hashtag relevan (Indonesian market).
    3. SCENES:
       - Script: Bahasa Indonesia, natural, mengikuti style referensi. Gunakan Hook yang sudah diadaptasi di awal dan CTA "${ctaStrategy}" di akhir.
       - Image Prompt: Bahasa INGGRIS. Sangat mendetail.
         * WAJIB DIAWALI DENGAN: "A vertical 9:16 portrait photo of the provided [MODEL] image..."
         * WAJIB ADA: "Subject centered in frame, 9:16 vertical format, NO TEXT, NO WATERMARK."
         * WAJIB ADA: "The person MUST look exactly like the input image."
         * LOKASI: Deskripsikan setting Indonesia modern (misal: "Indonesian minimalist home", "Jakarta street background").
       - Overlay: Teks layar pendek Bahasa Indonesia untuk penekanan.

    Kembalikan JSON valid dengan skema:
    {
      "thumbnail_title": "Judul Cover",
      "social_description": "Caption...",
      "scenes": [ { "script": "...", "image_prompt": "...", "overlay": "..." }, ... ]
    }`;

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            thumbnail_title: { type: Type.STRING },
            social_description: { type: Type.STRING },
            scenes: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        script: { type: Type.STRING },
                        image_prompt: { type: Type.STRING },
                        overlay: { type: Type.STRING },
                    },
                    required: ['script', 'image_prompt', 'overlay']
                }
            }
        },
        required: ['thumbnail_title', 'social_description', 'scenes']
    };

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
            thinkingConfig: { thinkingBudget: 0 }
        }
    });

    const responseData = JSON.parse(response.text);

    const scenesFromAI = responseData.scenes;
    if (!scenesFromAI || !Array.isArray(scenesFromAI) || scenesFromAI.length !== sceneCount) {
        console.error(`Invalid AI response structure. Expected an array of ${sceneCount} scenes, but got:`, JSON.stringify(responseData, null, 2));
        throw new Error(`AI gagal menghasilkan struktur data yang valid. Harap coba lagi.`);
    }

    const scenesData: { script: string, imagePrompt: string, overlay: string }[] = [];
    for (let i = 0; i < scenesFromAI.length; i++) {
        const scene = scenesFromAI[i];
        const imagePrompt = scene.image_prompt;

        if (!imagePrompt || typeof imagePrompt !== 'string' || imagePrompt.trim() === '') {
            throw new Error(`AI gagal menghasilkan prompt gambar yang valid untuk Adegan ${i + 1}.`);
        }

        scenesData.push({
            script: scene.script || '',
            imagePrompt: imagePrompt,
            overlay: scene.overlay || '',
        });
    }

    const images: string[] = [];
    
    const imageModel = modelTier === 'gemini-3-pro' ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';
    const imageConfig = modelTier === 'gemini-3-pro' ? { aspectRatio: "9:16", imageSize: "2K" } : undefined;

    for (let i = 0; i < scenesData.length; i++) {
        if (i > 0) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        try {
            const result = await ai.models.generateContent({
                model: imageModel, 
                contents: { parts: [modelPart, { text: scenesData[i].imagePrompt }] },
                config: { 
                    responseModalities: [Modality.IMAGE],
                    imageConfig: imageConfig as any
                },
            });

            const imagePart = result.candidates?.[0]?.content?.parts.find((part: any) => part.inlineData);
            if (!imagePart?.inlineData) {
                throw new Error(`Gagal ekstrak gambar adegan ${i + 1}`);
            }
            images.push(`data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`);

        } catch (err: any) {
             console.error(`Image generation failed for scene ${i + 1}:`, err);
             throw new Error(`Pembuatan gambar gagal untuk adegan PB ${i + 1}. Pesan: ${err.message}`);
        }
    }

    return { 
        scenes: scenesData, 
        images,
        thumbnailTitle: responseData.thumbnail_title || "My Personal Brand Video",
        socialDescription: responseData.social_description || ""
    };
};

export const generateGemini3Images = async (
    prompt: string,
    aspectRatio: string,
    style: string,
    characterDesc: string,
    hijabStyle: string,
    origin: string,
    nuance: string,
    files: {
        inspiration?: File,
        styleRef?: File,
        background?: File
    }
): Promise<string[]> => {
    const ai = getAiClient();
    const model = 'gemini-3-pro-image-preview'; 

    if (!window.aistudio || !(await window.aistudio.hasSelectedApiKey())) {
        await window.aistudio.openSelectKey();
    }

    const fullPrompt = `
    Generate a high-resolution, ${aspectRatio === '9:16' ? 'vertical portrait' : aspectRatio} image.
    
    MAIN PROMPT: ${prompt}
    
    PARAMETERS:
    - Style: ${style}
    - Character: ${characterDesc} (Origin: ${origin})
    - Hijab Style: ${hijabStyle !== 'None' ? hijabStyle : 'No Hijab'}
    - Setting/Nuance: ${nuance}
    
    INSTRUCTIONS:
    - Ensure photographic quality and realistic textures.
    - If reference images are provided, strictly adhere to the visual cues (style, composition, or subject) as implied by the image inputs.
    - High aesthetic value, professional lighting.
    `;

    const parts: Part[] = [{ text: fullPrompt }];

    const addImagePart = async (file: File, label: string) => {
        const part = await fileToGenerativePart(file);
        parts.push(part);
    };

    if (files.inspiration) await addImagePart(files.inspiration, 'Inspiration');
    if (files.styleRef) await addImagePart(files.styleRef, 'Style Reference');
    if (files.background) await addImagePart(files.background, 'Background Reference');

    const generateRequest = () => ai.models.generateContent({
        model,
        contents: { parts },
        config: {
            responseModalities: [Modality.IMAGE],
            imageConfig: {
                aspectRatio: aspectRatio as any, 
                imageSize: "2K" 
            }
        }
    });

    try {
        const promises = [1, 2, 3, 4].map(() => generateRequest());
        const responses = await Promise.all(promises);

        const imageUrls: string[] = [];
        responses.forEach(response => {
             const imagePart = response.candidates?.[0]?.content?.parts.find(part => part.inlineData);
             if (imagePart?.inlineData) {
                 imageUrls.push(`data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`);
             }
        });
        
        if (imageUrls.length === 0) {
            throw new Error("No images were generated.");
        }

        return imageUrls;

    } catch (e: any) {
        console.error("Gemini 3 Image Generation Error:", e);
        if (e.message && e.message.includes("API key")) {
             throw new Error("API Key issue. Please re-select your key.");
        }
        throw new Error(e.message || "Failed to generate images.");
    }
};

export const generateColoringBookImages = async (
    theme: string
): Promise<string[]> => {
    const ai = getAiClient();
    const model = 'gemini-3-pro-image-preview';

    if (!window.aistudio || !(await window.aistudio.hasSelectedApiKey())) {
        await window.aistudio.openSelectKey();
    }

    const fullPrompt = `
    Create a clean, black and white coloring book page for children based on the theme: "${theme}".
    
    INSTRUCTIONS:
    - Style: Vector-like, thick clean outlines, simplistic but engaging.
    - Color: STRICTLY BLACK AND WHITE. No grayscale, no shading, no colors.
    - Background: Pure white.
    - Content: Cute, friendly, appropriate for children.
    - Composition: Centered, high clarity.
    `;

    const generateRequest = () => ai.models.generateContent({
        model,
        contents: { parts: [{ text: fullPrompt }] },
        config: {
            responseModalities: [Modality.IMAGE],
            imageConfig: {
                aspectRatio: "3:4", 
                imageSize: "2K" 
            }
        }
    });

    try {
        const promises = [1, 2, 3, 4].map(() => generateRequest());
        const responses = await Promise.all(promises);

        const imageUrls: string[] = [];
        responses.forEach(response => {
             const imagePart = response.candidates?.[0]?.content?.parts.find(part => part.inlineData);
             if (imagePart?.inlineData) {
                 imageUrls.push(`data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`);
             }
        });
        
        if (imageUrls.length === 0) {
            throw new Error("No coloring pages were generated.");
        }

        return imageUrls;

    } catch (e: any) {
        console.error("Coloring Book Generation Error:", e);
        if (e.message && e.message.includes("API key")) {
             throw new Error("API Key issue. Please re-select your key.");
        }
        throw new Error(e.message || "Failed to generate coloring pages.");
    }
};

export { fileToGenerativePart };
