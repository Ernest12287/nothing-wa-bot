// ============================================
// MENU COMMAND
// .menu — sends image + formatted menu
// ============================================

import fs from 'fs';
import config from '../config.js';

const menu = {
    name: 'menu',
    description: 'Show all available commands',
    usage: '.menu',
    category: 'system',
    ownerOnly: false,
    groupOnly: false,
    dmOnly: false,
    adminOnly: false,

    async execute(sock, message, args, commands) {
        const chatJid  = message.key.remoteJid;
        const replyJid = chatJid.endsWith('@g.us')
            ? chatJid
            : (message.key.remoteJidAlt || chatJid);

        const caption = buildMenu(commands);

        const imgPath = config.bot.welcomeImage;
        if (fs.existsSync(imgPath)) {
            await sock.sendMessage(replyJid, {
                image: fs.readFileSync(imgPath),
                caption
            }, { quoted: message });
        } else {
            await sock.sendMessage(replyJid, { text: caption }, { quoted: message });
        }
    }
};

export default menu;

// ============================================
// MENU BUILDER
// ============================================

const CATEGORY_ICONS = {
    system:    '⚙️',
    utility:   '🛠️',
    ai:        '🤖',
    bible:     '📖',
    socials:   '🌐',
    documents: '📄',
    fun:       '🎮',
    owner:     '👑',
    general:   '✨',
};

function buildMenu(commands) {
    const categories = {};
    for (const [, cmd] of commands) {
        const cat = (cmd.category || 'general').toLowerCase();
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(cmd);
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-KE', {
        hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Africa/Nairobi'
    });
    const dateStr = now.toLocaleDateString('en-KE', {
        weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Africa/Nairobi'
    });

    const totalCmds = commands.size;

    const header = [
        `┏━━━━━━━━━━━━━━━━━━━━━━━━━┓`,
        `┃  🌟 *${config.bot.name}*  ┃`,
        `┃  _v${config.bot.version} • ${timeStr}_  ┃`,
        `┗━━━━━━━━━━━━━━━━━━━━━━━━━┛`,
        ``,
        `📅 _${dateStr}_`,
        `👤 *Owner:* ${config.creator.name}`,
        `📌 *Prefix:* ${config.bot.defaultPrefix}  |  *Commands:* ${totalCmds}`,
        ``,
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    ].join('\n');

    const body = Object.entries(categories).map(([cat, cmds]) => {
        const icon = CATEGORY_ICONS[cat] || '▸';
        const title = `\n${icon} *${cat.toUpperCase()}*`;
        const list = cmds
            .map(c => `  ┣ .${c.name}${c.description ? ` — _${c.description}_` : ''}`)
            .join('\n');
        return `${title}\n${list}`;
    }).join('\n\n');

    const footer = [
        ``,
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        ``,
        `💬 *Support*`,
        `  ┣ TG: ${config.social.telegram}`,
        `  ┗ WA: ${config.social.whatsappChannel}`,
        ``,
        `_Powered by Baileys v7_ ⚡`,
    ].join('\n');

    return [header, body, footer].join('\n');
}