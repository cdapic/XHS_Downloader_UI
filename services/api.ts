import { AppConfig, XhsPost, XhsMedia } from '../types';

// Helper to clean mixed text input (e.g., "Check this out http://xhs.com/...")
export const extractUrl = (text: string): string | null => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const match = text.match(urlRegex);
  return match ? match[0] : null;
};

// Helper to determine media type from URL extension
const getMediaType = (url: string): 'image' | 'video' => {
  if (url.includes('.mp4') || url.includes('.mov')) return 'video';
  return 'image';
};

export const analyzeLink = async (url: string, config: AppConfig): Promise<XhsPost> => {
  // If no API URL is set, return a mock for demonstration
  if (!config.apiBaseUrl || config.apiBaseUrl === 'demo') {
    return mockAnalyze(url);
  }

  // Remove trailing slash from base URL
  const baseUrl = config.apiBaseUrl.replace(/\/$/, '');
  
  try {
    // Assuming the standard generic endpoint for the downloader tool
    // Adjust endpoint path '/api/extract' based on the specific Docker image implementation
    const response = await fetch(`${baseUrl}/extract`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiToken ? { 'Authorization': `Bearer ${config.apiToken}` } : {})
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    const data = await response.json();
    return transformApiResponse(data, url);

  } catch (error) {
    console.error("API Request Failed:", error);
    throw error;
  }
};

// Transform the raw API response into our internal XhsPost interface
// Note: This transformation logic depends on JoeanAmier/XHS-Downloader's exact JSON output.
// We implement a robust mapping strategy here.
const transformApiResponse = (data: any, originalUrl: string): XhsPost => {
  // Fallback structure detection
  const title = data.title || data.desc || "Untitled Post";
  const desc = data.desc || "";
  const nickname = data.author?.nickname || data.nickname || "Unknown Author";
  const uid = data.author?.uid || data.user_id || "";
  const avatar = data.author?.avatar || "";

  let media: XhsMedia[] = [];

  // Handle images
  if (Array.isArray(data.images)) {
    media = [
      ...media,
      ...data.images.map((img: string, idx: number) => ({
        url: img,
        type: 'image' as const,
        id: `img-${idx}`
      }))
    ];
  }

  // Handle video
  if (data.video_url) {
    media.push({
      url: data.video_url,
      type: 'video',
      id: 'video-main'
    });
  }

  return {
    title,
    desc,
    author: { nickname, uid, avatar },
    media,
    originalUrl
  };
};

// Mock data for initial setup/testing
const mockAnalyze = async (url: string): Promise<XhsPost> => {
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate latency
  return {
    title: "Summer OOTD | Casual Business Style",
    desc: "Sharing my favorite look for the office this summer. #ootd #business",
    author: {
      nickname: "Fashion_Daily",
      uid: "102938",
      avatar: "https://picsum.photos/100/100"
    },
    originalUrl: url,
    media: [
      { url: "https://picsum.photos/800/1000?random=1", type: 'image', id: '1' },
      { url: "https://picsum.photos/800/1000?random=2", type: 'image', id: '2' },
      { url: "https://picsum.photos/800/1000?random=3", type: 'image', id: '3' },
      // Uncomment to test video
      // { url: "https://www.w3schools.com/html/mov_bbb.mp4", type: 'video', id: '4' } 
    ]
  };
};

// Utility to force download a file in browser
export const downloadFile = async (url: string, filename: string) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
    return true;
  } catch (e) {
    console.error("Download failed, trying fallback", e);
    // Fallback: just open in new tab
    window.open(url, '_blank');
    return false;
  }
};