// ============================================
// URL SHORTENER COMMAND
// .shorten https://example.com/very/long/url
// ============================================

import { shortenUrl } from '../brain/utility/urlshortener/index.js';
import ascii from '../brain/utility/urlshortener/ascii.js';

const shorten = {
    name: 'shorten',
    description: 'Shorten a long URL',
    usage: '.shorten <url>',
    category: 'utility',
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
                text: ascii.formatError('No URL provided.', '*.shorten https://example.com/...*')
            }, { quoted: message });
        }

        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            return sock.sendMessage(replyJid, {
                text: ascii.formatError('Invalid URL.', 'URL must start with http:// or https://')
            }, { quoted: message });
        }

        try {
            const result = await shortenUrl(url);
            return sock.sendMessage(replyJid, {
                text: ascii.formatShortened(result)
            }, { quoted: message });
        } catch (err) {
            return sock.sendMessage(replyJid, {
                text: ascii.formatError(err.message, 'Make sure the URL is valid')
            }, { quoted: message });
        }
    }
};

export default shorten;