// ============================================
// AMAZON COMMAND
// .amazon <query>
// ============================================

import piggy, { usePiggy } from 'nothing-browser';

let ready = false;
let amazon;

async function initPiggy() {
    if (ready) return;
    await piggy.launch({ mode: 'tab', binary: 'b/nothing-browser-headful.exe' });
    await piggy.register('amazon', 'https://www.amazon.com');
    piggy.actHuman(true);
    ({ amazon } = usePiggy());
    ready = true;
}

const amazonCmd = {
    name: 'amazon',
    description: 'Search Amazon products',
    usage: '.amazon <product>',
    category: 'utility',
    ownerOnly: false,
    groupOnly: false,
    dmOnly: false,
    adminOnly: false,

    async execute(sock, message, args, commands) {
        const chatJid  = message.key.remoteJid;
        const replyJid = chatJid.endsWith('@g.us') ? chatJid : (message.key.remoteJidAlt || chatJid);

        if (!args.length) {
            return sock.sendMessage(replyJid, {
                text: `❌ Usage: .amazon <product>\nExample: .amazon airpods`
            }, { quoted: message });
        }

        const query = args.join(' ');

        await sock.sendMessage(replyJid, {
            text: `🔍 Searching Amazon for *${query}*...`
        }, { quoted: message });

        try {
            await initPiggy();

            await amazon.navigate(`https://www.amazon.com/s?k=${encodeURIComponent(query)}`);
            await amazon.wait(3000);

            const products = await amazon.evaluate(() => {
                return Array.from(document.querySelectorAll('.s-result-item[data-asin]'))
                    .filter(el => el.getAttribute('data-asin'))
                    .slice(0, 5)
                    .map(el => ({
                        title: el.querySelector('h2 span')?.textContent?.trim() ?? '',
                        price: el.querySelector('.a-price .a-offscreen')?.textContent?.trim() || 'N/A',
                        rating: el.querySelector('.a-icon-alt')?.textContent?.trim() ?? 'No rating',
                        url: 'https://www.amazon.com' + (el.querySelector('a.a-link-normal[href]')?.getAttribute('href') ?? ''),
                    }));
            });

            if (!products.length) {
                return sock.sendMessage(replyJid, {
                    text: `😕 No results found for *${query}*`
                }, { quoted: message });
            }

            const lines = [
                `🛒 *Amazon — "${query}"*`,
                `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
            ];

            products.forEach((p, i) => {
                lines.push(
                    ``,
                    `*${i + 1}. ${p.title}*`,
                    `💰 ${p.price}`,
                    `⭐ ${p.rating}`,
                    `🔗 ${p.url}`,
                );
            });

            lines.push(``, `━━━━━━━━━━━━━━━━━━━━━━━━━━`);

            return sock.sendMessage(replyJid, { text: lines.join('\n') }, { quoted: message });

        } catch (err) {
            ready = false;
            return sock.sendMessage(replyJid, {
                text: `❌ Failed: ${err.message}`
            }, { quoted: message });
        }
    }
};

export default amazonCmd;