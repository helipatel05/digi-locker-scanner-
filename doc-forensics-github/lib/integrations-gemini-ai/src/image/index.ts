import { GoogleGenAI } from "@google/genai";

export const imageAi = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});
