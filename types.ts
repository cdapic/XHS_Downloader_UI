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
  language: 'zh' | 'en';
}

export enum DownloadStatus {
  IDLE = 'IDLE',
  DOWNLOADING = 'DOWNLOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface AnalyzeResponse {
  success: boolean;
  data?: any;
  message?: string;
}