import React, { useState, useRef } from 'react';
import { Upload, X, Film, Download, Video, Sparkles } from 'lucide-react';
import { Button } from './Button';
import { fileToBase64, removeImageWatermark, generateCleanVideo } from '../services/geminiService';
import { ProcessingState } from '../types';

export const VideoWorkspace: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultVideoUrl, setResultVideoUrl] = useState<string | null>(null);
  
  // Steps: 0 = upload, 1 = clean frame, 2 = generate video
  const [step, setStep] = useState<number>(0);
  const [cleanedFrame, setCleanedFrame] = useState<string | null>(null); // Base64
  const [cleanedFrameUrl, setCleanedFrameUrl] = useState<string | null>(null); // Blob URL
  
  const [status, setStatus] = useState<ProcessingState>({ status: 'idle' });
  const [prompt, setPrompt] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      resetState();
    }
  };

  const resetState = () => {
      setResultVideoUrl(null);
      setCleanedFrame(null);
      setCleanedFrameUrl(null);
      setStep(0);
      setStatus({ status: 'idle' });
  };

  const fullReset = () => {
      setFile(null);
      setPreviewUrl(null);
      resetState();
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCleanFrame = async () => {
    if (!file) return;
    setStatus({ status: 'processing', message: 'Removing watermark from reference frame...' });
    
    try {
      const base64 = await fileToBase64(file);
      // Clean the frame first
      const cleanedBase64 = await removeImageWatermark(base64, file.type, "Remove watermarks, text, and logos. Keep the main subject intact.");
      
      // Create blob for preview
      const byteCharacters = atob(cleanedBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/png' });
      
      setCleanedFrame(cleanedBase64);
      setCleanedFrameUrl(URL.createObjectURL(blob));
      setStep(1); // Move to next step
      setStatus({ status: 'idle' });
    } catch (error) {
      setStatus({ status: 'error', message: 'Failed to clean frame.' });
      console.error(error);
    }
  };

  const handleGenerateVideo = async () => {
    if (!cleanedFrame) return;
    setStatus({ status: 'processing', message: 'Generating reconstructed video with Veo...' });

    try {
        const videoUrl = await generateCleanVideo(cleanedFrame, 'image/png', prompt);
        setResultVideoUrl(videoUrl);
        setStep(2);
        setStatus({ status: 'completed' });
    } catch (error) {
        setStatus({ status: 'error', message: 'Failed to generate video.' });
        console.error(error);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="mb-6 bg-blue-900/20 border border-blue-500/20 p-4 rounded-xl text-blue-200 text-sm flex items-start gap-3">
         <Sparkles className="w-5 h-5 flex-shrink-0 text-blue-400 mt-0.5" />
         <div>
            <p className="font-bold text-blue-300 mb-1">Video Restoration Strategy</p>
            <p>Upload a representative frame (screenshot) of your video with the watermark. We will first remove the watermark from this frame, then use the clean frame to reconstruct a high-quality video using Google Veo.</p>
         </div>
      </div>

      {!file && (
        <div 
          className="border-2 border-dashed border-slate-700 rounded-2xl p-12 text-center bg-slate-800/50 hover:bg-slate-800/80 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="w-16 h-16 bg-purple-600/20 text-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Video className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Upload Reference Frame</h3>
          <p className="text-slate-400 mb-6">Upload a PNG/JPG screenshot of your video</p>
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />
          <Button variant="secondary">Select Image Frame</Button>
        </div>
      )}

      {file && (
        <div className="space-y-8">
            {/* Step Progress */}
            <div className="flex items-center justify-between px-8 py-4 bg-slate-800 rounded-xl">
                 <div className={`flex items-center gap-2 ${step >= 0 ? 'text-blue-400' : 'text-slate-500'}`}>
                    <div className="w-6 h-6 rounded-full bg-current flex items-center justify-center text-slate-900 text-xs font-bold">1</div>
                    <span className="font-medium">Clean Frame</span>
                 </div>
                 <div className="h-0.5 flex-1 bg-slate-700 mx-4"></div>
                 <div className={`flex items-center gap-2 ${step >= 1 ? 'text-purple-400' : 'text-slate-500'}`}>
                    <div className="w-6 h-6 rounded-full bg-current flex items-center justify-center text-slate-900 text-xs font-bold">2</div>
                    <span className="font-medium">Configure Video</span>
                 </div>
                 <div className="h-0.5 flex-1 bg-slate-700 mx-4"></div>
                 <div className={`flex items-center gap-2 ${step >= 2 ? 'text-green-400' : 'text-slate-500'}`}>
                    <div className="w-6 h-6 rounded-full bg-current flex items-center justify-center text-slate-900 text-xs font-bold">3</div>
                    <span className="font-medium">Result</span>
                 </div>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left: Source/Cleaned Frame */}
                <div className="space-y-4">
                    <h4 className="text-lg font-medium text-white">Reference Frame</h4>
                    <div className="relative rounded-xl overflow-hidden bg-black border border-slate-700 aspect-video flex items-center justify-center">
                        <img 
                            src={cleanedFrameUrl || previewUrl || ''} 
                            alt="Reference" 
                            className="max-w-full max-h-full object-contain" 
                        />
                        {step === 0 && !cleanedFrameUrl && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <Button onClick={handleCleanFrame} isLoading={status.status === 'processing'} variant="primary">
                                    Remove Watermark First
                                </Button>
                            </div>
                        )}
                        <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 rounded text-xs text-white">
                            {cleanedFrameUrl ? "Cleaned Frame" : "Original Frame"}
                        </div>
                    </div>
                </div>

                {/* Right: Controls or Result */}
                <div className="space-y-4">
                    <h4 className="text-lg font-medium text-white">
                        {step === 2 ? "Generated Video" : "Video Settings"}
                    </h4>
                    
                    <div className="relative rounded-xl overflow-hidden bg-black border border-slate-700 aspect-video flex items-center justify-center">
                        {status.status === 'processing' ? (
                            <div className="text-center p-6">
                                <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-purple-300 animate-pulse">{status.message}</p>
                                <p className="text-xs text-slate-500 mt-2">This may take a minute...</p>
                            </div>
                        ) : step === 2 && resultVideoUrl ? (
                            <video 
                                src={resultVideoUrl} 
                                controls 
                                className="w-full h-full"
                                autoPlay
                                loop
                            />
                        ) : (
                            step === 1 ? (
                                <div className="p-6 w-full h-full flex flex-col justify-center gap-4 bg-slate-800">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-2">
                                            Video Description
                                        </label>
                                        <textarea 
                                            value={prompt}
                                            onChange={(e) => setPrompt(e.target.value)}
                                            placeholder="Describe how the video should look (e.g., The ocean waves moving gently, cinematic 4k)"
                                            className="w-full h-32 bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none"
                                        />
                                    </div>
                                    <Button 
                                        onClick={handleGenerateVideo} 
                                        variant="primary"
                                        className="w-full bg-purple-600 hover:bg-purple-500"
                                        icon={<Film className="w-4 h-4" />}
                                    >
                                        Generate Video
                                    </Button>
                                </div>
                            ) : (
                                <div className="text-slate-500 text-sm p-8 text-center">
                                    Process the reference frame to unlock video generation.
                                </div>
                            )
                        )}
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-800">
                 <Button variant="outline" onClick={fullReset} icon={<X className="w-4 h-4"/>}>
                    Start Over
                 </Button>
                 {step === 2 && resultVideoUrl && (
                     <a 
                        href={resultVideoUrl} 
                        download="restored-video.mp4"
                        className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-500 transition-colors flex items-center gap-2"
                     >
                        <Download className="w-4 h-4" /> Download Video
                     </a>
                 )}
            </div>
        </div>
      )}
    </div>
  );
};
