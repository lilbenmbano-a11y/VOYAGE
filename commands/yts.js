const yts = require('yt-search');
const { reply } = require('./_helper');
module.exports = async (sock, chatId, message, args) => {
    const q = args.join(' ').trim();
    if (!q) return reply(sock, chatId, '❌ Usage: .yts <search query>', message);
    await reply(sock, chatId, `🔍 Searching YouTube: *${q}*...`, message);
    try {
        const res = await yts(q);
        const vids = res.videos.slice(0,5);
        if (!vids.length) return reply(sock, chatId, '❌ No results found.', message);
        let text = `🎬 *YouTube Search: ${q}*\n━━━━━━━━━━━━\n\n`;
        vids.forEach((v,i) => { text += `*${i+1}.* ${v.title}\n⏱️ ${v.timestamp} | 👁️ ${v.views?.toLocaleString()}\n🔗 ${v.url}\n\n`; });
        await reply(sock, chatId, text, message);
    } catch { await reply(sock, chatId, '❌ Search failed.', message); }
};
