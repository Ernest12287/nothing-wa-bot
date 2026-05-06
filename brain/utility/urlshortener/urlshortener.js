// ============================================
// BRAIN/UTILITY/URL SHORTENER — ENGINE
// TinyURL API — free, no key needed
// ============================================

/**
 * Shorten a URL using TinyURL
 * @param {string} url
 * @returns {{ original, shortened }}
 */
export async function shortenUrl(url) {
    const res  = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
    if (!res.ok) throw new Error('Failed to shorten URL');
    const shortened = await res.text();
    if (!shortened.startsWith('http')) throw new Error('Invalid response from TinyURL');
    return { original: url, shortened };
}