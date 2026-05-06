import { pdfInfoHandler } from '../brain/documents/pdf/index.js';
import { formatPdfInfo, formatError } from '../brain/documents/pdf/ascii.js';

const pdfinfo = {
    name: 'pdfinfo',
    description: 'Get metadata from a PDF file',
    usage: '.pdfinfo (send or reply to a PDF)',
    category: 'documents',
    ownerOnly: false, groupOnly: false, dmOnly: false, adminOnly: false,

    async execute(sock, message, args) {
        const chatJid  = message.key.remoteJid;
        const replyJid = chatJid.endsWith('@g.us') ? chatJid : (message.key.remoteJidAlt || chatJid);

        const msg    = message.message;
        const docMsg = msg?.documentMessage || msg?.extendedTextMessage?.contextInfo?.quotedMessage?.documentMessage;

        if (!docMsg || docMsg.mimetype !== 'application/pdf') {
            await sock.sendMessage(replyJid, { text: formatError('PDFInfo', 'Send a PDF with the caption .pdfinfo\nor reply to a PDF with .pdfinfo') }, { quoted: message });
            return;
        }

        try {
            const stream = await sock.downloadMediaMessage(message);
            const chunks = [];
            for await (const chunk of stream) chunks.push(chunk);
            const pdfBuffer = Buffer.concat(chunks);

            const info = await pdfInfoHandler(pdfBuffer);
            await sock.sendMessage(replyJid, { text: formatPdfInfo(info) }, { quoted: message });
        } catch (e) {
            await sock.sendMessage(replyJid, { text: formatError('PDFInfo', e.message) }, { quoted: message });
        }
    }
};

export default pdfinfo;