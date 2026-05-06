// ============================================
// BRAIN/SOCIALS/TIKTOK — ENGINE
// ============================================

const API = 'https://ernest-tiksave.vercel.app/api/download';

/**
 * Fetch TikTok video info + download links
 * @param {string} url
 * @returns {{ author, author_name, desc, cover, links }}
 */
export async function fetchTikTok(url) {
    const res  = await fetch(`${API}?url=${encodeURIComponent(url)}`);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const json = await res.json();
    if (json.status !== 'success') throw new Error('Failed to fetch video');
    return json.data;
}

/**
 * Download a URL as a Buffer
 * @param {string} url
 * @returns {Buffer}
 */
export async function downloadBuffer(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Download error: ${res.status}`);
    return Buffer.from(await res.arrayBuffer());
}