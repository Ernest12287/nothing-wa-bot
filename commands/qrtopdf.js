import { qrToPdfHandler } from '../brain/documents/pdf/index.js';
import { formatQrPdf, formatError } from '../brain/documents/pdf/ascii.js';

const qrtopdf = {
    name: 'qrtopdf',
    description: 'Generate a QR code as a PDF',
    usage: '.qrtopdf <text or URL>',
    category: 'documents',
    ownerOnly: false, groupOnly: false, dmOnly: false, adminOnly: false,

    async execute(sock, message, args) {
        const chatJid  = message.key.remoteJid;
        const replyJid = chatJid.endsWith('@g.us') ? chatJid : (message.key.remoteJidAlt || chatJid);
        const text     = args.join(' ');

        if (!text) {
            await sock.sendMessage(replyJid, { text: formatError('QRtoPDF', 'Provide text or a URL.\nUsage: .qrtopdf https://example.com') }, { quoted: message });
            return;
        }

        await sock.sendMessage(replyJid, { text: '📱 _Generating QR code PDF..._' }, { quoted: message });

        try {
            const { buffer, filename } = await qrToPdfHandler(text);
            await sock.sendMessage(replyJid, {
                document: buffer,
                mimetype: 'application/pdf',
                fileName: filename,
                caption: formatQrPdf(text)
            }, { quoted: message });
        } catch (e) {
            await sock.sendMessage(replyJid, { text: formatError('QRtoPDF', e.message) }, { quoted: message });
        }
    }
};

export default qrtopdf;