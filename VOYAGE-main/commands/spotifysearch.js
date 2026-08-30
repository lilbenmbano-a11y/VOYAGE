/**
 * Spotify Song Search
 * Usage: .spotify <song name>
 * Returns song info — artist, album, duration, preview link
 * No API key needed (uses public search endpoint fallback)
 */
const fetch = require('node-fetch');
const { reply } = require('./_helper');

module.exports = async (sock, chatId, message, args) => {
    const query = args.join(' ').trim();
    if (!query) return reply(sock, chatId, '❌ Usage: .spotify <song name>', message);

    await reply(sock, chatId, `🎵 Searching Spotify for: *${query}*...`, message);

    try {
        // Try nexray Spotify search (free, no key)
        const res  = await fetch(
            `https://api.nexray.web.id/search/spotify?q=${encodeURIComponent(query)}`,
            { timeout: 12000 }
        );
        const data = await res.json();

        if (!data?.status || !Array.isArray(data.result) || !data.result.length)
            throw new Error('No results');

        const results = data.result.slice(0, 5);
        let text = `🎵 *Spotify Results for:* _${query}_\n`;
        text    += `━━━━━━━━━━━━━━━━━━━━\n\n`;

        results.forEach((track, i) => {
            const dur = track.duration_ms
                ? `${Math.floor(track.duration_ms / 60000)}:${String(Math.floor((track.duration_ms % 60000) / 1000)).padStart(2, '0')}`
                : 'N/A';
            const artists = Array.isArray(track.artists)
                ? track.artists.map(a => a.name || a).join(', ')
                : (track.artist || 'Unknown');

            text += `*${i + 1}. ${track.name || track.title}*\n`;
            text += `👤 Artist: ${artists}\n`;
            text += `💿 Album: ${track.album?.name || track.album || 'N/A'}\n`;
            text += `⏱️ Duration: ${dur}\n`;
            if (track.external_urls?.spotify || track.url)
                text += `🔗 ${track.external_urls?.spotify || track.url}\n`;
            text += `───────────────────\n\n`;
        });

        text += `_VOYAGE XD©_`;

        // Try to send with album art of first result
        const thumb = results[0]?.album?.images?.[0]?.url || results[0]?.image || null;
        if (thumb) {
            await sock.sendMessage(chatId, {
                image:   { url: thumb },
                caption: text,
            }, { quoted: message });
        } else {
            await sock.sendMessage(chatId, { text }, { quoted: message });
        }

    } catch (e) {
        await reply(sock, chatId, `❌ Spotify search failed. Try again.`, message);
    }
};
