/**
 * Tenor GIF Search
 * Usage: .tenor <query>
 */
const axios  = require('axios');
const { reply } = require('./_helper');

const TENOR_KEY = process.env.TENOR_KEY || 'AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCyk';

module.exports = async (sock, chatId, message, args) => {
    const query = args.join(' ').trim();
    if (!query) return reply(sock, chatId, '❌ Usage: .tenor <search query>', message);

    await reply(sock, chatId, `🎬 Searching GIFs for: *${query}*...`, message);
    try {
        const { data } = await axios.get('https://tenor.googleapis.com/v2/search', {
            params: { q: query, key: TENOR_KEY, limit: 4, contentfilter: 'medium', media_filter: 'gif' },
            timeout: 15000,
        });

        const results = data?.results;
        if (!results?.length) return reply(sock, chatId, '❌ No GIFs found.', message);

        const item = results[0];
        const gifUrl = item.media_formats?.gif?.url || item.media_formats?.tinygif?.url;
        if (!gifUrl) return reply(sock, chatId, '❌ Could not extract GIF URL.', message);

        await sock.sendMessage(chatId, {
            video:       { url: gifUrl },
            gifPlayback: true,
            caption:     `🎬 *${item.content_description || query}*\n\n_VOYAGE XD©_`,
        }, { quoted: message });
    } catch {
        await reply(sock, chatId, '❌ Tenor search failed. Try again.', message);
    }
};
