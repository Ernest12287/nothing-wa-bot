import { certificateHandler } from '../brain/documents/pdf/index.js';
import { formatCertificate, formatError } from '../brain/documents/pdf/ascii.js';

const certificate = {
    name: 'certificate',
    description: 'Generate a certificate PDF for a name',
    usage: '.certificate <name>',
    category: 'documents',
    ownerOnly: false, groupOnly: false, dmOnly: false, adminOnly: false,

    async execute(sock, message, args) {
        const chatJid  = message.key.remoteJid;
        const replyJid = chatJid.endsWith('@g.us') ? chatJid : (message.key.remoteJidAlt || chatJid);
        const name     = args.join(' ');

        if (!name) {
            await sock.sendMessage(replyJid, { text: formatError('Certificate', 'Provide a name.\nUsage: .certificate John Doe') }, { quoted: message });
            return;
        }

        await sock.sendMessage(replyJid, { text: '🏆 _Generating certificate..._' }, { quoted: message });

        try {
            const { buffer, filename } = await certificateHandler(name);
            await sock.sendMessage(replyJid, {
                document: buffer,
                mimetype: 'application/pdf',
                fileName: filename,
                caption: formatCertificate(name)
            }, { quoted: message });
        } catch (e) {
            await sock.sendMessage(replyJid, { text: formatError('Certificate', e.message) }, { quoted: message });
        }
    }
};

export default certificate;