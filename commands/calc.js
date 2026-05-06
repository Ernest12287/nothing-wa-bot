// ============================================
// CALCULATOR COMMAND
// .calc 2 + 2
// .calc (10 * 5) / 2
// ============================================

import { calculate } from '../brain/utility/calculator/index.js';
import ascii from '../brain/utility/calculator/ascii.js';

const calc = {
    name: 'calc',
    description: 'Calculate a math expression',
    usage: '.calc <expression>',
    category: 'utility',
    ownerOnly: false,
    groupOnly: false,
    dmOnly: false,
    adminOnly: false,

    async execute(sock, message, args, commands) {
        const chatJid  = message.key.remoteJid;
        const replyJid = chatJid.endsWith('@g.us') ? chatJid : (message.key.remoteJidAlt || chatJid);

        const expression = args.join(' ');
        if (!expression) {
            return sock.sendMessage(replyJid, {
                text: ascii.formatError('No expression provided.', '*.calc 10 * 5 + 2*')
            }, { quoted: message });
        }

        try {
            const result = calculate(expression);
            if (!result) {
                return sock.sendMessage(replyJid, {
                    text: ascii.formatError('Invalid expression.', 'Use numbers and operators: + - * / % ^')
                }, { quoted: message });
            }
            return sock.sendMessage(replyJid, {
                text: ascii.formatResult(result)
            }, { quoted: message });
        } catch (err) {
            return sock.sendMessage(replyJid, {
                text: ascii.formatError(`Could not calculate: ${err.message}`, 'Use numbers and operators: + - * / % ^')
            }, { quoted: message });
        }
    }
};

export default calc;