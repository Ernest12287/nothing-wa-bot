// ============================================
// FRIEND TAGS ENGINE
// Stores tags per JID in data/friends.json
// { "brother": ["jid1", "jid2"], "crush": ["jid3"] }
// ============================================

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FRIENDS_FILE = path.resolve(__dirname, '../../data/friends.json');

function load() {
    try {
        if (fs.existsSync(FRIENDS_FILE)) return JSON.parse(fs.readFileSync(FRIENDS_FILE, 'utf8'));
    } catch (_) {}
    return {};
}

function save(data) {
    const dir = path.dirname(FRIENDS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(FRIENDS_FILE, JSON.stringify(data, null, 2));
}

export function addToTag(tag, jid) {
    const data = load();
    const t = tag.toLowerCase();
    if (!data[t]) data[t] = [];
    if (!data[t].includes(jid)) data[t].push(jid);
    save(data);
}

export function removeFromTag(tag, jid) {
    const data = load();
    const t = tag.toLowerCase();
    if (!data[t]) return false;
    data[t] = data[t].filter(j => j !== jid);
    if (!data[t].length) delete data[t];
    save(data);
    return true;
}

export function getTag(tag) {
    return load()[tag.toLowerCase()] || [];
}

export function getAllTags() {
    return load();
}

export function getTagsForJid(jid) {
    const data = load();
    return Object.entries(data)
        .filter(([, jids]) => jids.includes(jid))
        .map(([tag]) => tag);
}

export function deleteTag(tag) {
    const data = load();
    delete data[tag.toLowerCase()];
    save(data);
}