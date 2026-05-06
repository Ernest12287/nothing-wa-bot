// ============================================
// COMMAND: .pp
// Reply to an image → set as bot profile pic
// ============================================

import { downloadMediaMessage } from 'baileys';
import { ownerOnly, getReplyJid } from './ownerGuard.js';

export default {
    name: 'pp',
    description: 'Reply to an image to set bot profile picture',
    category: 'owner',

    async execute(sock, message, args) {
        await ownerOnly(sock, message, async (replyJid) => {
            const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const hasImage = quoted?.imageMessage || message.message?.imageMessage;

            if (!hasImage) {
                await sock.sendMessage(replyJid, { text: `❌ Reply to an image with *.pp*` });
                return;
            }

            try {
                // Build a fake message object for downloadMediaMessage
                const imgMessage = quoted?.imageMessage
                    ? { message: quoted, key: message.key }
                    : message;

                const buffer = await downloadMediaMessage(imgMessage, 'buffer', {});
                await sock.updateProfilePicture(sock.user.id, buffer);
                await sock.sendMessage(replyJid, { text: `✅ Profile picture updated!` });
            } catch (err) {
                await sock.sendMessage(replyJid, { text: `❌ Failed: ${err.message}` });
            }
        });
    }
};