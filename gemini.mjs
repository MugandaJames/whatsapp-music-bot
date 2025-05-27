import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function askGemini(prompt) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent({
      contents: [{ parts: [{ text: prompt }] }],
    });

    const text = await result.response.text();
    return text || 'Gemini response was empty';
  } catch (err) {
    console.error('Gemini error:', err);
    return 'Gemini failed to respond';
  }
}
