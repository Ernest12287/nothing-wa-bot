// ============================================
// BRAIN/SOCIALS/TIKTOK — HANDLERS
// Returns data only. No formatting, no sending.
// ============================================

import { fetchTikTok } from './tiktok.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMP_DIR  = path.join(__dirname, '../../../temp');

async function downloadToTemp(url, filename) {
    if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Download error: ${res.status}`);
    const buffer   = Buffer.from(await res.arrayBuffer());
    const filepath = path.join(TEMP_DIR, filename);
    fs.writeFileSync(filepath, buffer);
    return filepath;
}

function cleanup(filepath) {
    try { fs.unlinkSync(filepath); } catch (_) {}
}

/**
 * Get TikTok video as temp file path
 */
export async function videoHandler(url) {
    const data     = await fetchTikTok(url);
    const filename = `tiktok_${Date.now()}.mp4`;
    const filepath = await downloadToTemp(data.links.mp4_hd, filename);
    return { data, filepath, cleanup: () => cleanup(filepath) };
}

/**
 * Get TikTok audio as temp file path
 */
export async function audioHandler(url) {
    const data     = await fetchTikTok(url);
    const filename = `tiktok_${Date.now()}.mp3`;
    const filepath = await downloadToTemp(data.links.mp3, filename);
    return { data, filepath, cleanup: () => cleanup(filepath) };
}