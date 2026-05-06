// ============================================
// BRAIN/SOCIALS/TIKTOK — ASCII
// ============================================

const THEMES = {
    video: { tl: '🎵', tr: '📲', bl: '✅', br: '⬇️', div: '─' },
    audio: { tl: '🎵', tr: '🎧', bl: '✅', br: '⬇️', div: '─' },
    error: { tl: '❌', tr: '⚠️',  bl: '💡', br: '🔧', div: '─' },
};

function block({ theme = 'video', title, body, footer }) {
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

export function formatVideo(data) {
    return block({
        theme: 'video',
        title: 'TIKTOK VIDEO',
        body: [
            `👤 *Author:* ${data.author_name} (${data.author})`,
            `📝 *Caption:* ${data.desc?.slice(0, 80) || 'No caption'}${data.desc?.length > 80 ? '...' : ''}`,
            ``,
            `_Downloading HD video..._`
        ].join('\n'),
        footer: 'Powered by TikSave API • Free to use: ernest-tiksave.vercel.app'
    });
}

export function formatAudio(data) {
    return block({
        theme: 'audio',
        title: 'TIKTOK AUDIO',
        body: [
            `👤 *Author:* ${data.author_name} (${data.author})`,
            `📝 *Caption:* ${data.desc?.slice(0, 80) || 'No caption'}${data.desc?.length > 80 ? '...' : ''}`,
            ``,
            `_Extracting audio..._`
        ].join('\n'),
        footer: 'Powered by TikSave API • Free to use: ernest-tiksave.vercel.app'
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

export default { formatVideo, formatAudio, formatError };