// ============================================
// BRAIN/UTILITY/QR CODE — ASCII
// ============================================

const THEMES = {
    result: { tl: '📷', tr: '🔲', bl: '✅', br: '⚡', div: '─' },
    error:  { tl: '❌', tr: '⚠️',  bl: '💡', br: '🔧', div: '─' },
};

function block({ theme = 'result', title, body, footer }) {
    const t = THEMES[theme];
    const div = t.div.repeat(30);
    return [
        `${t.tl} *${title}* ${t.tr}`,
        div,
        body,
        '',
        `${t.bl} _${footer || ''}_ ${t.br}`
    ].join('\n');
}

export function formatQR(text) {
    return block({
        theme: 'result',
        title: 'QR CODE',
        body: `📝 *Content:* ${text.slice(0, 100)}${text.length > 100 ? '...' : ''}`,
        footer: 'Eren Bot • QR Generator'
    });
}

export function formatError(msg, hint = null) {
    return block({
        theme: 'error',
        title: 'Error',
        body: `${msg}${hint ? `\n\n💡 *Tip:* ${hint}` : ''}`,
        footer: ''
    });
}

export default { formatQR, formatError };