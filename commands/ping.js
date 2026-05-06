// ============================================
// PING COMMAND
// .ping
// ============================================

import { getPing } from '../brain/system/index.js';
import ascii from '../brain/system/ascii.js';

const ping = {
    name: 'ping',
    description: 'Check bot response time',
    usage: '.ping',
    category: 'system',
    ownerOnly: false,
    groupOnly: false,
    dmOnly: false,
    adminOnly: false,

    async execute(sock, message, args, commands) {
        const chatJid  = message.key.remoteJid;
        const replyJid = chatJid.endsWith('@g.us') ? chatJid : (message.key.remoteJidAlt || chatJid);

        const start = Date.now();
        await sock.sendMessage(replyJid, { text: '🏓' }, { quoted: message });
        const ms = Date.now() - start;

        return sock.sendMessage(replyJid, {
            text: ascii.formatPing(ms)
        }, { quoted: message });
    }
};

export default ping;