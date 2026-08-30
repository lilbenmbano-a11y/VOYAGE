/**
 * Anime Search — search, latest, details
 * Uses Jikan API (MyAnimeList) — free, no key needed
 * Commands: .anime <name>, .animelatestnew, .animeinfo <name>
 */
const axios  = require('axios');
const { reply } = require('./_helper');

async function animeSearch(sock, chatId, message, args) {
    const query = args.join(' ').trim();
    if (!query) return reply(sock, chatId, '❌ Usage: .anime <anime name>', message);

    await reply(sock, chatId, `🔍 Searching: *${query}*...`, message);
    try {
        const { data } = await axios.get(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=5`, { timeout: 15000 });
        const list = data?.data;
        if (!list?.length) return reply(sock, chatId, '❌ No results found.', message);

        let text = `🍥 *Anime Search: ${query}*\n`;
        text    += `━━━━━━━━━━━━━━━━━━━━\n\n`;
        list.forEach((a, i) => {
            text += `*${i+1}. ${a.title}*\n`;
            text += `📺 Type: ${a.type || '-'} | ⭐ Score: ${a.score || 'N/A'}\n`;
            text += `📅 Aired: ${a.aired?.string || '-'}\n`;
            text += `🎭 Genres: ${a.genres?.map(g=>g.name).join(', ') || '-'}\n`;
            text += `───────────────────\n\n`;
        });
        text += `_Use .animeinfo <name> for full details_\n_VOYAGE XD©_`;

        const thumb = list[0]?.images?.jpg?.image_url;
        if (thumb) {
            await sock.sendMessage(chatId, { image: { url: thumb }, caption: text }, { quoted: message });
        } else {
            await sock.sendMessage(chatId, { text }, { quoted: message });
        }
    } catch {
        await reply(sock, chatId, '❌ Anime search failed. Try again.', message);
    }
}

async function animeInfo(sock, chatId, message, args) {
    const query = args.join(' ').trim();
    if (!query) return reply(sock, chatId, '❌ Usage: .animeinfo <anime name>', message);

    await reply(sock, chatId, `🔍 Fetching info for: *${query}*...`, message);
    try {
        const { data } = await axios.get(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=1`, { timeout: 15000 });
        const a = data?.data?.[0];
        if (!a) return reply(sock, chatId, '❌ Anime not found.', message);

        const text =
            `🍥 *${a.title}*\n` +
            (a.title_english && a.title_english !== a.title ? `📝 English: ${a.title_english}\n` : '') +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `📺 *Type:* ${a.type || '-'}\n` +
            `🎬 *Episodes:* ${a.episodes || '?'}\n` +
            `⭐ *Score:* ${a.score || 'N/A'} (${(a.scored_by || 0).toLocaleString()} votes)\n` +
            `📊 *Rank:* #${a.rank || 'N/A'}\n` +
            `🔥 *Popularity:* #${a.popularity || 'N/A'}\n` +
            `📅 *Aired:* ${a.aired?.string || '-'}\n` +
            `🎭 *Genres:* ${a.genres?.map(g=>g.name).join(', ') || '-'}\n` +
            `🎙️ *Studio:* ${a.studios?.map(s=>s.name).join(', ') || '-'}\n` +
            `📊 *Status:* ${a.status || '-'}\n\n` +
            `📝 *Synopsis:*\n${(a.synopsis || 'No synopsis').slice(0, 500)}${a.synopsis?.length > 500 ? '...' : ''}\n\n` +
            `🔗 ${a.url}\n\n_VOYAGE XD©_`;

        if (a.images?.jpg?.large_image_url) {
            await sock.sendMessage(chatId, { image: { url: a.images.jpg.large_image_url }, caption: text }, { quoted: message });
        } else {
            await sock.sendMessage(chatId, { text }, { quoted: message });
        }
    } catch {
        await reply(sock, chatId, '❌ Failed to fetch anime info.', message);
    }
}

async function animeLatest(sock, chatId, message) {
    await reply(sock, chatId, '🔥 Fetching latest anime...', message);
    try {
        const { data } = await axios.get('https://api.jikan.moe/v4/seasons/now?limit=10', { timeout: 15000 });
        const list = data?.data;
        if (!list?.length) return reply(sock, chatId, '❌ Could not fetch seasonal anime.', message);

        let text = `🔥 *Currently Airing Anime*\n`;
        text    += `━━━━━━━━━━━━━━━━━━━━\n\n`;
        list.slice(0, 8).forEach((a, i) => {
            text += `*${i+1}. ${a.title}*\n`;
            text += `📺 ${a.type || '-'} | ⭐ ${a.score || 'N/A'} | 🎬 ${a.episodes || '?'} eps\n`;
            text += `🎭 ${a.genres?.slice(0,3).map(g=>g.name).join(', ') || '-'}\n`;
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
        await reply(sock, chatId, '❌ Failed to fetch seasonal anime.', message);
    }
}

module.exports = { animeSearch, animeInfo, animeLatest };
