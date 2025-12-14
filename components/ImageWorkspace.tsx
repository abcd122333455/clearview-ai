import React, { useState, useRef } from 'react';
import { Upload, X, ArrowRight, Download, Wand2, Image as ImageIcon } from 'lucide-react';
import { Button } from './Button';
import { fileToBase64, removeImageWatermark } from '../services/geminiService';
import { ProcessingState } from '../types';

export const ImageWorkspace: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<ProcessingState>({ status: 'idle' });
  const [prompt, setPrompt] = useState("Remove any watermarks, text, and logos. Fill the background naturally.");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setResultUrl(null);
      setStatus({ status: 'idle' });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
       const selectedFile = e.dataTransfer.files[0];
       if (!selectedFile.type.startsWith('image/')) return;
       setFile(selectedFile);
       setPreviewUrl(URL.createObjectURL(selectedFile));
       setResultUrl(null);
       setStatus({ status: 'idle' });
    }
  };

  const handleProcess = async () => {
    if (!file || !previewUrl) return;
    
    setStatus({ status: 'processing' });
    try {
      const base64 = await fileToBase64(file);
      const cleanedImageBase64 = await removeImageWatermark(base64, file.type, prompt);
      
      const byteCharacters = atob(cleanedImageBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/png' }); // Gemini typically returns PNG/JPEG
      
      setResultUrl(URL.createObjectURL(blob));
      setStatus({ status: 'completed' });
    } catch (error) {
      setStatus({ status: 'error', message: 'Failed to process image. Please try again.' });
      console.error(error);
    }
  };

  const reset = () => {
    setFile(null);
    setPreviewUrl(null);
    setResultUrl(null);
    setStatus({ status: 'idle' });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Upload Zone */}
      {!file && (
        <div 
          className="border-2 border-dashed border-slate-700 rounded-2xl p-12 text-center bg-slate-800/50 hover:bg-slate-800/80 transition-colors cursor-pointer"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="w-16 h-16 bg-blue-600/20 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Upload className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Upload an Image</h3>
          <p className="text-slate-400 mb-6">Drag and drop your image here, or click to browse</p>
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />
          <Button variant="secondary">Select File</Button>
        </div>
      )}

      {/* Editor Interface */}
      {file && (
        <div className="flex flex-col gap-8">
           {/* Controls */}
           <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-slate-800 p-4 rounded-xl gap-4">
             <div className="flex items-center gap-4">
               <div className="p-2 bg-blue-500/20 rounded-lg">
                 <ImageIcon className="text-blue-400 w-5 h-5" />
               </div>
               <div>
                 <p className="font-medium text-white truncate max-w-[200px]">{file.name}</p>
                 <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
               </div>
             </div>
             
             <div className="flex-1 w-full md:w-auto md:mx-8">
               <input 
                type="text" 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe what to remove (e.g. Remove logo in bottom right...)"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
               />
             </div>

             <div className="flex items-center gap-2 w-full md:w-auto">
               <Button variant="secondary" onClick={reset}>
                 <X className="w-4 h-4" />
               </Button>
               <Button 
                onClick={handleProcess} 
                isLoading={status.status === 'processing'} 
                icon={<Wand2 className="w-4 h-4" />}
                disabled={status.status === 'processing'}
               >
                 Remove Watermark
               </Button>
             </div>
           </div>

           {/* Preview Area */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[600px]">
              {/* Original */}
              <div className="relative group bg-slate-900 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
                 <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-white z-10">Original</div>
                 {previewUrl && (
                   <img src={previewUrl} alt="Original" className="max-w-full max-h-full object-contain" />
                 )}
              </div>

              {/* Result */}
              <div className="relative group bg-slate-900 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
                 <div className="absolute top-4 left-4 bg-blue-600/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-white z-10">Result</div>
                 
                 {status.status === 'processing' && (
                   <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm z-20">
                     <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                     <p className="text-blue-400 font-medium">AI is working its magic...</p>
                   </div>
                 )}

                 {status.status === 'error' && (
                    <div className="text-red-400 text-center p-4">
                      <p className="mb-2">Something went wrong.</p>
                      <p className="text-sm opacity-75">{status.message}</p>
                    </div>
                 )}

                 {resultUrl ? (
                   <>
                    <img src={resultUrl} alt="Cleaned" className="max-w-full max-h-full object-contain" />
                    <a 
                      href={resultUrl} 
                      download={`cleaned-${file.name}`}
                      className="absolute bottom-4 right-4 bg-white text-slate-900 px-4 py-2 rounded-lg font-medium shadow-lg hover:bg-slate-100 transition-colors flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" /> Download
                    </a>
                   </>
                 ) : (
                   status.status !== 'processing' && status.status !== 'error' && (
                     <div className="text-slate-500 text-center">
                       <ArrowRight className="w-8 h-8 mx-auto mb-2 opacity-20" />
                       <p>Processed image will appear here</p>
                     </div>
                   )
                 )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
