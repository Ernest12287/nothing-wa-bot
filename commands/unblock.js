// ============================================
// COMMAND: .unblock
// ============================================

import { ownerOnly, normalizeJid } from './ownerGuard.js';

export default {
    name: 'unblock',
    description: 'Unblock a number',
    category: 'owner',

    async execute(sock, message, args) {
        await ownerOnly(sock, message, async (replyJid) => {
            const num = args[0];
            if (!num) {
                await sock.sendMessage(replyJid, { text: `Usage: *.unblock <number>*` });
                return;
            }

            try {
                const jid = normalizeJid(num);
                await sock.updateBlockStatus(jid, 'unblock');
                await sock.sendMessage(jid, { text: `✅ You've been unblocked! Welcome back 👋` });
                await sock.sendMessage(replyJid, { text: `✅ Unblocked +${num}` });
            } catch (err) {
                await sock.sendMessage(replyJid, { text: `❌ Failed: ${err.message}` });
            }
        });
    }
};