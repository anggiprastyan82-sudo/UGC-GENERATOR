import { GoogleGenAI } from "@google/genai";

// AI client ambil API key langsung dari environment variable GEMINI_API_KEY
const ai = new GoogleGenAI({});

export async function generateUGC(prompt: string) {
    if (!prompt || prompt.trim() === "") throw new Error("Prompt tidak boleh kosong!");

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
    });

    return response.text;
}
