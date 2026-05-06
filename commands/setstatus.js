// ============================================
// COMMAND: .setstatus
// ============================================

import { ownerOnly } from './ownerGuard.js';

export default {
    name: 'setstatus',
    description: 'Change bot WhatsApp status',
    category: 'owner',

    async execute(sock, message, args) {
        await ownerOnly(sock, message, async (replyJid) => {
            const status = args.join(' ');
            if (!status) {
                await sock.sendMessage(replyJid, { text: `Usage: *.setstatus <text>*` });
                return;
            }
            try {
                await sock.updateProfileStatus(status);
                await sock.sendMessage(replyJid, { text: `✅ Status updated to: _${status}_` });
            } catch (err) {
                await sock.sendMessage(replyJid, { text: `❌ Failed: ${err.message}` });
            }
        });
    }
};