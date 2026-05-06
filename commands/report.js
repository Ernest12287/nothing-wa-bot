import { reportHandler } from '../brain/documents/docx/index.js';
import { formatReport, formatError } from '../brain/documents/docx/ascii.js';

const report = {
    name: 'report',
    description: 'Generate a formatted report document',
    usage: '.report <Title> | <Author> | <Heading:Content> | <Heading:Content>',
    category: 'documents',
    ownerOnly: false, groupOnly: false, dmOnly: false, adminOnly: false,

    async execute(sock, message, args) {
        const chatJid  = message.key.remoteJid;
        const replyJid = chatJid.endsWith('@g.us') ? chatJid : (message.key.remoteJidAlt || chatJid);
        const input    = args.join(' ');

        if (!input || !input.includes('|')) {
            const help =
`Usage: .report <Title> | <Author> | <Heading:Content> | <Heading:Content>

Example:
.report Sales Q1 2025 | Ernest | Overview:Sales increased by 20% this quarter | Conclusion:We exceeded all targets`;
            await sock.sendMessage(replyJid, { text: formatError('Report', help) }, { quoted: message });
            return;
        }

        await sock.sendMessage(replyJid, { text: '📊 _Generating your report..._' }, { quoted: message });

        try {
            const { buffer, title, filename } = await reportHandler(input);
            await sock.sendMessage(replyJid, {
                document: buffer,
                mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                fileName: filename,
                caption: formatReport(title)
            }, { quoted: message });
        } catch (e) {
            await sock.sendMessage(replyJid, { text: formatError('Report', e.message) }, { quoted: message });
        }
    }
};

export default report;