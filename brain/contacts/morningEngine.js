// ============================================
// MORNING MESSAGE ENGINE
// Generates personalized messages via AI
// Fallback: Groq → Gemini → DeepSeek
// ============================================

import { askGroq, askGemini, askDeepSeek } from '../ai/ai.js';

// ============================================
// BUILD PROMPT
// ============================================

function buildPrompt(profile, type) {
    const { name, gender, religion, age } = profile;
    const pronoun = gender === 'female' ? 'she/her' : 'he/him';
    const timeLabel = type === 'morning' ? 'morning' : 'night';
    const religionLabel = religion === 'islam' ? 'Islam'
                        : religion === 'christian' ? 'Christianity'
                        : 'a general spiritual/motivational';

    return `Create a warm, personalized ${timeLabel} message for someone with these details:
- Name: ${name}
- Gender pronouns: ${pronoun}
- Religion: ${religionLabel}
- Age: ${age || 'unknown'}

Requirements:
- Write in the style and language of ${religionLabel} (use Islamic greetings/Quran references for Islam, scripture/grace for Christianity, motivational/universe language for other)
- Address them by name
- Keep it under 100 words
- Feel genuine, not generic
- No hashtags, no emojis overload (max 2)
- Plain text only, no markdown

Just output the message, nothing else.`;
}

// ============================================
// GENERATE WITH FALLBACK
// ============================================

export async function generateMorningMessage(profile, type = 'morning') {
    const prompt = buildPrompt(profile, type);

    // Try Groq first
    try {
        const msg = await askGroq(prompt);
        if (msg) return { message: msg, provider: 'groq' };
    } catch (e) {
        console.warn(`[MORNING] Groq failed: ${e.message} — trying Gemini`);
    }

    // Fallback to Gemini
    try {
        const msg = await askGemini(prompt);
        if (msg) return { message: msg, provider: 'gemini' };
    } catch (e) {
        console.warn(`[MORNING] Gemini failed: ${e.message} — trying DeepSeek`);
    }

    // Last resort: DeepSeek
    try {
        const msg = await askDeepSeek(prompt);
        if (msg) return { message: msg, provider: 'deepseek' };
    } catch (e) {
        console.warn(`[MORNING] DeepSeek failed: ${e.message}`);
    }

    // All failed — use static fallback
    return {
        message: staticFallback(profile, type),
        provider: 'static'
    };
}

// ============================================
// STATIC FALLBACK (when all AI is down)
// ============================================

function staticFallback(profile, type) {
    const name = profile.name || 'Friend';
    const religion = profile.religion;

    if (type === 'morning') {
        if (religion === 'islam')     return `Assalamu Alaikum ${name} 🌅 May Allah bless your day with ease, health, and barakah. Start with Bismillah.`;
        if (religion === 'christian') return `Good morning ${name} 🌅 May God's grace guide your steps today. You are blessed and favored.`;
        return `Good morning ${name} 🌅 Today is a new opportunity. Make it count.`;
    } else {
        if (religion === 'islam')     return `Alhamdulillah for today ${name} 🌙 May Allah grant you peaceful rest and protect you through the night.`;
        if (religion === 'christian') return `Good night ${name} 🌙 Cast all your worries on God, for He cares for you. Rest well.`;
        return `Good night ${name} 🌙 You did well today. Rest and recharge.`;
    }
}