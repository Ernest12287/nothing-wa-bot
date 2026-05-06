// ============================================
// QR CODE COMMAND
// .qr https://example.com
// .qr Hello World
// ============================================

import { generateQR } from '../brain/utility/qrcode/index.js';
import ascii from '../brain/utility/qrcode/ascii.js';

const qr = {
    name: 'qr',
    description: 'Generate a QR code for any text or URL',
    usage: '.qr <text or url>',
    category: 'utility',
    ownerOnly: false,
    groupOnly: false,
    dmOnly: false,
    adminOnly: false,

    async execute(sock, message, args, commands) {
        const chatJid  = message.key.remoteJid;
        const replyJid = chatJid.endsWith('@g.us') ? chatJid : (message.key.remoteJidAlt || chatJid);

        const text = args.join(' ');
        if (!text) {
            return sock.sendMessage(replyJid, {
                text: ascii.formatError('No text provided.', '*.qr https://example.com* or *.qr Hello World*')
            }, { quoted: message });
        }

        try {
            const { buffer } = await generateQR(text);
            return sock.sendMessage(replyJid, {
                image: buffer,
                caption: ascii.formatQR(text)
            }, { quoted: message });
        } catch (err) {
            return sock.sendMessage(replyJid, {
                text: ascii.formatError(err.message, 'Make sure the text is valid')
            }, { quoted: message });
        }
    }
};

export default qr;