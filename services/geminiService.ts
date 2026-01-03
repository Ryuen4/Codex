import { GoogleGenAI } from "@google/genai";

// Initialize the Google GenAI client following SDK guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateContinuation = async (
  currentContent: string, 
  nodeTitle: string,
  context: string = ''
): Promise<string> => {
  if (!navigator.onLine) {
    return "AI features require an internet connection. Please check your network.";
  }

  try {
    const prompt = `
    You are a professional editor and co-author. 
    Task: Continue the following text naturally, maintaining the tone and style.
    Title of Section: "${nodeTitle}"
    Context from other sections: "${context}"
    
    Current Text:
    "${currentContent}"
    
    (Generate only the continuation text, no preamble)
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || '';
  } catch (error) {
    console.error("Error generating content:", error);
    return "The AI is currently unavailable. Check your connection or API status.";
  }
};

export const generateSummary = async (content: string): Promise<string> => {
  if (!navigator.onLine) return "Summary unavailable offline.";
  
  try {
     const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Summarize this text in 2 sentences:\n\n${content}`,
    });
    return response.text || '';
  } catch (error) {
    console.error(error);
    return "Failed to summarize.";
  }
}