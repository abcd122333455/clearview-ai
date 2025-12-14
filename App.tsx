import React, { useState } from 'react';
import { Eraser, Video, Image as ImageIcon } from 'lucide-react';
import { AppMode } from './types';
import { ImageWorkspace } from './components/ImageWorkspace';
import { VideoWorkspace } from './components/VideoWorkspace';
import { ApiKeySelector } from './components/ApiKeySelector';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.IMAGE);
  const [isKeySelected, setIsKeySelected] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-500/30">
      
      {!isKeySelected && <ApiKeySelector onKeySelected={() => setIsKeySelected(true)} />}

      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-tr from-blue-600 to-purple-600 p-2 rounded-lg">
               <Eraser className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              ClearView AI
            </h1>
          </div>
          
          <div className="flex bg-slate-800/80 p-1 rounded-lg border border-slate-700">
            <button
              onClick={() => setMode(AppMode.IMAGE)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                mode === AppMode.IMAGE 
                  ? 'bg-slate-700 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              Image Remover
            </button>
            <button
              onClick={() => setMode(AppMode.VIDEO)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                mode === AppMode.VIDEO 
                  ? 'bg-purple-900/50 text-purple-100 shadow-sm ring-1 ring-purple-500/50' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Video className="w-4 h-4" />
              Video Restorer
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
           <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
             {mode === AppMode.IMAGE ? 'Remove Watermarks Instantly' : 'Restore & Reconstruct Videos'}
           </h2>
           <p className="text-slate-400 max-w-2xl mx-auto text-lg">
             {mode === AppMode.IMAGE 
               ? 'Upload an image and let our AI seamlessly erase watermarks, logos, and unwanted text while preserving the background.'
               : 'Upload a reference frame, clean it, and use Google Veo to generate a high-quality, watermark-free video.'}
           </p>
        </div>

        <div className={`transition-opacity duration-300 ${isKeySelected ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          {mode === AppMode.IMAGE ? <ImageWorkspace /> : <VideoWorkspace />}
        </div>
      </main>

      <footer className="border-t border-slate-800 py-8 mt-12 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} ClearView AI. Powered by Google Gemini & Veo.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;