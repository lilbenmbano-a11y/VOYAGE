const axios = require('axios');
const { reply } = require('./_helper');
module.exports = async (sock, chatId, message, args) => {
    const q = args.join(' ').trim();
    if (!q) return reply(sock, chatId, '❌ Usage: .imdb <movie/show name>', message);
    await reply(sock, chatId, `🎬 Searching IMDB for: *${q}*...`, message);
    try {
        const r = await axios.get(`https://www.omdbapi.com/?t=${encodeURIComponent(q)}&apikey=trilogy`, { timeout: 10000 });
        if (r.data.Response==='False') return reply(sock, chatId, `❌ *${q}* not found on IMDB.`, message);
        const m = r.data;
        let text = `🎬 *${m.Title}* (${m.Year})\n━━━━━━━━━━━━\n📽️ *Type:* ${m.Type}\n⭐ *Rating:* ${m.imdbRating}/10\n🏆 *Genre:* ${m.Genre}\n🌍 *Country:* ${m.Country}\n⏱️ *Runtime:* ${m.Runtime}\n📅 *Released:* ${m.Released}\n🎭 *Director:* ${m.Director}\n👥 *Cast:* ${m.Actors}\n\n📝 *Plot:*\n${m.Plot}`;
        if (m.Poster && m.Poster!=='N/A') {
            const buf = await axios.get(m.Poster, { responseType: 'arraybuffer', timeout: 10000 });
            await sock.sendMessage(chatId, { image: Buffer.from(buf.data), caption: text+'\n\n_TunzyMD©_' }, { quoted: message });
        } else { await reply(sock, chatId, text, message); }
    } catch { await reply(sock, chatId, '❌ IMDB search failed.', message); }
};
