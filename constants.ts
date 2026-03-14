
import { SceneStructure } from './types';

// Helper for CTA Instruction
const getCtaInstruction = (isActive: boolean) => {
    if (!isActive) return "";
    return `
      INSTRUKSI KHUSUS CTA (KERANJANG KUNING) - HIGH CTR MODE:
      - User mengaktifkan mode "Aggressive Sales / Keranjang Kuning". 
      - SETIAP SCENE (Scene 1 s/d Terakhir) WAJIB diakhiri dengan kalimat pemicu (Hook) yang mengarah ke Keranjang Kuning.
      - GAYA BAHASA: Bikin penasaran, FOMO (Fear Of Missing Out), Urgensi tinggi, Sedikit "Mengancam" halus (Loss Aversion).
      - KEYWORDS WAJIB: "Cek stok", "Flash sale", "Payday", "Rugi banget", "Harga miring", "Sebelum habis".
      - CONTOH ENDING SCRIPT PER SCENE: "...buruan cek keranjang kuning sebelum nyesel!", "...harga segini cuma pas live/payday, cek sekarang!", "...stok sisa dikit banget, amanin punya kamu!".
    `;
};

// Helper for Caption Instruction
const getCaptionInstruction = (isActive: boolean) => {
    if (isActive) {
        return `
        TUGAS CAPTION (Mode CTA Aktif):
        - Karena mode CTA aktif per scene, buatlah 'social_caption' UNIK untuk SETIAP scene.
        - Panjang Maksimal: 40 Karakter.
        - Isi: Kalimat singkat padat + Hashtag. Contoh: "Diskon 50% 🔥 #FlashSale", "Cek Keranjang 👇 #RacunShopee".
        - Field 'global_caption' di root JSON boleh dikosongkan.
        `;
    } else {
        return `
        TUGAS CAPTION (Mode CTA Non-Aktif):
        - Field 'social_caption' di dalam scene kosongkan saja.
        - Buatlah SATU 'global_caption' yang menarik di root JSON untuk deskripsi keseluruhan video.
        - Panjang: Maks 50 kata + 3 Hashtag relevan.
        `;
    }
}

export const SCENE_STRUCTURES: SceneStructure[] = [
  {
    id: 'problem-solution',
    name: 'Problem/Solution (Default)',
    description: 'Classic marketing funnel: hook, problem, solution, CTA.',
    requiredParts: ['product', 'model'],
    planningPrompt: (productName, additionalBrief, sceneCount, ctaPerScene, wordCount) => `Bertindaklah sebagai Sutradara Iklan Video Vertikal profesional (UGC Filmmaker) di INDONESIA. 
      Tugas Anda adalah membuat storyboard visual yang SANGAT KONSISTEN untuk produk "${productName}".

      PERAN ANDA: CONSISTENCY DIRECTOR.
      KONTEKS PASAR: INDONESIA. Gunakan referensi gaya visual yang relatable untuk audiens Indonesia.
      ${getCtaInstruction(ctaPerScene)}
      ${getCaptionInstruction(ctaPerScene)}

      ATURAN VISUAL WAJIB (STRICT VISUAL RULES):
      1. RASIO ASPEK: Semua image_prompt HARUS dimulai dengan kalimat: "A vertical 9:16 portrait photo".
      2. SUMBER GAMBAR: Anda HARUS merujuk pada input gambar model dan produk yang diberikan. Jangan mengarang wajah baru.
      3. KONSISTENSI: Fitur wajah, gaya rambut, dan pakaian model harus 100% konsisten antar scene.
      4. BERSIH: Tidak boleh ada teks, tulisan, atau watermark di dalam gambar.
      5. SETTING: Gunakan latar belakang yang relevan dengan Indonesia (modern housing, jakarta streets, etc) jika outdoor.
      
      Struktur Storyboard: 
      - Scene Awal: Masalah yang relatable.
      - Scene Tengah: Solusi dengan produk.
      - Scene Akhir: Hasil & Kebahagiaan.
      ${additionalBrief ? `Instruksi tambahan dari user: ${additionalBrief}` : ''}

      Kembalikan JSON valid dengan kunci "global_caption" (string) dan "scenes" (array ${sceneCount} objek).
      Setiap objek scene HARUS memiliki:
      1. "title": Judul adegan.
      2. "description": Penjelasan alur.
      3. "script": Voice-over (Bahasa Indonesia, natural, MAKSIMAL ${wordCount} KATA).
      4. "social_caption": Caption singkat per scene (jika mode CTA aktif).
      5. "image_prompt": Prompt visual bahasa Inggris yang SANGAT DETAIL. 
         FORMAT PROMPT: "A vertical 9:16 portrait photo. The provided [MODEL] image is [AKSI] with the provided [PRODUK] image in [LOKASI]. Subject centered in frame with headroom for vertical cropping. The model has [EKSPRESI]. The product packaging is clearly visible. Modern Indonesian aesthetic, professional lighting. NO TEXT, NO WATERMARKS."
      6. "video_prompt": Instruksi animasi atau gerakan kamera dalam BAHASA INDONESIA (misal: "Model menghela nafas dan menggelengkan kepala", "Model mengangkat produk dan tersenyum", "Kamera zoom in perlahan ke produk").
      7. "overlay_text": Teks layar (Bahasa Indonesia, singkat & "nendang").`
  },
  {
    id: 'fashion-lifestyle',
    name: 'Fashion / Lifestyle',
    description: 'Showcase apparel or accessories in stylish settings.',
    requiredParts: ['product', 'model'],
    planningPrompt: (productName, additionalBrief, sceneCount, ctaPerScene, wordCount) => `Bertindaklah sebagai Fashion Director di INDONESIA. Buat storyboard video Fashion "${productName}" yang aesthetic.
      ${getCtaInstruction(ctaPerScene)}
      ${getCaptionInstruction(ctaPerScene)}

      ATURAN VISUAL WAJIB:
      1. FORMAT: Selalu mulai dengan "A vertical 9:16 portrait photo".
      2. SUMBER GAMBAR: Gunakan gambar model dan produk yang diupload. Wajah model HARUS SAMA PERSIS di semua scene.
      3. BERSIH: Gambar bersih tanpa teks/watermark.
      4. LOKASI: Tempat nongkrong hits di Jakarta/Indonesia (misal: SCBD vibe, Cafe Kemang, dll) atau studio minimalis.
      
      Struktur: 
      - Scene 1: Full Body Outfit Check (OOTD).
      - Scene 2: Detail bahan/tekstur produk (Close up).
      - Scene 3: Movement/Pose dinamis.
      - Scene 4: CTA (Pose cool).
      ${additionalBrief ? `Instruksi tambahan: ${additionalBrief}` : ''}

      Kembalikan JSON valid dengan kunci "global_caption" dan "scenes" (array ${sceneCount} objek).
      Setiap objek scene HARUS memiliki:
      1. "title": Judul.
      2. "description": Penjelasan.
      3. "script": Voice-over (Bahasa Indonesia, stylish, MAKSIMAL ${wordCount} KATA).
      4. "social_caption": Caption singkat per scene (jika mode CTA aktif).
      5. "image_prompt": Prompt visual bahasa Inggris. 
         FORMAT: "A vertical 9:16 portrait fashion shot. Subject centered in frame with headroom for vertical cropping. The provided [MODEL] image is wearing/holding the provided [PRODUK] image. Pose is [POSE]. Background is [LOKASI - Modern Indonesian Setting]. Cinematic lighting, 4k resolution, trending on instagram. NO TEXT IN BACKGROUND."
      6. "video_prompt": Instruksi animasi atau gerakan kamera dalam BAHASA INDONESIA (misal: "Model berputar memperlihatkan baju", "Rambut model tertiup angin", "Model berjalan percaya diri ke arah kamera").
      7. "overlay_text": Teks layar (Bahasa Indonesia, minimalis).`
  },
  {
    id: 'fashion-sales-hard',
    name: 'Fashion Sales 2 (Hard Selling)',
    description: 'Pola penjualan efektif: Hook, Material, Harga, Fitur, Sizing, CTA.',
    requiredParts: ['product', 'model'],
    planningPrompt: (productName, additionalBrief, sceneCount, ctaPerScene, wordCount) => `Bertindaklah sebagai SALES COPYWRITER & FASHION VIDEOGRAPHER expert di Indonesia.
      Produk: "${productName}".
      Tujuan: Hard Selling dengan konversi tinggi menggunakan psikologi penjualan.
      
      GAYA BAHASA & TONE:
      - Antusias, meyakinkan, dan "Racun Shopee/Tiktok".
      - Gunakan istilah sales: "Worth it banget", "Murah cekali", "Anti-gagal", "Amankan sekarang".
      - Tekankan value for money.

      ${getCtaInstruction(ctaPerScene)}
      ${getCaptionInstruction(ctaPerScene)}

      ATURAN STRUKTUR SCRIPT (WAJIB IKUTI ALUR INI):
      Bagilah alur berikut ke dalam ${sceneCount} adegan secara proporsional:
      1. HOOK & RELEVANSI: Buka dengan statement kuat (misal: "Outfit Lebaran Anti-Gagal" atau solusi masalah).
      2. TRANSISI/TESTIMONI: Ungkapkan kepuasan ("Aku nemu ini dan beneran bagus!").
      3. VALUE PROP 1 (MATERIAL): Fokus pada bahan (Adem, Premium, Ironless). Zoom in visual kain.
      4. VALUE PROP 2 (HARGA): Fokus pada "Under X Ribu" atau "Harga miring". Ekspresi kaget/senang.
      5. VALUE PROP 3 (FITUR/SIZING): Busui/Wudhu friendly, muat BB besar, saku, dll.
      6. CTA & URGENSI: Scarcity ("Stok sisa dikit", "Diskon Payday").
      
      ${additionalBrief ? `DATA PRODUK TAMBAHAN DARI USER (Gunakan ini untuk detail material/fitur): ${additionalBrief}` : ''}

      ATURAN VISUAL WAJIB:
      1. FORMAT: "A vertical 9:16 portrait photo".
      2. KONSISTENSI: Wajah model HARUS SAMA dengan gambar input.
      3. DETAIL PRODUK: Close-up pada tekstur kain saat membahas material.

      Kembalikan JSON valid dengan kunci "global_caption" dan "scenes" (array ${sceneCount} objek).
      Setiap objek HARUS memiliki:
      1. "title": Judul (misal: "Keunggulan Material").
      2. "description": Penjelasan visual.
      3. "script": Voice-over (Bahasa Indonesia, SALES TONE, MAKSIMAL ${wordCount} KATA).
      4. "social_caption": Caption singkat per scene (jika mode CTA aktif).
      5. "image_prompt": Prompt visual bahasa Inggris.
         FORMAT: "A vertical 9:16 portrait fashion photo. Subject centered. The provided [MODEL] image is wearing [PRODUK]. Action: [AKSI SESUAI SCRIPT - Misal: Showing texture, pointing to price tag, spinning]. Background: [Modern Studio/Indoor]. High key lighting. NO TEXT."
      6. "video_prompt": Instruksi animasi (Bahasa Indonesia). Contoh: "Kamera zoom in ke tekstur kain", "Model berputar menunjukkan cuttingan baju", "Model menunjuk ke layar dengan antusias".
      7. "overlay_text": Teks layar yang "NENDANG" (Misal: "Under 200K!", "Busui Friendly", "Muat BB 80Kg").`
  },
   {
    id: 'digital-service',
    name: 'Digital / Service',
    description: 'Perfect for apps, software, or service-based offerings.',
    requiredParts: ['product', 'model'],
    planningPrompt: (productName, additionalBrief, sceneCount, ctaPerScene, wordCount) => `Bertindaklah sebagai Tech Content Creator Indonesia. Buat storyboard untuk aplikasi/jasa "${productName}".
      ${getCtaInstruction(ctaPerScene)}
      ${getCaptionInstruction(ctaPerScene)}

      ATURAN VISUAL WAJIB:
      1. FORMAT: "A vertical 9:16 portrait photo".
      2. KONSISTENSI: Gunakan wajah model dari gambar input.
      3. INTERAKSI: Model memegang HP/Laptop.
      4. SETTING: Kantor atau Rumah modern di Indonesia.
      
      Struktur: 
      - Scene 1: Masalah/Kesulitan lama.
      - Scene 2: Menemukan Aplikasi di HP.
      - Scene 3: Demonstrasi kemudahan.
      - Scene 4: Hasil Bahagia/Lega.
      ${additionalBrief ? `Instruksi tambahan: ${additionalBrief}` : ''}

      Kembalikan JSON valid dengan kunci "global_caption" dan "scenes" (array ${sceneCount} objek).
      Setiap objek HARUS memiliki:
      1. "title": Judul.
      2. "description": Penjelasan.
      3. "script": Voice-over (Bahasa Indonesia, jelas, MAKSIMAL ${wordCount} KATA).
      4. "social_caption": Caption singkat per scene (jika mode CTA aktif).
      5. "image_prompt": Prompt visual bahasa Inggris. 
         FORMAT: "A vertical 9:16 portrait photo. Subject centered in frame with headroom for vertical cropping. The provided [MODEL] image is holding a smartphone showing the [PRODUK] interface. The model is [AKSI]. Modern Indonesian indoor background, bright lighting. NO TEXT OVERLAYS."
      6. "video_prompt": Instruksi animasi atau gerakan kamera dalam BAHASA INDONESIA (misal: "Jari model mengetuk layar HP", "Model melihat HP lalu tersenyum puas", "Kamera fokus pada layar HP").
      7. "overlay_text": Teks layar (Bahasa Indonesia, poin kunci).`
  },
   {
    id: 'food-beverage',
    name: 'Food / Beverage',
    description: 'Tempting shots for food products or restaurants.',
    requiredParts: ['product', 'model'],
    planningPrompt: (productName, additionalBrief, sceneCount, ctaPerScene, wordCount) => `Bertindaklah sebagai Food Videographer Indonesia. Buat storyboard yang menggugah selera untuk "${productName}".
      ${getCtaInstruction(ctaPerScene)}
      ${getCaptionInstruction(ctaPerScene)}

      ATURAN VISUAL WAJIB:
      1. FORMAT: "A vertical 9:16 portrait photo".
      2. APPETITE APPEAL: Fokus pada tekstur dan kesegaran produk (gunakan gambar produk input).
      3. MODEL: Gunakan model input saat scene makan/minum.
      
      Struktur: 
      - Scene 1: Close-up Menggoda (Food porn).
      - Scene 2: Model mengambil gigitan/tegukan pertama.
      - Scene 3: Ekspresi "Enak banget!" (Genuine reaction).
      - Scene 4: Produk di meja.
      ${additionalBrief ? `Instruksi tambahan: ${additionalBrief}` : ''}

      Kembalikan JSON valid dengan kunci "global_caption" dan "scenes" (array ${sceneCount} objek).
      Setiap objek HARUS memiliki:
      1. "title": Judul.
      2. "description": Penjelasan.
      3. "script": Voice-over (Bahasa Indonesia, deskriptif, MAKSIMAL ${wordCount} KATA).
      4. "social_caption": Caption singkat per scene (jika mode CTA aktif).
      5. "image_prompt": Prompt visual bahasa Inggris. 
         FORMAT: "A vertical 9:16 portrait close-up photo. Subject centered in frame with headroom for vertical cropping. The provided [PRODUK] image looks delicious. The provided [MODEL] image is holding the food/drink. Depth of field, vibrant colors, high end food photography. NO TEXT."
      6. "video_prompt": Instruksi animasi atau gerakan kamera dalam BAHASA INDONESIA (misal: "Uap panas mengepul dari makanan", "Model menggigit makanan dengan nikmat", "Saus menetes perlahan").
      7. "overlay_text": Teks layar (Bahasa Indonesia).`
  },
  {
    id: 'vlog-review',
    name: 'Vlog Ulasan Natural',
    description: 'Gaya ulasan produk yang jujur dan otentik.',
    requiredParts: ['product', 'model'],
    planningPrompt: (productName, additionalBrief, sceneCount, ctaPerScene, wordCount) => `Bertindaklah sebagai Influencer Jujur (Reviewer) Indonesia. Buat storyboard vlog review untuk "${productName}".
      ${getCtaInstruction(ctaPerScene)}
      ${getCaptionInstruction(ctaPerScene)}

      ATURAN VISUAL WAJIB:
      1. FORMAT: "A vertical 9:16 portrait photo".
      2. SUMBER: Wajib menggunakan gambar model dan produk yang diinput.
      3. GAYA KAMERA: Selfie-style.
      4. SETTING: Kamar kost atau Rumah Indonesia yang rapi.
      
      Struktur: 
      - Scene 1: Sapaan "Hi Guys" + Tunjukkan Barang.
      - Scene 2: Zoom in ke produk (Detail).
      - Scene 3: Demo Singkat pemakaian.
      - Scene 4: Final Verdict/Rating.
      ${additionalBrief ? `Instruksi tambahan: ${additionalBrief}` : ''}

      Kembalikan JSON valid dengan kunci "global_caption" dan "scenes" (array ${sceneCount} objek).
      Setiap objek HARUS memiliki:
      1. "title": Judul.
      2. "description": Penjelasan.
      3. "script": Voice-over (Bahasa Indonesia, santai, MAKSIMAL ${wordCount} KATA).
      4. "social_caption": Caption singkat per scene (jika mode CTA aktif).
      5. "image_prompt": Prompt visual bahasa Inggris. 
         FORMAT: "A vertical 9:16 portrait selfie-style photo. Subject centered in frame with headroom for vertical cropping. The provided [MODEL] image is holding the provided [PRODUK] image next to their face. Indonesian Bedroom or Living room background. Authentic UGC look. NO TEXT ON IMAGE."
      6. "video_prompt": Instruksi animasi atau gerakan kamera dalam BAHASA INDONESIA (misal: "Tangan model sedikit memutar produk", "Kepala model bergerak natural saat bicara", "Model menunjuk ke produk di tangannya").
      7. "overlay_text": Teks layar (Bahasa Indonesia).`
  },
  {
    id: 'unboxing',
    name: 'Unboxing Produk',
    description: 'Menangkap keseruan membuka produk baru.',
    requiredParts: ['product', 'model'],
    planningPrompt: (productName, additionalBrief, sceneCount, ctaPerScene, wordCount) => `Bertindaklah sebagai Unboxing Specialist. Buat storyboard unboxing seru untuk "${productName}".
      ${getCtaInstruction(ctaPerScene)}
      ${getCaptionInstruction(ctaPerScene)}

      ATURAN VISUAL WAJIB:
      1. FORMAT: "A vertical 9:16 portrait photo".
      2. KONSISTENSI: Pastikan bentuk produk sesuai gambar input.
      
      Struktur: 
      - Scene 1: Paket masih tersegel di meja.
      - Scene 2: Proses membuka (Tangan model terlihat).
      - Scene 3: Produk dikeluarkan dari box (First look).
      - Scene 4: Model memegang produk sambil tersenyum.
      ${additionalBrief ? `Instruksi tambahan: ${additionalBrief}` : ''}

      Kembalikan JSON valid dengan kunci "global_caption" dan "scenes" (array ${sceneCount} objek).
      Setiap objek HARUS memiliki:
      1. "title": Judul.
      2. "description": Penjelasan.
      3. "script": Voice-over (Bahasa Indonesia, antusias, MAKSIMAL ${wordCount} KATA).
      4. "social_caption": Caption singkat per scene (jika mode CTA aktif).
      5. "image_prompt": Prompt visual bahasa Inggris. 
         FORMAT: "A vertical 9:16 portrait photo. Subject centered in frame with headroom for vertical cropping. High angle shot looking down at a table. The provided [MODEL] image hands are opening the provided [PRODUK] packaging. Clean aesthetic table surface. NO TEXT."
      6. "video_prompt": Instruksi animasi atau gerakan kamera dalam BAHASA INDONESIA (misal: "Tangan merobek segel paket", "Mengangkat tutup kotak perlahan", "Mengambil produk dari dalam kotak").
      7. "overlay_text": Teks layar (Bahasa Indonesia).`
  },
  {
    id: 'storytelling-camera',
    name: 'Storytelling (Depan Kamera)',
    description: 'Berbagi pengalaman, opini, atau cerita personal (Bukan Hard Selling).',
    requiredParts: ['model'],
    planningPrompt: (productName, additionalBrief, sceneCount, ctaPerScene, wordCount) => `Bertindaklah sebagai Storyteller Indonesia yang Emosional dan Relatable.
      TOPIK CERITA: "${productName}". 
      PERHATIAN: Ini BUKAN video jualan langsung. Ini adalah video berbagi pengalaman, perasaan, atau perjalanan hidup terkait topik tersebut.
      Gunakan "${productName}" sebagai konteks atau objek cerita, bukan barang dagangan semata.
      ${getCtaInstruction(ctaPerScene)}
      ${getCaptionInstruction(ctaPerScene)}

      ATURAN VISUAL WAJIB:
      1. FORMAT: "A vertical 9:16 portrait photo".
      2. KONSISTENSI: Pertahankan wajah model (input) di setiap scene.
      3. STYLE: Candid, personal, deep connection.
      4. SETTING: Lokasi di Indonesia (misal: Kamar, Mobil, Taman Kota, Cafe Lokal).
      
      Struktur Storyboard: 
      - Scene 1: Hook Emosional/Vulnerable (Ekspresi berpikir/sedih/penasaran).
      - Scene 2: Perjalanan/Konflik (Menceritakan pengalaman).
      - Scene 3: Titik Balik/Realisasi (Model terlihat tercerahkan/senyum tipis).
      - Scene 4: Ajakan Relate/Sharing (Model tersenyum ramah ke kamera, mengajak audiens cerita).
      ${additionalBrief ? `Instruksi tambahan: ${additionalBrief}` : ''}

      Kembalikan JSON valid dengan kunci "global_caption" dan "scenes" (array ${sceneCount} objek).
      Setiap objek HARUS memiliki:
      1. "title": Judul.
      2. "description": Penjelasan.
      3. "script": Voice-over (Bahasa Indonesia, emosional/deep, MAKSIMAL ${wordCount} KATA).
      4. "social_caption": Caption singkat per scene (jika mode CTA aktif).
      5. "image_prompt": Prompt visual bahasa Inggris. 
         FORMAT: "A vertical 9:16 portrait close-up shot of the provided [MODEL] image. Subject centered in frame with headroom for vertical cropping. Eye contact with camera. Expression is [EMOSI]. Indonesian aesthetic background. Cinematic depth of field. NO TEXT. NO WATERMARK."
      6. "video_prompt": Instruksi animasi atau gerakan kamera dalam BAHASA INDONESIA (misal: "Model berbicara menatap lensa dengan emosional", "Model mengangguk pelan sambil bicara", "Model tersenyum tipis ke arah kamera").
      7. "overlay_text": Teks layar (Bahasa Indonesia, pertanyaan atau kalimat puitis).`
  },
  {
    id: 'talking-head-awareness',
    name: 'Talking Head (Opini & Edukasi)',
    description: 'Menyampaikan opini, insight, atau edukasi. Mengajak diskusi/share.',
    requiredParts: ['model'],
    planningPrompt: (productName, additionalBrief, sceneCount, ctaPerScene, wordCount) => `Bertindaklah sebagai Thought Leader atau Opinion Maker Indonesia. 
      TOPIK PEMBAHASAN: "${productName}".
      TUJUAN: Memberikan value, edukasi, atau opini tajam. BUKAN JUALAN.
      CTA (Call to Action): Mengajak audiens berdiskusi di komentar atau share video ini.
      ${getCtaInstruction(ctaPerScene)}
      ${getCaptionInstruction(ctaPerScene)}

      ATURAN VISUAL WAJIB:
      1. FORMAT: "A vertical 9:16 portrait photo".
      2. KONSISTENSI: Gunakan wajah model input secara ketat. Pakaian rapi/smart casual.
      3. STYLE: Professional Content Creator, Podcast style, atau Interview style.
      4. SETTING: Studio Podcast Minimalis atau Ruang Kerja Modern Indonesia.
      
      Struktur Storyboard: 
      - Scene 1: Hook Kontroversial atau "Did you know?".
      - Scene 2: Penjelasan Masalah/Fakta (Gestur tangan menjelaskan).
      - Scene 3: Opini/Insight Utama Anda (Point of View unik).
      - Scene 4: Pertanyaan untuk Audiens/Ajakan Share (Tunjuk ke bawah/layar).
      ${additionalBrief ? `Instruksi tambahan: ${additionalBrief}` : ''}

      Kembalikan JSON valid dengan kunci "global_caption" dan "scenes" (array ${sceneCount} objek).
      Setiap objek HARUS memiliki:
      1. "title": Judul.
      2. "description": Penjelasan.
      3. "script": Voice-over (Bahasa Indonesia, tegas, edukatif, MAKSIMAL ${wordCount} KATA).
      4. "social_caption": Caption singkat per scene (jika mode CTA aktif).
      5. "image_prompt": Prompt visual bahasa Inggris. 
         FORMAT: "A vertical 9:16 portrait shot of the provided [MODEL] image looking directly at the camera lens. Subject centered in frame with headroom for vertical cropping. Professional lighting. Clean modern background (Indonesian context). Hand gestures suitable for explaining. NO TEXT OR GRAPHICS."
      6. "video_prompt": Instruksi animasi atau gerakan kamera dalam BAHASA INDONESIA (misal: "Model berbicara intens ke kamera", "Tangan model memberi gestur menjelaskan", "Model menunjuk ke bawah saat memberikan CTA").
      7. "overlay_text": Teks layar (Bahasa Indonesia, headline topik).`
  }
];
