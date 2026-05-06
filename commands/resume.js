import { resumeHandler } from '../brain/documents/docx/index.js';
import { formatResume, formatError } from '../brain/documents/docx/ascii.js';

const resume = {
    name: 'resume',
    description: 'Generate a professional resume/CV',
    usage: '.resume <Name> | <Title> | <Email> | <Phone> | summary:<text> | skills:<a,b,c> | exp:<Role@Company@Period@Desc> | edu:<Degree@School@Year>',
    category: 'documents',
    ownerOnly: false, groupOnly: false, dmOnly: false, adminOnly: false,

    async execute(sock, message, args) {
        const chatJid  = message.key.remoteJid;
        const replyJid = chatJid.endsWith('@g.us') ? chatJid : (message.key.remoteJidAlt || chatJid);
        const input    = args.join(' ');

        if (!input) {
            const help =
`Usage: .resume <Name> | <Title> | <Email> | <Phone> | summary:<text> | skills:<a,b,c> | exp:<Role@Company@Period@Desc> | edu:<Degree@School@Year>

Example:
.resume John Doe | Software Engineer | john@email.com | +254700000 | summary:Passionate developer | skills:JS,Node,React | exp:Dev@Acme@2022-2024@Built APIs | edu:BSc CS@MIT@2022`;
            await sock.sendMessage(replyJid, { text: formatError('Resume', help) }, { quoted: message });
            return;
        }

        await sock.sendMessage(replyJid, { text: '📄 _Generating your resume..._' }, { quoted: message });

        try {
            const { buffer, name, filename } = await resumeHandler(input);
            await sock.sendMessage(replyJid, {
                document: buffer,
                mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                fileName: filename,
                caption: formatResume(name)
            }, { quoted: message });
        } catch (e) {
            await sock.sendMessage(replyJid, { text: formatError('Resume', e.message) }, { quoted: message });
        }
    }
};

export default resume;