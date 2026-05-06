// ============================================
// OWNER GUARD
// Reusable owner check + JID helpers
// ============================================

import config from '../config.js';

export function getSenderJid(message) {
    return message.key.participantAlt ||
           message.key.remoteJidAlt   ||
           message.key.participant    ||
           message.key.remoteJid;
}

export function getReplyJid(message) {
    return message.key.remoteJid;
}

export function isOwner(message) {
    const ownerNumber = config.user.number.replace(/[^0-9]/g, '');
    const senderNum   = getSenderJid(message).replace(/[^0-9]/g, '');
    return senderNum === ownerNumber;
}

export function normalizeJid(num) {
    // accepts 2547XXXXXXXX or +2547XXXXXXXX or 2547XXXXXXXX@s.whatsapp.net
    const clean = num.replace(/[^0-9]/g, '');
    return `${clean}@s.whatsapp.net`;
}

export async function ownerOnly(sock, message, cb) {
    const replyJid = getReplyJid(message);
    if (!isOwner(message)) {
        await sock.sendMessage(replyJid, { text: `🚫 Owner only.` });
        return;
    }
    await cb(replyJid);
}