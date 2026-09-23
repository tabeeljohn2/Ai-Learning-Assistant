// lib/ai-client.ts
import OpenAI from "openai";

export const ai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

export const AI_MODEL = "gemini-3.5-flash-lite";