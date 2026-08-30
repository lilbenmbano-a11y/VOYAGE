const axios = require('axios');
const { reply } = require('./_helper');
module.exports = async (sock, chatId, message, args) => {
    try {
        const city = args.join(' ').trim();
        if (!city) return reply(sock, chatId, '❌ Usage: .weather <city>', message);
        const res = await axios.get(`https://wttr.in/${encodeURIComponent(city)}?format=j1`,{timeout:10000,headers:{'User-Agent':'curl/7.68.0'}});
        const c = res.data.current_condition[0];
        const desc = c.weatherDesc[0].value;
        await reply(sock, chatId, `🌤️ *Weather — ${city}*\n\n🌡️ Temp: *${c.temp_C}°C / ${c.temp_F}°F*\n🤔 Feels: ${c.FeelsLikeC}°C\n💧 Humidity: ${c.humidity}%\n💨 Wind: ${c.windspeedKmph} km/h\n🌤️ ${desc}`, message);
    } catch { await reply(sock, chatId, `❌ Could not fetch weather for *${args.join(' ')}*.`, message); }
};
