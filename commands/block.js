// ============================================
// COMMAND: .block / .unblock
// Block sends a goodbye message first 😂
// ============================================

import { ownerOnly, getReplyJid, normalizeJid } from './ownerGuard.js';

export default {
    name: 'block',
    description: 'Block a number (sends message first)',
    category: 'owner',

    async execute(sock, message, args) {
        await ownerOnly(sock, message, async (replyJid) => {
            const num = args[0];
            if (!num) {
                await sock.sendMessage(replyJid, { text: `Usage: *.block <number>*\n_e.g. .block 2547XXXXXXXX_` });
                return;
            }

            const jid = normalizeJid(num);

            try {
                // Send goodbye before blocking 😂
                await sock.sendMessage(jid, {
                    text: `You have been blocked 😂 Bye bye!`
                });

                await new Promise(r => setTimeout(r, 1000));
                await sock.updateBlockStatus(jid, 'block');
                await sock.sendMessage(replyJid, { text: `🚫 Blocked +${num}` });
            } catch (err) {
                await sock.sendMessage(replyJid, { text: `❌ Failed: ${err.message}` });
            }
        });
    }
};