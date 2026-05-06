// ============================================
// UPTIME COMMAND
// .uptime
// ============================================

import { getUptime } from '../brain/system/index.js';
import ascii from '../brain/system/ascii.js';

const uptime = {
    name: 'uptime',
    description: 'Check how long the bot has been running',
    usage: '.uptime',
    category: 'system',
    ownerOnly: false,
    groupOnly: false,
    dmOnly: false,
    adminOnly: false,

    async execute(sock, message, args, commands) {
        const chatJid  = message.key.remoteJid;
        const replyJid = chatJid.endsWith('@g.us') ? chatJid : (message.key.remoteJidAlt || chatJid);

        const result = getUptime();
        return sock.sendMessage(replyJid, {
            text: ascii.formatUptime(result)
        }, { quoted: message });
    }
};

export default uptime;