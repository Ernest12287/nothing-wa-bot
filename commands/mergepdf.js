import { mergePdfsHandler } from '../brain/documents/pdf/index.js';
import { formatMergePdf, formatError } from '../brain/documents/pdf/ascii.js';

// Usage: reply to a PDF while quoting another, OR
// the bot collects PDFs from a short session (simple: requires 2 quoted PDFs)
// Simple approach: user replies to a PDF with .mergepdf and attaches another

const mergepdf = {
    name: 'mergepdf',
    description: 'Merge multiple PDFs into one',
    usage: '.mergepdf (reply to a PDF, attach another)',
    category: 'documents',
    ownerOnly: false, groupOnly: false, dmOnly: false, adminOnly: false,

    async execute(sock, message, args) {
        const chatJid  = message.key.remoteJid;
        const replyJid = chatJid.endsWith('@g.us') ? chatJid : (message.key.remoteJidAlt || chatJid);

        const msg        = message.message;
        const currentDoc = msg?.documentMessage;
        const quotedDoc  = msg?.extendedTextMessage?.contextInfo?.quotedMessage?.documentMessage;

        const isPdf = (doc) => doc?.mimetype === 'application/pdf';

        if (!isPdf(currentDoc) || !isPdf(quotedDoc)) {
            await sock.sendMessage(replyJid, { text: formatError('MergePDF', 'Reply to a PDF while sending another PDF\nwith the caption .mergepdf') }, { quoted: message });
            return;
        }

        await sock.sendMessage(replyJid, { text: '🔗 _Merging PDFs..._' }, { quoted: message });

        try {
            // download both
            const stream1 = await sock.downloadMediaMessage(message);
            const chunks1 = [];
            for await (const c of stream1) chunks1.push(c);

            // quoted message re-download
            const quotedMsg = { message: { documentMessage: quotedDoc }, key: { ...message.key, id: msg.extendedTextMessage.contextInfo.stanzaId } };
            const stream2   = await sock.downloadMediaMessage(quotedMsg);
            const chunks2   = [];
            for await (const c of stream2) chunks2.push(c);

            const { buffer, count, filename } = await mergePdfsHandler([Buffer.concat(chunks1), Buffer.concat(chunks2)]);
            await sock.sendMessage(replyJid, {
                document: buffer,
                mimetype: 'application/pdf',
                fileName: filename,
                caption: formatMergePdf(count)
            }, { quoted: message });
        } catch (e) {
            await sock.sendMessage(replyJid, { text: formatError('MergePDF', e.message) }, { quoted: message });
        }
    }
};

export default mergepdf;