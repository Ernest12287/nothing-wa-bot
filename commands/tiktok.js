// ============================================
// TIKTOK VIDEO COMMAND
// .tiktok <url>
// ============================================

import { fetchTikTok } from '../brain/socials/tiktok/tiktok.js';
import ascii from '../brain/socials/tiktok/ascii.js';

const tiktok = {
    name: 'tiktok',
    description: 'Download a TikTok video in HD',
    usage: '.tiktok <url>',
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
                text: ascii.formatError('No URL provided.', '*.tiktok https://tiktok.com/...*')
            }, { quoted: message });
        }

        if (!url.includes('tiktok.com')) {
            return sock.sendMessage(replyJid, {
                text: ascii.formatError('Invalid URL.', 'Must be a TikTok link')
            }, { quoted: message });
        }

        await sock.sendMessage(replyJid, {
            text: '⏳ _Fetching video details, please wait..._'
        }, { quoted: message });

        try {
            const data = await fetchTikTok(url);

            // send cover image with info as caption
            if (data.cover) {
                const coverRes    = await fetch(data.cover);
                const coverBuffer = Buffer.from(await coverRes.arrayBuffer());
                await sock.sendMessage(replyJid, {
                    image: coverBuffer,
                    caption: ascii.formatVideo(data)
                }, { quoted: message });
            } else {
                await sock.sendMessage(replyJid, {
                    text: ascii.formatVideo(data)
                }, { quoted: message });
            }

            // download + send video
            const res    = await fetch(data.links.mp4_hd);
            const buffer = Buffer.from(await res.arrayBuffer());
            console.log('[TIKTOK] Buffer:', buffer.length, 'bytes');

            return sock.sendMessage(replyJid, {
                video: buffer,
                caption: `🎵 *${data.author_name}*\n${data.desc?.slice(0, 100) || ''}`,
                mimetype: 'video/mp4'
            }, { quoted: message });

        } catch (err) {
            console.error('[TIKTOK] Error:', err.message);
            return sock.sendMessage(replyJid, {
                text: ascii.formatError(`Download failed: ${err.message}`, 'Make sure the TikTok link is valid and public')
            }, { quoted: message });
        }
    }
};

export default tiktok;