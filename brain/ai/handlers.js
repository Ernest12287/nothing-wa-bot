// ============================================
// BRAIN/AI — HANDLERS
// ============================================

import { askGroq, askGemini, askDeepSeek } from './ai.js';

export async function groqHandler(prompt) {
    if (!prompt?.trim()) throw new Error('Provide a question.');
    const reply = await askGroq(prompt.trim());
    return { reply, model: 'Grok (Groq)', prompt };
}

export async function geminiHandler(prompt) {
    if (!prompt?.trim()) throw new Error('Provide a question.');
    const reply = await askGemini(prompt.trim());
    return { reply, model: 'Gemini', prompt };
}

export async function deepseekHandler(prompt) {
    if (!prompt?.trim()) throw new Error('Provide a question.');
    const reply = await askDeepSeek(prompt.trim());
    return { reply, model: 'DeepSeek', prompt };
}