// ============================================
// COMMAND: .setname
// ============================================

import { ownerOnly } from './ownerGuard.js';

export default {
    name: 'setname',
    description: 'Change bot display name',
    category: 'owner',

    async execute(sock, message, args) {
        await ownerOnly(sock, message, async (replyJid) => {
            const name = args.join(' ');
            if (!name) {
                await sock.sendMessage(replyJid, { text: `Usage: *.setname <new name>*` });
                return;
            }
            try {
                await sock.updateProfileName(name);
                await sock.sendMessage(replyJid, { text: `✅ Name updated to *${name}*` });
            } catch (err) {
                await sock.sendMessage(replyJid, { text: `❌ Failed: ${err.message}` });
            }
        });
    }
};