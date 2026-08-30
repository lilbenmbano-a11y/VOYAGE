const axios = require('axios');
const { reply } = require('./_helper');
module.exports = async (sock, chatId, message, args) => {
    try {
        const q = args.join(' ').trim();
        if (!q) return reply(sock, chatId, '❌ Usage: .wiki <topic>', message);
        const res = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(q)}`,{timeout:10000});
        const d = res.data;
        if (d.type==='disambiguation') return reply(sock, chatId, `⚠️ *${q}* has multiple meanings. Be more specific.`, message);
        const summary = d.extract?.slice(0,700) || 'No summary.';
        await reply(sock, chatId, `📚 *${d.title}*\n\n${summary}${d.extract?.length>700?'...':''}\n\n🔗 ${d.content_urls?.desktop?.page||''}`, message);
    } catch { await reply(sock, chatId, `❌ No Wikipedia article found for *${args.join(' ')}*.`, message); }
};
