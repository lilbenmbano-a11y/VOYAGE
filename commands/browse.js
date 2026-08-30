const axios = require('axios');
const { reply } = require('./_helper');
module.exports = async (sock, chatId, message, args) => {
    const q = args.join(' ').trim();
    if (!q) return reply(sock, chatId, '❌ Usage: .browse <query>', message);
    await reply(sock, chatId, `🔍 Browsing: *${q}*...`, message);
    try {
        const r = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(q)}`, { timeout: 10000 });
        if (r.data.type==='disambiguation') return reply(sock, chatId, `⚠️ Multiple results for *${q}*. Be more specific.`, message);
        await reply(sock, chatId, `🌐 *${r.data.title}*\n━━━━━━━━━━━━\n${r.data.extract?.slice(0,600)||'No info found.'}`, message);
    } catch { await reply(sock, chatId, `❌ Nothing found for: *${q}*`, message); }
};
