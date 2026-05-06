// ============================================
// BRAIN/SYSTEM — ASCII
// System-specific message formatting
// ============================================

const THEMES = {
    alive:  { tl: '💚', tr: '🤖', bl: '✅', br: '⚡', div: '─' },
    uptime: { tl: '⏱️',  tr: '🤖', bl: '✅', br: '💫', div: '─' },
    ping:   { tl: '🏓', tr: '⚡', bl: '✅', br: '💨', div: '─' },
    system: { tl: '💻', tr: '⚙️',  bl: '✅', br: '🔧', div: '═' },
    menu:   { tl: '📋', tr: '🤖', bl: '✨', br: '⚡', div: '═' },
};

function block({ theme = 'system', title, body, footer }) {
    const t = THEMES[theme];
    const div = t.div.repeat(30);
    const lines = [];
    lines.push(`${t.tl} *${title}* ${t.tr}`);
    lines.push(div);
    lines.push(body);
    lines.push('');
    lines.push(`${t.bl} _${footer || ''}_ ${t.br}`);
    return lines.join('\n');
}

export function formatAlive(data) {
    return block({
        theme: 'alive',
        title: 'EREN IS ALIVE',
        body: `I am online and ready to serve ⚡\n\n🕐 _${new Date(data.timestamp).toLocaleString()}_`,
        footer: 'Eren Bot • Online'
    });
}

export function formatUptime(u) {
    return block({
        theme: 'uptime',
        title: 'UPTIME',
        body: `🗓️ *Days*    ——  ${u.days}\n⏰ *Hours*   ——  ${u.hours}\n⏱️ *Minutes* ——  ${u.minutes}\n⏲️ *Seconds* ——  ${u.seconds}`,
        footer: 'Eren Bot • Running'
    });
}

export function formatPing(ms) {
    const speed = ms < 100 ? '🟢 Fast' : ms < 300 ? '🟡 Normal' : '🔴 Slow';
    return block({
        theme: 'ping',
        title: 'PING',
        body: `📡 *Response:* ${ms}ms\n📊 *Status:*   ${speed}`,
        footer: 'Eren Bot • Pong'
    });
}

export function formatSystemInfo(info) {
    return block({
        theme: 'system',
        title: 'SYSTEM INFO',
        body: [
            `💠 *Platform:* ${info.platform} (${info.arch})`,
            `🖥️ *Host:*     ${info.hostname}`,
            `⚙️ *CPUs:*     ${info.cpus} cores`,
            `🧠 *RAM Used:* ${info.usedMem} / ${info.totalMem}`,
            `💾 *RAM Free:* ${info.freeMem}`,
            `🟢 *Node:*     ${info.nodeVersion}`,
            `🔑 *PID:*      ${info.pid}`,
        ].join('\n'),
        footer: 'Eren Bot • System'
    });
}

export function formatMenu(commands) {
    const categories = {};
    for (const [, cmd] of commands) {
        const cat = cmd.category || 'general';
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(cmd);
    }

    const body = Object.entries(categories).map(([cat, cmds]) => {
        const list = cmds.map(c => `  ▸ *.${c.name}* — ${c.description}`).join('\n');
        return `*${cat.toUpperCase()}*\n${list}`;
    }).join('\n\n');

    return block({
        theme: 'menu',
        title: 'EREN BOT — MENU',
        body,
        footer: `${commands.size} commands loaded`
    });
}

export default { formatAlive, formatUptime, formatPing, formatSystemInfo, formatMenu };