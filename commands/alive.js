// ============================================
// ALIVE COMMAND
// .alive
// ============================================

import { isAlive } from '../brain/system/index.js';
import ascii from '../brain/system/ascii.js';

const alive = {
    name: 'alive',
    description: 'Check if the bot is online',
    usage: '.alive',
    category: 'system',
    ownerOnly: false,
    groupOnly: false,
    dmOnly: false,
    adminOnly: false,

    async execute(sock, message, args, commands) {
        const chatJid  = message.key.remoteJid;
        const replyJid = chatJid.endsWith('@g.us') ? chatJid : (message.key.remoteJidAlt || chatJid);

        const result = isAlive();
        return sock.sendMessage(replyJid, {
            text: ascii.formatAlive(result)
        }, { quoted: message });
    }
};

export default alive;