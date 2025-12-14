import { GoogleGenAI } from "@google/genai";

// Helper to convert Blob/File to Base64 string
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove Data-URL declaration (e.g. "data:image/png;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};

export const getGeminiClient = (): GoogleGenAI => {
  // 优先使用环境变量中的 API Key
  let apiKey = (process.env.API_KEY || process.env.GEMINI_API_KEY) as string;
  
  // 如果环境变量中没有，尝试从 localStorage 读取（手动输入的临时方案）
  if (!apiKey || apiKey === 'YOUR_API_KEY_HERE' || apiKey.trim() === '') {
    const storedKey = localStorage.getItem('gemini_api_key');
    if (storedKey) {
      apiKey = storedKey;
    }
  }
  
  if (!apiKey || apiKey.trim() === '') {
    throw new Error("API Key not found. Please configure GEMINI_API_KEY in .env.local or enter it manually.");
  }
  
  return new GoogleGenAI({ apiKey });
};

export const removeImageWatermark = async (base64Image: string, mimeType: string, instructions: string = "Remove watermarks, logos, and text overlays."): Promise<string> => {
  const ai = getGeminiClient();
  
  // Using gemini-2.5-flash-image for image editing tasks as per guidelines
  const model = 'gemini-2.5-flash-image';

  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: `${instructions} Output only the cleaned image. Fill in any missing areas naturally to match the background.`,
          },
        ],
      },
      // No responseMimeType needed for flash-image series usually, but let's keep it standard
    });

    // Extract image from response
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData && part.inlineData.data) {
        return part.inlineData.data;
      }
    }
    
    throw new Error("No image data returned from the model.");
  } catch (error) {
    console.error("Gemini Image Edit Error:", error);
    throw error;
  }
};

export const generateCleanVideo = async (cleanBase64Image: string, mimeType: string, prompt: string): Promise<string> => {
  const ai = getGeminiClient();
  
  // Using Veo for video generation
  const model = 'veo-3.1-fast-generate-preview';

  try {
    let operation = await ai.models.generateVideos({
      model,
      prompt: prompt || "Animate this scene naturally, high quality, cinematic lighting.",
      image: {
        imageBytes: cleanBase64Image,
        mimeType: mimeType,
      },
      config: {
        numberOfVideos: 1,
        resolution: '720p', // Veo fast supports 720p
        aspectRatio: '16:9' // Defaulting to 16:9 for this demo
      }
    });

    // Polling for completion
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5s
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) {
      throw new Error("Video generation failed: No URI returned.");
    }

    // Fetch the actual video bytes using the API key
    const videoResponse = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
    if (!videoResponse.ok) {
      throw new Error(`Failed to download generated video: ${videoResponse.statusText}`);
    }

    const videoBlob = await videoResponse.blob();
    return URL.createObjectURL(videoBlob);

  } catch (error) {
    console.error("Veo Video Generation Error:", error);
    throw error;
  }
};
