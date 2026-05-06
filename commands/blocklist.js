// ============================================
// COMMAND: .blocklist
// View all blocked numbers
// ============================================

import { ownerOnly } from './ownerGuard.js';

export default {
    name: 'blocklist',
    description: 'View all blocked numbers',
    category: 'owner',

    async execute(sock, message, args) {
        await ownerOnly(sock, message, async (replyJid) => {
            try {
                const list = await sock.fetchBlocklist();

                if (!list?.length) {
                    await sock.sendMessage(replyJid, { text: `📭 No blocked numbers.` });
                    return;
                }

                const lines = [`*🚫 BLOCKED NUMBERS (${list.length})*\n`];
                list.forEach((jid, i) => {
                    lines.push(`${i + 1}. +${jid.replace('@s.whatsapp.net', '')}`);
                });

                await sock.sendMessage(replyJid, { text: lines.join('\n') });
            } catch (err) {
                await sock.sendMessage(replyJid, { text: `❌ Failed: ${err.message}` });
            }
        });
    }
};