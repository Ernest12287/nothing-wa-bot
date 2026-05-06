// ============================================
// SAVE COMMAND
// Reply to a status with .save → sends media to your DM
// Supports: images, videos
// ============================================

import { downloadMediaMessage } from 'baileys';
import config from '../config.js';
import logging from '../logger.js';

const save = {
    name: 'save',
    description: 'Reply to a status to save its media to your DM',
    usage: '.save',
    category: 'utility',

    async execute(sock, message, args, commands) {
        const chatJid  = message.key.remoteJid;
        const replyJid = chatJid.endsWith('@g.us') ? chatJid : (message.key.remoteJidAlt || chatJid);
        const ownerJid = `${config.user.number}@s.whatsapp.net`;

        const contextInfo = message.message?.extendedTextMessage?.contextInfo;
        const quoted = contextInfo?.quotedMessage;

        if (!quoted) {
            await sock.sendMessage(replyJid, {
                text: '❌ Reply to a status with *.save* to save it.'
            }, { quoted: message });
            return;
        }

        const mediaTypes = {
            imageMessage: 'image',
            videoMessage: 'video',
        };

        const detectedType = Object.keys(mediaTypes).find(t => quoted[t]);

        if (!detectedType) {
            await sock.sendMessage(replyJid, {
                text: '❌ No supported media found. Only images and videos can be saved.'
            }, { quoted: message });
            return;
        }

        const mediaType = mediaTypes[detectedType];
        const mediaInfo = quoted[detectedType];

        await sock.sendMessage(chatJid, { react: { text: '⏳', key: message.key } });

        try {
            const buffer = await downloadMediaMessage(
                {
                    key: { remoteJid: 'status@broadcast', id: contextInfo.stanzaId, participant: contextInfo.participant },
                    message: quoted
                },
                'buffer', {}
            );

            const caption = mediaInfo.caption
                ? `📥 *Saved Status*\n\n💬 ${mediaInfo.caption}`
                : '📥 *Saved Status*';

            if (mediaType === 'image') {
                await sock.sendMessage(ownerJid, { image: buffer, caption });
            } else {
                await sock.sendMessage(ownerJid, { video: buffer, caption, mimetype: 'video/mp4' });
            }

            await sock.sendMessage(chatJid, { react: { text: '✅', key: message.key } });
            logging.success(`[SAVE] Saved ${mediaType} to owner DM`);

        } catch (error) {
            logging.error(`[SAVE] Failed: ${error.message}`);
            await sock.sendMessage(chatJid, { react: { text: '❌', key: message.key } });
            await sock.sendMessage(replyJid, { text: `❌ Save failed: ${error.message}` }, { quoted: message });
        }
    }
};

export default save;