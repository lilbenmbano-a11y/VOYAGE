/**
 * Manga Search
 * Usage: .manga <title>
 */
const axios  = require('axios');
const { reply } = require('./_helper');

module.exports = async (sock, chatId, message, args) => {
    const query = args.join(' ').trim();
    if (!query) return reply(sock, chatId, '❌ Usage: .manga <manga title>', message);

    await reply(sock, chatId, `🔍 Searching manga: *${query}*...`, message);
    try {
        const { data } = await axios.get(
            `https://api.jikan.moe/v4/manga?q=${encodeURIComponent(query)}&limit=5`,
            { timeout: 15000 }
        );
        const list = data?.data;
        if (!list?.length) return reply(sock, chatId, '❌ No manga found.', message);

        let text = `📚 *Manga Search: ${query}*\n`;
        text    += `━━━━━━━━━━━━━━━━━━━━\n\n`;
        list.forEach((m, i) => {
            text += `*${i+1}. ${m.title}*\n`;
            text += `📖 Type: ${m.type||'-'} | ⭐ Score: ${m.score||'N/A'}\n`;
            text += `📝 Chapters: ${m.chapters||'?'} | Status: ${m.status||'-'}\n`;
            text += `🎭 Genres: ${m.genres?.slice(0,3).map(g=>g.name).join(', ')||'-'}\n`;
            text += `🔗 ${m.url}\n`;
            text += `───────────────────\n\n`;
        });
        text += `_VOYAGE XD©_`;

        const thumb = list[0]?.images?.jpg?.image_url;
        if (thumb) {
            await sock.sendMessage(chatId, { image: { url: thumb }, caption: text }, { quoted: message });
        } else {
            await sock.sendMessage(chatId, { text }, { quoted: message });
        }
    } catch {
        await reply(sock, chatId, '❌ Manga search failed. Try again.', message);
    }
};
