// ============================================
// TIKTOK AUDIO COMMAND
// .tiktokaudio <url>
// ============================================

import { audioHandler } from '../brain/socials/tiktok/index.js';
import ascii from '../brain/socials/tiktok/ascii.js';
import fs from 'fs';

const tiktokaudio = {
    name: 'tiktokaudio',
    description: 'Download TikTok audio as MP3',
    usage: '.tiktokaudio <url>',
    category: 'socials',
    ownerOnly: false,
    groupOnly: false,
    dmOnly: false,
    adminOnly: false,

    async execute(sock, message, args, commands) {
        const chatJid  = message.key.remoteJid;
        const replyJid = chatJid.endsWith('@g.us') ? chatJid : (message.key.remoteJidAlt || chatJid);

        const url = args[0];
        if (!url) {
            return sock.sendMessage(replyJid, {
                text: ascii.formatError('No URL provided.', '*.tiktokaudio https://tiktok.com/...*')
            }, { quoted: message });
        }

        if (!url.includes('tiktok.com')) {
            return sock.sendMessage(replyJid, {
                text: ascii.formatError('Invalid URL.', 'Must be a TikTok link')
            }, { quoted: message });
        }

        await sock.sendMessage(replyJid, {
            text: '⏳ _Fetching audio, please wait..._'
        }, { quoted: message });

        try {
            const { data, filepath, cleanup } = await audioHandler(url);

            await sock.sendMessage(replyJid, {
                text: ascii.formatAudio(data)
            }, { quoted: message });

            await sock.sendMessage(replyJid, {
                audio: { stream: fs.createReadStream(filepath) },
                mimetype: 'audio/mpeg',
                ptt: false
            }, { quoted: message });

            cleanup();

        } catch (err) {
            return sock.sendMessage(replyJid, {
                text: ascii.formatError(`Download failed: ${err.message}`, 'Make sure the TikTok link is valid and public')
            }, { quoted: message });
        }
    }
};

export default tiktokaudio;