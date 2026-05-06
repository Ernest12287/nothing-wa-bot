// ============================================
// BRAIN/UTILITY/WEATHER — ASCII
// ============================================

const THEMES = {
    weather: { tl: '🌍', tr: '🌤️', bl: '✅', br: '🌡️', div: '─' },
    error:   { tl: '❌', tr: '⚠️',  bl: '💡', br: '🔧', div: '─' },
};

function block({ theme = 'weather', title, body, footer }) {
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

export function formatWeather(w) {
    return block({
        theme: 'weather',
        title: `${w.city}, ${w.country}`,
        body: [
            `🌡️ *Temp:*      ${w.temp}°C  (Feels ${w.feelsLike}°C)`,
            `🌤️ *Condition:* ${w.condition}`,
            `💧 *Humidity:*  ${w.humidity}%`,
            `💨 *Wind:*      ${w.windspeed} km/h`,
            ``,
            `🔺 *High:* ${w.high}°C   🔻 *Low:* ${w.low}°C`,
        ].join('\n'),
        footer: 'Powered by Open-Meteo • Free API'
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

export default { formatWeather, formatError };