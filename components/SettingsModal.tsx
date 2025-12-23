import React, { useState, useEffect } from 'react';
import { X, Save, Server, Languages } from 'lucide-react';
import { AppConfig } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AppConfig;
  onSave: (config: AppConfig) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, config, onSave }) => {
  const [localConfig, setLocalConfig] = useState<AppConfig>(config);

  // 每当弹窗打开时，强制将本地临时配置同步为当前全局配置
  useEffect(() => {
    if (isOpen) {
      setLocalConfig(config);
    }
  }, [isOpen, config]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(localConfig);
    onClose();
  };

  // 注意：弹窗内部的提示文字应使用当前“已生效”的语言（config.language）
  // 而下拉框的 value 则绑定临时修改的状态（localConfig.language）
  const isZh = config.language === 'zh';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Server className="w-5 h-5 text-primary-600" />
            {isZh ? '设置与配置' : 'Settings & Configuration'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
              <Languages className="w-4 h-4" />
              {isZh ? '界面语言' : 'Language'}
            </label>
            <select
              value={localConfig.language}
              onChange={(e) => setLocalConfig({...localConfig, language: e.target.value as 'zh' | 'en'})}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
            >
              <option value="zh">简体中文 (Chinese)</option>
              <option value="en">English</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {isZh ? 'API 基础 URL' : 'API Base URL'}
            </label>
            <input
              type="text"
              value={localConfig.apiBaseUrl}
              onChange={(e) => setLocalConfig({...localConfig, apiBaseUrl: e.target.value})}
              placeholder="http://localhost:8000"
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
            />
            <p className="mt-1 text-xs text-slate-500">
              {isZh 
                ? "运行 XHS-Downloader Docker 容器的地址。使用 'demo' 进入演示模式。" 
                : "The address where your XHS-Downloader docker container is running. Use 'demo' for mock mode."}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {isZh ? 'API 令牌 (可选)' : 'API Token (Optional)'}
            </label>
            <input
              type="password"
              value={localConfig.apiToken || ''}
              onChange={(e) => setLocalConfig({...localConfig, apiToken: e.target.value})}
              placeholder={isZh ? "密钥令牌" : "Secret token"}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
            >
              {isZh ? '取消' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md shadow-sm flex items-center gap-2 transition-colors"
            >
              <Save className="w-4 h-4" />
              {isZh ? '保存配置' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsModal;