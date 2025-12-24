import React, { useState, useEffect } from "react";
import {
  Search,
  Settings,
  Download,
  AlertCircle,
  CheckCircle2,
  Copy,
  FileJson,
  Image as ImageIcon,
  Link as LinkIcon,
} from "lucide-react";
import { AppConfig, XhsPost, DownloadStatus } from "./types";
import { analyzeLink, extractUrl, downloadFile } from "./services/api";
import SettingsModal from "./components/SettingsModal";
import MediaCard from "./components/MediaCard";

const STORAGE_KEY = "xhs_manager_config";

const translations = {
  zh: {
    appName: "小红书素材下载UI",
    demoTag: "NAS部署",
    searchLabel: "粘贴小红书分享文本或链接",
    searchPlaceholder: "例如：53 http://xhslink.com/...",
    analyze: "解析",
    processing: "处理中",
    tip: "提示：您可以粘贴从 App 复制的整段文本，我们会自动提取链接。",
    analysisFailed: "解析失败",
    demoNote: "您正处于演示模式。请在设置中配置您的真实 Docker API 端点。",
    authorInfo: "作者信息",
    postTitle: "笔记标题",
    postDesc: "笔记内容",
    assetActions: "素材操作",
    downloadAll: "下载全部素材",
    downloading: "正在下载...",
    copyDesc: "复制文案",
    mediaAssets: "媒体素材",
    noMedia: "未发现媒体素材。",
    view: "查看",
    save: "保存",
    saved: "已保存",
    copyright: "© 2025 XHS_Downloader_UI. 为 XHS-Downloader 设计。",
    docs: "文档",
    privacy: "隐私",
  },
  en: {
    appName: "XHS_Downloader_UI",
    demoTag: "for NAS",
    searchLabel: "Paste Xiaohongshu Share Text or URL",
    searchPlaceholder: "e.g. 53 http://xhslink.com/...",
    analyze: "Analyze",
    processing: "Processing",
    tip: "Tip: You can paste the entire text copied from the app. We'll find the link for you.",
    analysisFailed: "Analysis Failed",
    demoNote:
      "You are in demo mode. Go to settings to configure your real Docker API endpoint.",
    authorInfo: "Author Info",
    postTitle: "Post Title",
    postDesc: "Description",
    assetActions: "Asset Actions",
    downloadAll: "Download All Assets",
    downloading: "Downloading...",
    copyDesc: "Copy Description",
    mediaAssets: "Media Assets",
    noMedia: "No media found in this post.",
    view: "View",
    save: "Save",
    saved: "Saved",
    copyright: "© 2025 XHS Asset Manager. Designed for XHS-Downloader.",
    docs: "Documentation",
    privacy: "Privacy",
  },
};

const App: React.FC = () => {
  // Configuration State
  const [config, setConfig] = useState<AppConfig>({
    apiBaseUrl: "demo",
    language: "zh",
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // App Logic State
  const [inputUrl, setInputUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<XhsPost | null>(null);
  const [batchStatus, setBatchStatus] = useState<DownloadStatus>(
    DownloadStatus.IDLE,
  );

  const t = translations[config.language];

  // Load config on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem(STORAGE_KEY);
    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig));
      } catch (e) {
        console.error("Failed to parse config", e);
      }
    }
  }, []);

  // Save config
  const handleSaveConfig = (newConfig: AppConfig) => {
    setConfig(newConfig);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
    // 我们不重置 data，这样切换语言可以立即看到当前笔记的翻译效果
    setError(null);
  };

  // Main Analysis Handler
  const handleAnalyze = async () => {
    if (!inputUrl.trim()) return;

    setLoading(true);
    setError(null);
    setData(null);

    const cleanUrl = extractUrl(inputUrl);

    if (!cleanUrl) {
      setError(
        config.language === "zh"
          ? "在输入文本中未找到有效链接。"
          : "No valid URL found in the input text.",
      );
      setLoading(false);
      return;
    }

    try {
      const result = await analyzeLink(cleanUrl, config);
      setData(result);
    } catch (err: any) {
      setError(
        err.message ||
          (config.language === "zh"
            ? "链接解析失败，请检查 API 设置。"
            : "Failed to analyze link. Check your API settings."),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBatchDownload = async () => {
    if (!data || !data.media.length) return;

    setBatchStatus(DownloadStatus.DOWNLOADING);

    let successCount = 0;
    for (let i = 0; i < data.media.length; i++) {
      const item = data.media[i];
      const ext = item.type === "video" ? "mp4" : "jpg";
      const filename = `${data.title.substring(0, 10).replace(/[^a-z0-9]/gi, "_")}_${i + 1}.${ext}`;

      const success = await downloadFile(item.url, filename);
      if (success) successCount++;

      await new Promise((r) => setTimeout(r, 500));
    }

    setBatchStatus(
      successCount > 0 ? DownloadStatus.SUCCESS : DownloadStatus.ERROR,
    );
    setTimeout(() => setBatchStatus(DownloadStatus.IDLE), 3000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center shadow-md">
              <Download className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-bold text-xl text-slate-800 tracking-tight">
              {t.appName}
            </h1>
            {config.apiBaseUrl === "demo" && (
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium border border-amber-200">
                {t.demoTag}
              </span>
            )}
          </div>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-all"
            title={config.language === "zh" ? "配置" : "Settings"}
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Input Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8 transition-all hover:shadow-md">
          <div className="max-w-3xl mx-auto">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {t.searchLabel}
            </label>
            <div className="relative flex items-stretch gap-2">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LinkIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder={t.searchPlaceholder}
                />
              </div>
              <button
                onClick={handleAnalyze}
                disabled={loading || !inputUrl}
                className={`px-6 py-3 rounded-lg font-medium text-white shadow-sm flex items-center gap-2 transition-all ${
                  loading || !inputUrl
                    ? "bg-slate-300 cursor-not-allowed"
                    : "bg-primary-600 hover:bg-primary-700 hover:shadow-md active:transform active:scale-95"
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{t.processing}</span>
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    <span>{t.analyze}</span>
                  </>
                )}
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-500">{t.tip}</p>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="max-w-3xl mx-auto mb-8 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-red-800">
                {t.analysisFailed}
              </h3>
              <p className="text-sm text-red-600 mt-1">{error}</p>
              {config.apiBaseUrl === "demo" && (
                <p className="text-xs text-red-500 mt-2">{t.demoNote}</p>
              )}
            </div>
          </div>
        )}

        {/* Results Section */}
        {data && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4 duration-500">
            {/* Sidebar: Metadata */}
            <div className="lg:col-span-1 space-y-6">
              {/* Author Card */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                  {t.authorInfo}
                </h3>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                    {data.author.avatar ? (
                      <img
                        src={data.author.avatar}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        ?
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {data.author.nickname}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono">
                      ID: {data.author.uid}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                      {t.postTitle}
                    </h4>
                    <p className="text-sm text-slate-800 font-medium leading-relaxed">
                      {data.title}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                      {t.postDesc}
                    </h4>
                    <div className="text-sm text-slate-600 leading-relaxed max-h-40 overflow-y-auto custom-scrollbar">
                      {data.desc}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions Card */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h4 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <FileJson className="w-4 h-4 text-primary-600" />
                  {t.assetActions}
                </h4>
                <div className="space-y-3">
                  <button
                    onClick={handleBatchDownload}
                    disabled={batchStatus === DownloadStatus.DOWNLOADING}
                    className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-70"
                  >
                    {batchStatus === DownloadStatus.DOWNLOADING ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : batchStatus === DownloadStatus.SUCCESS ? (
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    {batchStatus === DownloadStatus.DOWNLOADING
                      ? t.downloading
                      : t.downloadAll}
                  </button>

                  <button
                    onClick={() => copyToClipboard(data.desc)}
                    className="w-full flex items-center justify-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 py-2.5 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    {t.copyDesc}
                  </button>
                </div>
              </div>
            </div>

            {/* Main Area: Gallery */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-primary-600" />
                  {t.mediaAssets}
                  <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-xs font-mono ml-2">
                    {data.media.length}
                  </span>
                </h2>
              </div>

              {data.media.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {data.media.map((media, index) => (
                    <MediaCard
                      key={media.id}
                      media={media}
                      index={index}
                      labels={{
                        view: t.view,
                        save: t.save,
                        saved: t.saved,
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl h-64 flex items-center justify-center flex-col text-slate-400">
                  <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
                  <p>{t.noMedia}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">{t.copyright}</p>
          <div className="flex gap-4">
            <a href="#" className="text-slate-400 hover:text-slate-600 text-sm">
              {t.docs}
            </a>
            <a href="#" className="text-slate-400 hover:text-slate-600 text-sm">
              {t.privacy}
            </a>
          </div>
        </div>
      </footer>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onSave={handleSaveConfig}
      />
    </div>
  );
};

export default App;
