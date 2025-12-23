import React, { useState } from 'react';
import { Download, ExternalLink, Check, Loader2, Play } from 'lucide-react';
import { XhsMedia, DownloadStatus } from '../types';
import { downloadFile } from '../services/api';

interface MediaCardProps {
  media: XhsMedia;
  index: number;
}

const MediaCard: React.FC<MediaCardProps> = ({ media, index }) => {
  const [status, setStatus] = useState<DownloadStatus>(DownloadStatus.IDLE);

  const handleDownload = async () => {
    setStatus(DownloadStatus.DOWNLOADING);
    const extension = media.type === 'video' ? 'mp4' : 'jpg';
    const filename = `xhs_media_${index + 1}_${Date.now()}.${extension}`;
    
    try {
      await downloadFile(media.url, filename);
      setStatus(DownloadStatus.SUCCESS);
      setTimeout(() => setStatus(DownloadStatus.IDLE), 2000);
    } catch (error) {
      setStatus(DownloadStatus.ERROR);
      setTimeout(() => setStatus(DownloadStatus.IDLE), 3000);
    }
  };

  return (
    <div className="group relative bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Media Content */}
      <div className="aspect-[3/4] bg-slate-100 relative overflow-hidden">
        {media.type === 'video' ? (
          <div className="w-full h-full relative flex items-center justify-center bg-black">
            <video 
              src={media.url} 
              className="w-full h-full object-contain" 
              controls={false}
              muted
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
                <Play className="w-8 h-8 text-white fill-white" />
              </div>
            </div>
            <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 text-white text-xs rounded">
              Video
            </div>
          </div>
        ) : (
          <img 
            src={media.url} 
            alt={`Media ${index}`} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        )}
        
        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-end justify-between p-3 opacity-0 group-hover:opacity-100 md:opacity-0 md:group-hover:opacity-100 sm:opacity-100">
          <div className="flex gap-2 w-full">
             <button
              onClick={() => window.open(media.url, '_blank')}
              className="flex-1 bg-white/90 hover:bg-white text-slate-700 backdrop-blur-sm py-2 rounded-md text-xs font-medium flex items-center justify-center gap-1 shadow-sm transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View
            </button>
            <button
              onClick={handleDownload}
              disabled={status === DownloadStatus.DOWNLOADING}
              className={`flex-1 text-white backdrop-blur-sm py-2 rounded-md text-xs font-medium flex items-center justify-center gap-1 shadow-sm transition-all ${
                status === DownloadStatus.SUCCESS 
                  ? 'bg-green-500/90' 
                  : status === DownloadStatus.ERROR 
                    ? 'bg-red-500/90' 
                    : 'bg-primary-600/90 hover:bg-primary-600'
              }`}
            >
              {status === DownloadStatus.DOWNLOADING ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : status === DownloadStatus.SUCCESS ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              {status === DownloadStatus.SUCCESS ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile-only visible action bar (since hover doesn't work well on mobile) */}
      <div className="md:hidden flex items-center justify-between px-3 py-2 border-t border-slate-100 bg-slate-50">
         <span className="text-xs text-slate-500 font-mono">#{index + 1}</span>
         <button 
           onClick={handleDownload}
           className="text-primary-600 hover:text-primary-700"
         >
           <Download className="w-4 h-4" />
         </button>
      </div>
    </div>
  );
};

export default MediaCard;