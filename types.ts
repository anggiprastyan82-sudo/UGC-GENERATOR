
export enum GenerationStatus {
  PENDING = 'PENDING',
  GENERATING_IMAGE = 'GENERATING_IMAGE',
  IMAGE_READY = 'IMAGE_READY',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
}

export interface Scene {
  id: number;
  title: string;
  description: string;
  image: string; // base64 data URL
  script: string;
  overlayTextSuggestion?: string;
  socialCaption?: string; // New: Caption per scene
  status: GenerationStatus;
  errorMessage?: string;
  imagePrompt: string;
}

export interface SceneStructure {
    id: string;
    name: string;
    description: string;
    requiredParts: ('product' | 'model')[];
    planningPrompt: (productName: string, additionalBrief: string, sceneCount: number, ctaPerScene: boolean, wordCount: number) => string;
}
