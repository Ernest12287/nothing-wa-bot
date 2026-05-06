// ============================================
// MORNING MESSAGE SCHEDULER
// Fires at 6:00 AM EAT (morning) + 9:00 PM EAT (night)
// VPS is US time → all times converted to UTC for cron
//
// EAT = UTC+3
// 6:00 AM EAT  = 03:00 UTC
// 9:00 PM EAT  = 18:00 UTC
// ============================================

import { getRegisteredContacts, updateLastSent } from './engine.js';
import { generateMorningMessage } from './morningEngine.js';
import logger from '../../logger.js';

// ============================================
// SIMPLE CRON — no external packages
// Checks every minute, fires when time matches
// ============================================

function getEATTime() {
    const now = new Date();
    // EAT is UTC+3
    const eat = new Date(now.getTime() + (3 * 60 * 60 * 1000));
    return {
        hours:   eat.getUTCHours(),
        minutes: eat.getUTCMinutes(),
        dateStr: eat.toISOString().split('T')[0] // YYYY-MM-DD
    };
}

// ============================================
// SEND MORNING/NIGHT MESSAGES
// ============================================

async function sendMorningMessages(sock, type) {
    const contacts = getRegisteredContacts();
    const today = getEATTime().dateStr;

    logger.info(`[MORNING] Sending ${type} messages to ${contacts.length} contacts...`);

    let sent = 0;
    let failed = 0;

    for (const contact of contacts) {
        // Skip if morning messages disabled for this contact
        if (!contact.morning_messages?.enabled) continue;

        // Skip if already sent today
        const lastSent = contact.morning_messages?.last_sent;
        const sentKey = `${today}_${type}`;
        if (lastSent === sentKey) continue;

        try {
            const { message, provider } = await generateMorningMessage(contact.profile, type);

            await sock.sendMessage(contact.jid, { text: message });

            updateLastSent(contact.jid, sentKey);
            sent++;

            logger.success(`[MORNING] ✅ Sent ${type} to ${contact.profile?.name || contact.jid} via ${provider}`);

            // Stagger sends — 1.5s between each to avoid rate limits
            await new Promise(r => setTimeout(r, 1500));

        } catch (err) {
            failed++;
            logger.error(`[MORNING] ❌ Failed for ${contact.jid}: ${err.message}`);
        }
    }

    logger.success(`[MORNING] Done. Sent: ${sent} | Failed: ${failed}`);
}

// ============================================
// SCHEDULER TICK — runs every minute
// ============================================

export function startMorningScheduler(sock) {
    logger.success('[MORNING] ✅ Morning message scheduler started (EAT timezone)');

    setInterval(async () => {
        const { hours, minutes } = getEATTime();

        // 6:00 AM EAT → morning
        if (hours === 6 && minutes === 0) {
            await sendMorningMessages(sock, 'morning');
        }

        // 9:00 PM EAT → night
        if (hours === 21 && minutes === 0) {
            await sendMorningMessages(sock, 'night');
        }

    }, 60 * 1000); // tick every 60 seconds
}