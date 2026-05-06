// ============================================
// COMMAND: .untag <tag>
// Remove current chat from a tag
// ============================================

import { ownerOnly } from './ownerGuard.js';
import { removeFromTag } from '../brain/contacts/friendsEngine.js';

export default {
    name: 'untag',
    description: 'Remove current chat from a tag',
    category: 'owner',

    async execute(sock, message, args) {
        await ownerOnly(sock, message, async (replyJid) => {
            const tag = args[0]?.toLowerCase();
            if (!tag) {
                await sock.sendMessage(replyJid, { text: `Usage: *.untag <tag>*` });
                return;
            }

            const ok = removeFromTag(tag, replyJid);
            await sock.sendMessage(replyJid, {
                text: ok
                    ? `✅ Removed from *${tag}*`
                    : `❌ This chat wasn't in *${tag}*`
            });
        });
    }
};