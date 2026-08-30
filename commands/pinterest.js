/**
 * Pinterest Image Search
 * Usage: .pinterest <query>
 * Sends up to 5 images from Pinterest search
 */
const axios  = require('axios');
const { reply } = require('./_helper');

module.exports = async (sock, chatId, message, args) => {
    const query = args.join(' ').trim();
    if (!query) return reply(sock, chatId, '❌ Usage: .pinterest <search query>', message);

    await reply(sock, chatId, `📌 Searching Pinterest for: *${query}*...`, message);

    try {
        const { data } = await axios.get(
            `https://api.nexray.web.id/search/pinterest?q=${encodeURIComponent(query)}`,
            { timeout: 15000 }
        );

        if (!data?.status || !Array.isArray(data.result) || !data.result.length)
            throw new Error('No results');

        const results = data.result.slice(0, 5);
        let sent = 0;

        for (const item of results) {
            const imgUrl = item.images_url || item.image;
            if (!imgUrl) continue;

            const caption =
                `📌 *Pinterest Image ${sent + 1}/${results.length}*\n` +
                (item.description ? `📝 ${item.description.slice(0, 120)}\n` : '') +
                (item.pinner?.full_name ? `👤 ${item.pinner.full_name}\n` : '') +
                `\n_VOYAGE XD©_`;

            await sock.sendMessage(chatId, {
                image:   { url: imgUrl },
                caption,
            }, { quoted: message });

            sent++;
            await new Promise(r => setTimeout(r, 500));
        }

        if (sent === 0) throw new Error('No valid images');

    } catch (e) {
        await reply(sock, chatId, `❌ Pinterest search failed. Try a different query.`, message);
    }
};
