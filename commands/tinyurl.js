const axios = require('axios');
const { reply } = require('./_helper');
module.exports = async (sock, chatId, message, args) => {
    const url = args[0]?.trim();
    if (!url || !url.startsWith('http')) return reply(sock, chatId, '❌ Usage: .tinyurl <URL>', message);
    try {
        const r = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`, { timeout: 10000 });
        await reply(sock, chatId, `🔗 *URL Shortener*\n━━━━━━━━━━━━\n📎 Original: ${url.slice(0,50)}...\n✅ Short: ${r.data}`, message);
    } catch { await reply(sock, chatId, '❌ Failed to shorten URL.', message); }
};
