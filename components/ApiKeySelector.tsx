import React, { useState, useEffect } from 'react';
import { Key, AlertCircle } from 'lucide-react';
import { Button } from './Button';

// Extend global interfaces to support AIStudio
// We augment the AIStudio interface to ensure it has the methods we need,
// instead of redeclaring the property on Window which causes type conflicts.
declare global {
  interface AIStudio {
    hasSelectedApiKey(): Promise<boolean>;
    openSelectKey(): Promise<void>;
  }
}

interface ApiKeySelectorProps {
  onKeySelected: () => void;
}

export const ApiKeySelector: React.FC<ApiKeySelectorProps> = ({ onKeySelected }) => {
  const [hasKey, setHasKey] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [manualKey, setManualKey] = useState<string>('');

  const checkKey = async () => {
    try {
      // 首先检查环境变量中是否有 API Key（本地环境）
      const envApiKey = (process.env.API_KEY || process.env.GEMINI_API_KEY) as string;
      if (envApiKey && envApiKey !== 'YOUR_API_KEY_HERE' && envApiKey.trim() !== '') {
        setHasKey(true);
        onKeySelected();
        return;
      }

      // 如果在 AI Studio 环境中，检查是否已选择 API Key
      if (window.aistudio) {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasKey(selected);
        if (selected) {
          onKeySelected();
        }
      }
    } catch (e) {
      console.error("Error checking API key:", e);
    }
  };

  useEffect(() => {
    checkKey();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectKey = async () => {
    setError(null);
    try {
      if (window.aistudio) {
        await window.aistudio.openSelectKey();
        // Assume success as per guidelines and proceed
        setHasKey(true);
        onKeySelected();
      } else {
        // 本地环境或 GitHub Pages：提示用户手动输入 API Key
        // 不显示错误，而是显示友好的提示信息
      }
    } catch (e: any) {
      if (e.message && e.message.includes("Requested entity was not found")) {
         setError("Project not found or invalid. Please try selecting again.");
         setHasKey(false);
      } else {
         console.error("Selection failed", e);
         // Optimistically assume success to prevent blocking if error is minor
         setHasKey(true);
         onKeySelected();
      }
    }
  };

  const handleManualKeySubmit = () => {
    if (manualKey.trim()) {
      // 将手动输入的 API Key 存储到 localStorage（临时方案）
      localStorage.setItem('gemini_api_key', manualKey.trim());
      setHasKey(true);
      onKeySelected();
    } else {
      setError("请输入有效的 API Key");
    }
  };

  if (hasKey) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 max-w-md w-full shadow-2xl text-center">
        <div className="mx-auto bg-blue-500/20 w-16 h-16 rounded-full flex items-center justify-center mb-6">
          <Key className="w-8 h-8 text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">API Key Required</h2>
        <p className="text-slate-400 mb-6">
          {window.aistudio 
            ? "To use the advanced Veo video generation models, you must select a valid API key from a paid Google Cloud Project."
            : "请输入你的 Google Gemini API Key 以使用去水印功能。API Key 仅存储在本地浏览器中，不会上传到服务器。"}
        </p>
        
        {error && (
           <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm text-left">
             <AlertCircle className="w-4 h-4 flex-shrink-0" />
             <span>{error}</span>
           </div>
        )}

        {!window.aistudio && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-2 text-left">
              输入 API Key
            </label>
            <input
              type="password"
              value={manualKey}
              onChange={(e) => setManualKey(e.target.value)}
              placeholder="输入你的 Gemini API Key"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none mb-2"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleManualKeySubmit();
                }
              }}
            />
            <p className="text-xs text-slate-500 text-left mb-3">
              🔒 API Key 仅存储在本地浏览器，不会上传到任何服务器。<br/>
              💡 获取 API Key: <a href="https://ai.google.dev/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">ai.google.dev</a>
            </p>
            <Button onClick={handleManualKeySubmit} className="w-full py-2 text-sm mb-3">
              使用此 API Key
            </Button>
          </div>
        )}

        {window.aistudio && (
          <Button onClick={handleSelectKey} className="w-full py-3 text-lg">
            Select API Key
          </Button>
        )}
        
        <p className="mt-4 text-xs text-slate-500">
          Learn more about billing at <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">ai.google.dev/gemini-api/docs/billing</a>
        </p>
      </div>
    </div>
  );
};
