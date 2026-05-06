// ============================================
// BRAIN/UTILITY/URL SHORTENER — ASCII
// ============================================

const THEMES = {
    result: { tl: '🔗', tr: '✂️',  bl: '✅', br: '⚡', div: '─' },
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

export function formatShortened(data) {
    return block({
        theme: 'result',
        title: 'URL SHORTENER',
        body: `📎 *Original:*  ${data.original}\n🔗 *Shortened:* ${data.shortened}`,
        footer: 'Powered by TinyURL • Free'
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

export default { formatShortened, formatError };