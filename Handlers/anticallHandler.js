// ============================================
// ANTICALL HANDLER
// Auto-reject incoming calls
// ============================================

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ANTICALL_DB = path.join(__dirname, '../data/anticall.json');

// ============================================
// LOAD SETTINGS
// ============================================
function loadAnticallSettings() {
    try {
        if (fs.existsSync(ANTICALL_DB)) {
            return JSON.parse(fs.readFileSync(ANTICALL_DB, 'utf8'));
        }
    } catch (error) {
        logger.error(`[ANTICALL] Load error: ${error.message}`);
    }
    return { enabled: true, sendMessage: true };
}

// ============================================
// CALL HANDLER
// ============================================
export async function handleCall(sock, call) {
    try {
        const settings = loadAnticallSettings();
        
        if (!settings.enabled) {
            logger.info('[ANTICALL] Disabled, allowing call');
            return;
        }
        
        const callId = call.id;
        const caller = call.from;
        const callerNumber = caller.split('@')[0];
        const isVideo = call.isVideo;
        
        logger.warn(`[ANTICALL] Incoming ${isVideo ? 'video' : 'voice'} call from ${callerNumber}`);
        
        // Reject the call
        await sock.rejectCall(callId, caller);
        logger.success(`[ANTICALL] Call rejected from ${callerNumber}`);
        
        // Send auto-reply message
        if (settings.sendMessage) {
            const message = `📞 *Call Auto-Rejected*\n\n` +
                          `Sorry, I'm currently busy and can't take calls right now.\n\n` +
                          `Please send me a text message instead, and I'll get back to you as soon as possible! 📱\n\n` +
                          `_This is an automated response. Calls are automatically rejected._`;
            
            try {
                await sock.sendMessage(caller, { text: message });
                logger.success(`[ANTICALL] Auto-reply sent to ${callerNumber}`);
            } catch (msgError) {
                logger.warn(`[ANTICALL] Failed to send message: ${msgError.message}`);
            }
        }
        
    } catch (error) {
        logger.error(`[ANTICALL] Error: ${error.message}`);
    }
}