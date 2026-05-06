// ============================================
// COMMAND: .disappear <24h/7d/90d/off>
// Set disappearing messages in current chat
// ============================================

import { ownerOnly, getReplyJid } from './ownerGuard.js';

const TIMES = {
    '24h': 86400,
    '7d':  604800,
    '90d': 7776000,
    'off': 0
};

export default {
    name: 'disappear',
    description: 'Set disappearing messages: 24h / 7d / 90d / off',
    category: 'owner',

    async execute(sock, message, args) {
        await ownerOnly(sock, message, async (replyJid) => {
            const opt = args[0]?.toLowerCase();

            if (!opt || !TIMES.hasOwnProperty(opt)) {
                await sock.sendMessage(replyJid, {
                    text: `Usage: *.disappear <24h | 7d | 90d | off>*`
                });
                return;
            }

            try {
                await sock.sendMessage(replyJid, {
                    disappearingMessagesInChat: TIMES[opt] === 0 ? false : TIMES[opt]
                });

                const msg = TIMES[opt] === 0
                    ? `✅ Disappearing messages *off*`
                    : `✅ Disappearing messages set to *${opt}*`;

                await sock.sendMessage(replyJid, { text: msg });
            } catch (err) {
                await sock.sendMessage(replyJid, { text: `❌ Failed: ${err.message}` });
            }
        });
    }
};