export enum AppMode {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO'
}

export interface ProcessingState {
  status: 'idle' | 'uploading' | 'processing' | 'completed' | 'error';
  message?: string;
  progress?: number;
}

export interface GeneratedContent {
  originalUrl: string;
  processedUrl: string | null;
  type: 'image' | 'video';
  metadata?: any;
}
