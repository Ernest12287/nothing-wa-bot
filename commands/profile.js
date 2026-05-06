// ============================================
// COMMAND: .profile
// User fetches their own profile + pic
// ============================================

import { getContact } from '../brain/contacts/engine.js';
import config from '../config.js';

const RELIGION_EMOJI = { islam: '☪️', christian: '✝️', other: '🌍' };
const GENDER_EMOJI   = { male: '👨', female: '👩' };

export default {
    name: 'profile',
    description: 'View your saved profile',
    category: 'contacts',

    async execute(sock, message, args) {
        const senderJid = message.key.participantAlt ||
                          message.key.remoteJidAlt   ||
                          message.key.participant    ||
                          message.key.remoteJid;

        const replyJid = message.key.remoteJid;
        const contact  = getContact(senderJid);

        // ── Not registered ──
        if (!contact || contact.status !== 'registered') {
            await sock.sendMessage(replyJid, {
                text: `❌ You don't have a saved profile yet.\n\nSend me a message and I'll walk you through setup! 😊`
            });
            return;
        }

        const p = contact.profile;
        const scheduleCount = contact.schedules?.filter(s => !s.sent).length || 0;

        // ── Build profile text ──
        const lines = [
            `╔══════════════════════╗`,
            `║     YOUR PROFILE     ║`,
            `╚══════════════════════╝`,
            ``,
            `👤 *Name:* ${p.name || '—'}`,
            `${GENDER_EMOJI[p.gender] || '👤'} *Gender:* ${p.gender || '—'}`,
            `${RELIGION_EMOJI[p.religion] || '🙏'} *Religion:* ${p.religion || '—'}`,
            `🎂 *Age:* ${p.age || '—'}`,
            `📧 *Email:* ${p.email || '—'}`,
            ``,
            `📅 *Active schedules:* ${scheduleCount}`,
            `🌅 *Morning messages:* ${contact.morning_messages?.enabled ? 'On ✅' : 'Off ❌'}`,
            ``,
            `_First seen: ${new Date(contact.meta.first_seen).toLocaleDateString('en-KE', { timeZone: 'Africa/Nairobi' })}_`
        ].join('\n');

        // ── Try fetch profile pic ──
        try {
            const ppUrl = await sock.profilePictureUrl(senderJid, 'image');
            await sock.sendMessage(replyJid, {
                image: { url: ppUrl },
                caption: lines
            });
        } catch (_) {
            // No pic — send text only
            await sock.sendMessage(replyJid, { text: lines });
        }
    }
};