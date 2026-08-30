/**
 * Pixabay Image Search
 * Usage: .pixabay <query>
 * Note: Get a free key at pixabay.com/api/docs/ — replace KEY below
 */
const axios  = require('axios');
const { reply } = require('./_helper');

const PIXABAY_KEY = process.env.PIXABAY_KEY || 'REPLACE_WITH_PIXABAY_KEY';

module.exports = async (sock, chatId, message, args) => {
    const query = args.join(' ').trim();
    if (!query) return reply(sock, chatId, '❌ Usage: .pixabay <search query>', message);

    await reply(sock, chatId, `🖼️ Searching Pixabay for: *${query}*...`, message);
    try {
        const { data } = await axios.get('https://pixabay.com/api/', {
            params: { key: PIXABAY_KEY, q: query, image_type: 'photo', per_page: 5, safesearch: true },
            timeout: 15000,
        });

        const hits = data?.hits;
        if (!hits?.length) return reply(sock, chatId, '❌ No images found.', message);

        let sent = 0;
        for (const img of hits.slice(0, 4)) {
            await sock.sendMessage(chatId, {
                image:   { url: img.webformatURL },
                caption: `🖼️ *Pixabay — ${query}*\n📸 By: ${img.user}\n👁️ Views: ${img.views.toLocaleString()}\n❤️ Likes: ${img.likes.toLocaleString()}\n\n_VOYAGE XD©_`,
            }, { quoted: message });
            sent++;
            await new Promise(r => setTimeout(r, 400));
        }
        if (!sent) return reply(sock, chatId, '❌ Could not send any images.', message);
    } catch {
        await reply(sock, chatId, '❌ Pixabay search failed. Make sure PIXABAY_KEY is set in .env', message);
    }
};
