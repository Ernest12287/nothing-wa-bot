// ============================================
// SYSTEM INFO COMMAND
// .systeminfo
// ============================================

import { getSystemInfo } from '../brain/system/index.js';
import ascii from '../brain/system/ascii.js';

const systeminfo = {
    name: 'systeminfo',
    description: 'Show system and hardware info',
    usage: '.systeminfo',
    category: 'system',
    ownerOnly: true,
    groupOnly: false,
    dmOnly: false,
    adminOnly: false,

    async execute(sock, message, args, commands) {
        const chatJid  = message.key.remoteJid;
        const replyJid = chatJid.endsWith('@g.us') ? chatJid : (message.key.remoteJidAlt || chatJid);

        const result = getSystemInfo();
        return sock.sendMessage(replyJid, {
            text: ascii.formatSystemInfo(result)
        }, { quoted: message });
    }
};

export default systeminfo;