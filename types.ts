export interface XhsMedia {
  url: string;
  type: 'image' | 'video';
  id: string;
}

export interface XhsPost {
  title: string;
  desc: string;
  author: {
    nickname: string;
    uid: string;
    avatar: string;
  };
  media: XhsMedia[];
  originalUrl: string;
}

export interface AppConfig {
  apiBaseUrl: string;
  apiToken?: string;
}

export enum DownloadStatus {
  IDLE = 'IDLE',
  DOWNLOADING = 'DOWNLOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface AnalyzeResponse {
  success: boolean;
  data?: any; // Flexible based on actual API response structure
  message?: string;
}