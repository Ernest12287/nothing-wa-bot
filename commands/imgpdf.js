import { imgToPdfHandler } from '../brain/documents/pdf/index.js';
import { formatImgPdf, formatError } from '../brain/documents/pdf/ascii.js';

const imgpdf = {
    name: 'imgpdf',
    description: 'Convert a sent image to a PDF',
    usage: '.imgpdf (send with image)',
    category: 'documents',
    ownerOnly: false, groupOnly: false, dmOnly: false, adminOnly: false,

    async execute(sock, message, args) {
        const chatJid  = message.key.remoteJid;
        const replyJid = chatJid.endsWith('@g.us') ? chatJid : (message.key.remoteJidAlt || chatJid);

        const msg     = message.message;
        const imgMsg  = msg?.imageMessage || msg?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;

        if (!imgMsg) {
            await sock.sendMessage(replyJid, { text: formatError('ImgPDF', 'Send an image with the caption .imgpdf\nor reply to an image with .imgpdf') }, { quoted: message });
            return;
        }

        await sock.sendMessage(replyJid, { text: '🖼️ _Converting image to PDF..._' }, { quoted: message });

        try {
            const stream   = await sock.downloadMediaMessage(message);
            const chunks   = [];
            for await (const chunk of stream) chunks.push(chunk);
            const imgBuffer = Buffer.concat(chunks);
            const mimeType  = imgMsg.mimetype || 'image/jpeg';

            const { buffer, filename } = await imgToPdfHandler(imgBuffer, mimeType);
            await sock.sendMessage(replyJid, {
                document: buffer,
                mimetype: 'application/pdf',
                fileName: filename,
                caption: formatImgPdf()
            }, { quoted: message });
        } catch (e) {
            await sock.sendMessage(replyJid, { text: formatError('ImgPDF', e.message) }, { quoted: message });
        }
    }
};

export default imgpdf;