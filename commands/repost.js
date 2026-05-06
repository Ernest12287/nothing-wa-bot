// ============================================
// REPOST COMMAND
// Reply to a status with .repost → posts it on bot's status
// Supports: images, videos
// ============================================

import { downloadMediaMessage } from 'baileys';
import logging from '../logger.js';

const repost = {
    name: 'repost',
    description: "Reply to a status to repost it on the bot's status",
    usage: '.repost [optional caption]',
    category: 'utility',

    async execute(sock, message, args, commands) {
        const chatJid  = message.key.remoteJid;
        const replyJid = chatJid.endsWith('@g.us') ? chatJid : (message.key.remoteJidAlt || chatJid);

        const contextInfo = message.message?.extendedTextMessage?.contextInfo;
        const quoted = contextInfo?.quotedMessage;

        if (!quoted) {
            await sock.sendMessage(replyJid, {
                text: '❌ Reply to a status with *.repost* to repost it.'
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
                text: '❌ No supported media. Only images and videos can be reposted.'
            }, { quoted: message });
            return;
        }

        const mediaType = mediaTypes[detectedType];
        const mediaInfo = quoted[detectedType];
        const caption = args.length > 0 ? args.join(' ') : (mediaInfo.caption || '');

        await sock.sendMessage(chatJid, { react: { text: '⏳', key: message.key } });

        try {
            const buffer = await downloadMediaMessage(
                {
                    key: { remoteJid: 'status@broadcast', id: contextInfo.stanzaId, participant: contextInfo.participant },
                    message: quoted
                },
                'buffer', {}
            );

            if (mediaType === 'image') {
                await sock.sendMessage('status@broadcast', { image: buffer, caption, statusJidList: [] });
            } else {
                await sock.sendMessage('status@broadcast', { video: buffer, caption, mimetype: 'video/mp4', statusJidList: [] });
            }

            await sock.sendMessage(chatJid, { react: { text: '✅', key: message.key } });
            await sock.sendMessage(replyJid, {
                text: `✅ *Reposted!*\n\n📤 ${mediaType === 'image' ? 'Image' : 'Video'} posted to status${caption ? `\n💬 ${caption}` : ''}`
            }, { quoted: message });

            logging.success(`[REPOST] Reposted ${mediaType} to status`);

        } catch (error) {
            logging.error(`[REPOST] Failed: ${error.message}`);
            await sock.sendMessage(chatJid, { react: { text: '❌', key: message.key } });
            await sock.sendMessage(replyJid, { text: `❌ Repost failed: ${error.message}` }, { quoted: message });
        }
    }
};

export default repost;