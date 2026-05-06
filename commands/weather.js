// ============================================
// WEATHER COMMAND
// .weather Nairobi
// .weather New York
// ============================================

import { getWeather } from '../brain/utility/weather/index.js';
import ascii from '../brain/utility/weather/ascii.js';

const weather = {
    name: 'weather',
    description: 'Get current weather for any city',
    usage: '.weather <city>',
    category: 'utility',
    ownerOnly: false,
    groupOnly: false,
    dmOnly: false,
    adminOnly: false,

    async execute(sock, message, args, commands) {
        const chatJid  = message.key.remoteJid;
        const replyJid = chatJid.endsWith('@g.us') ? chatJid : (message.key.remoteJidAlt || chatJid);

        const city = args.join(' ');
        if (!city) {
            return sock.sendMessage(replyJid, {
                text: ascii.formatError('No city provided.', '*.weather Nairobi*')
            }, { quoted: message });
        }

        await sock.sendMessage(replyJid, {
            text: `⏳ _Fetching weather for *${city}*..._`
        }, { quoted: message });

        try {
            const result = await getWeather(city);
            return sock.sendMessage(replyJid, {
                text: ascii.formatWeather(result)
            }, { quoted: message });
        } catch (err) {
            return sock.sendMessage(replyJid, {
                text: ascii.formatError(err.message, 'Try a different city name')
            }, { quoted: message });
        }
    }
};

export default weather;