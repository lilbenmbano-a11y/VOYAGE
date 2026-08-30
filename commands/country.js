const axios = require('axios');
const { reply } = require('./_helper');
module.exports = async (sock, chatId, message, args) => {
    try {
        const q = args.join(' ').trim();
        if (!q) return reply(sock, chatId, '❌ Usage: .country <name>', message);
        const res = await axios.get(`https://restcountries.com/v3.1/name/${encodeURIComponent(q)}`,{timeout:10000});
        const c = res.data[0];
        const cur = Object.values(c.currencies||{})[0];
        await reply(sock, chatId, `${c.flag||''} *${c.name.common}*\n_(${c.name.official})_\n\n🏛️ Capital: ${c.capital?.[0]||'N/A'}\n🌍 Region: ${c.region||'N/A'}\n👥 Population: ${c.population?.toLocaleString()}\n💰 Currency: ${cur?`${cur.name} (${cur.symbol})`:'N/A'}\n🗣️ Languages: ${Object.values(c.languages||{}).join(', ')||'N/A'}`, message);
    } catch { await reply(sock, chatId, `❌ Country *${args.join(' ')}* not found.`, message); }
};
