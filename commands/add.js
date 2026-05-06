// ============================================
// COMMAND: .add <tag>
// Tags the current chat with a label
// e.g. .add brother, .add crush, .add classmate
// ============================================

import { ownerOnly, getReplyJid } from './ownerGuard.js';
import { addToTag, getTagsForJid } from '../brain/contacts/friendsEngine.js';
import { getContact } from '../brain/contacts/engine.js';

export default {
    name: 'add',
    description: 'Tag current chat (e.g. .add brother)',
    category: 'owner',

    async execute(sock, message, args) {
        await ownerOnly(sock, message, async (replyJid) => {
            const tag = args[0]?.toLowerCase();
            if (!tag) {
                await sock.sendMessage(replyJid, {
                    text: `Usage: *.add <tag>*\n_e.g. .add brother_`
                });
                return;
            }

            // Tag the current chat JID
            addToTag(tag, replyJid);

            // Try get their name from contacts
            const contact = getContact(replyJid);
            const name = contact?.profile?.name || replyJid.replace('@s.whatsapp.net', '');

            // Show all tags this person has
            const allTags = getTagsForJid(replyJid);

            await sock.sendMessage(replyJid, {
                text: `✅ *${name}* tagged as *${tag}*\n\n🏷️ All tags: ${allTags.map(t => `_${t}_`).join(', ')}`
            });
        });
    }
};