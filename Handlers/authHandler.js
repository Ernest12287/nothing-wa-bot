// ============================================
// AUTH HANDLER
// Flow:
//   1. Local auth folder exists + valid → use it (fastest, no decode needed)
//   2. SESSION_ID in env → decode into auth folder → use it
//   3. Nothing → show QR, save session on connect
// ============================================

import { useMultiFileAuthState } from 'baileys';
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';
import logger from '../logger.js';
import config from '../config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AUTH_FOLDER = path.resolve(__dirname, '..', config.auth.folder);
const SESSION_OUT = path.resolve(__dirname, '..', 'session_string.txt');

// ============================================
// GENERATE SESSION STRING
// Called after every successful connect.
// Saves Ernest~... to session_string.txt
// ============================================
export function generateSessionString() {
    try {
        const credsPath = path.join(AUTH_FOLDER, 'creds.json');
        if (!fs.existsSync(credsPath)) {
            logger.warn('[SESSION] No creds.json yet — skipping generation');
            return null;
        }

        const creds = JSON.parse(fs.readFileSync(credsPath, 'utf8'));

        // Pack all key files
        const keys = {};
        const files = fs.readdirSync(AUTH_FOLDER).filter(f => f !== 'creds.json' && f.endsWith('.json'));
        for (const file of files) {
            try {
                keys[file.replace('.json', '')] = JSON.parse(
                    fs.readFileSync(path.join(AUTH_FOLDER, file), 'utf8')
                );
            } catch (_) {}
        }

        const payload = JSON.stringify({ creds, keys });
        const sessionString = `Ernest~${zlib.gzipSync(Buffer.from(payload, 'utf8')).toString('base64')}`;

        fs.writeFileSync(SESSION_OUT, sessionString, 'utf8');
        logger.success(`[SESSION] ✅ Session saved to session_string.txt (${sessionString.length} chars)`);
        logger.info('[SESSION] Copy that string → set as SESSION_ID in .env for next time');

        return sessionString;
    } catch (error) {
        logger.error(`[SESSION] Generate failed: ${error.message}`);
        return null;
    }
}

// ============================================
// DECODE SESSION STRING → write files
// ============================================
function decodeAndWrite(sessionString) {
    try {
        sessionString = sessionString.trim();
        let data;

        if (sessionString.startsWith('Ernest~')) {
            const b64 = sessionString.slice(7); // strip "Ernest~"
            data = JSON.parse(zlib.gunzipSync(Buffer.from(b64, 'base64')).toString('utf8'));
        } else if (sessionString.startsWith('{')) {
            data = JSON.parse(sessionString);
        } else {
            const buf = Buffer.from(sessionString, 'base64');
            const raw = (buf[0] === 0x1f && buf[1] === 0x8b)
                ? zlib.gunzipSync(buf).toString('utf8')
                : buf.toString('utf8');
            data = JSON.parse(raw);
        }

        return writeFiles(data);
    } catch (error) {
        logger.error(`[SESSION] Decode failed: ${error.message}`);
        return false;
    }
}

function writeFiles(data) {
    try {
        if (!fs.existsSync(AUTH_FOLDER)) fs.mkdirSync(AUTH_FOLDER, { recursive: true });

        if (data.creds && data.keys) {
            fs.writeFileSync(path.join(AUTH_FOLDER, 'creds.json'), JSON.stringify(data.creds, null, 2));
            for (const [name, val] of Object.entries(data.keys)) {
                fs.writeFileSync(path.join(AUTH_FOLDER, `${name}.json`), JSON.stringify(val, null, 2));
            }
            logger.success(`[SESSION] Wrote creds + ${Object.keys(data.keys).length} key file(s)`);
            return true;
        }

        if (data.noiseKey && data.signedIdentityKey) {
            fs.writeFileSync(path.join(AUTH_FOLDER, 'creds.json'), JSON.stringify(data, null, 2));
            logger.success('[SESSION] Wrote creds.json');
            return true;
        }

        logger.warn('[SESSION] Unknown structure — saving as-is');
        fs.writeFileSync(path.join(AUTH_FOLDER, 'creds.json'), JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        logger.error(`[SESSION] Write failed: ${error.message}`);
        return false;
    }
}

function nukeAuthFolder() {
    fs.rmSync(AUTH_FOLDER, { recursive: true, force: true });
    fs.mkdirSync(AUTH_FOLDER, { recursive: true });
}

function localSessionExists() {
    const credsPath = path.join(AUTH_FOLDER, 'creds.json');
    if (!fs.existsSync(credsPath)) return false;
    try {
        const raw = JSON.parse(fs.readFileSync(credsPath, 'utf8'));
        // Must have the noise key — the thing that was missing before
        return !!(raw.noiseKey || raw.creds?.noiseKey);
    } catch (_) {
        return false;
    }
}

// ============================================
// GET AUTH STATE
// ============================================
export async function getAuthState() {
    if (!fs.existsSync(AUTH_FOLDER)) fs.mkdirSync(AUTH_FOLDER, { recursive: true });

    // ── Priority 1: Valid local session already on disk ──
    // This persists across restarts without needing SESSION_ID at all
    if (localSessionExists()) {
        logger.success('[AUTH] ✅ Local session found → connecting');
        return await useMultiFileAuthState(AUTH_FOLDER);
    }

    // ── Priority 2: SESSION_ID in env → decode it ──
    if (process.env.SESSION_ID) {
        logger.info('[AUTH] Decoding SESSION_ID...');
        const ok = decodeAndWrite(process.env.SESSION_ID);

        if (ok && localSessionExists()) {
            logger.success('[AUTH] ✅ SESSION_ID decoded → connecting');
            return await useMultiFileAuthState(AUTH_FOLDER);
        }

        logger.warn('[AUTH] SESSION_ID was invalid or incomplete → falling back to QR');
        nukeAuthFolder();
    }

    // ── Priority 3: QR code ──
    logger.info('[AUTH] No valid session → will show QR code');
    return await useMultiFileAuthState(AUTH_FOLDER);
}