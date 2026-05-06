// ============================================
// BRAIN/AI — ENGINE
// No extra packages needed, uses fetch (Node 18+)
// ============================================

// ── Groq (grok model via groq api) ──
export async function askGroq(prompt) {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 1024
        })
    });
    if (!res.ok) throw new Error(`Groq error: ${res.status}`);
    const data = await res.json();
    return data.choices[0].message.content.trim();
}

// ── Gemini ──
export async function askGemini(prompt) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
        })
    });
    if (!res.ok) throw new Error(`Gemini error: ${res.status}`);
    const data = await res.json();
    return data.candidates[0].content.parts[0].text.trim();
}

// ── DeepSeek ──
export async function askDeepSeek(prompt) {
    const res = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 1024
        })
    });
    if (!res.ok) throw new Error(`DeepSeek error: ${res.status}`);
    const data = await res.json();
    return data.choices[0].message.content.trim();
}