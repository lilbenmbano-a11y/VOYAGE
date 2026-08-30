const axios = require('axios');
const { reply } = require('./_helper');
module.exports = async (sock, chatId, message, args) => {
    const url = args[0]?.trim();
    if (!url || !url.includes('instagram')) return reply(sock, chatId, '❌ Usage: .instagram <instagram URL>', message);
    await reply(sock, chatId, '📸 Downloading from Instagram...', message);
    try {
        const r = await axios.get(`https://instagram-downloader-download-instagram-videos-stories.p.rapidapi.com/index?url=${encodeURIComponent(url)}`,
            { headers: { 'x-rapidapi-host': 'instagram-downloader-download-instagram-videos-stories.p.rapidapi.com', 'x-rapidapi-key': 'demo' }, timeout: 15000 });
        if (!r.data?.media) return reply(sock, chatId, '❌ Could not download. Make sure the post is public.', message);
        const media = Array.isArray(r.data.media) ? r.data.media[0] : r.data.media;
        const buf = await axios.get(media, { responseType: 'arraybuffer', timeout: 30000 });
        await sock.sendMessage(chatId, { video: Buffer.from(buf.data), caption: '📸 Instagram\n\n_TunzyMD©_' }, { quoted: message });
    } catch { await reply(sock, chatId, '❌ Instagram download failed.\n_Make sure the post is public._', message); }
};
