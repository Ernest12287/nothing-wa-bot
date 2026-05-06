// ============================================
// BRAIN/UTILITY/WEATHER — ENGINE
// Open-Meteo API — free, no key needed
// ============================================

const GEO_API    = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_API = 'https://api.open-meteo.com/v1/forecast';

const WMO_CODES = {
    0: 'Clear sky ☀️', 1: 'Mainly clear 🌤️', 2: 'Partly cloudy ⛅', 3: 'Overcast ☁️',
    45: 'Fog 🌫️', 48: 'Icy fog 🌫️',
    51: 'Light drizzle 🌦️', 53: 'Drizzle 🌦️', 55: 'Heavy drizzle 🌧️',
    61: 'Slight rain 🌧️', 63: 'Rain 🌧️', 65: 'Heavy rain 🌧️',
    71: 'Slight snow 🌨️', 73: 'Snow 🌨️', 75: 'Heavy snow ❄️',
    80: 'Rain showers 🌦️', 81: 'Rain showers 🌧️', 82: 'Heavy showers 🌧️',
    95: 'Thunderstorm ⛈️', 96: 'Thunderstorm ⛈️', 99: 'Thunderstorm ⛈️'
};

/**
 * Get weather for a city
 * @param {string} city
 * @returns {{ city, country, temp, feelsLike, humidity, windspeed, condition, high, low }}
 */
export async function getWeather(city) {
    // geocode city
    const geoRes  = await fetch(`${GEO_API}?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
    const geoData = await geoRes.json();

    if (!geoData.results?.length) throw new Error(`City *"${city}"* not found`);

    const { name, country, latitude, longitude, timezone } = geoData.results[0];

    // fetch weather
    const params = new URLSearchParams({
        latitude, longitude,
        current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m',
        daily: 'temperature_2m_max,temperature_2m_min',
        timezone: timezone || 'auto',
        forecast_days: 1
    });

    const wRes  = await fetch(`${WEATHER_API}?${params}`);
    const wData = await wRes.json();
    const curr  = wData.current;

    return {
        city: name,
        country,
        temp:       Math.round(curr.temperature_2m),
        feelsLike:  Math.round(curr.apparent_temperature),
        humidity:   curr.relative_humidity_2m,
        windspeed:  Math.round(curr.wind_speed_10m),
        condition:  WMO_CODES[curr.weather_code] || 'Unknown',
        high:       Math.round(wData.daily.temperature_2m_max[0]),
        low:        Math.round(wData.daily.temperature_2m_min[0]),
    };
}