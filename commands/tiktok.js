const axios = require('axios');
const { reply } = require('./_helper');
module.exports = async (sock, chatId, message, args) => {
    const url = args[0]?.trim();
    if (!url || !url.includes('tiktok')) return reply(sock, chatId, '❌ Usage: .tiktok <tiktok URL>', message);
    await reply(sock, chatId, '⏳ Downloading TikTok...', message);
    try {
        const r = await axios.get(`https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(url)}`, { timeout: 20000 });
        const data = r.data;
        if (!data?.video?.noWatermark) return reply(sock, chatId, '❌ Could not fetch video. Try a different link.', message);
        const vidRes = await axios.get(data.video.noWatermark, { responseType: 'arraybuffer', timeout: 30000 });
        await sock.sendMessage(chatId, { video: Buffer.from(vidRes.data), caption: `🎵 *${data.title||'TikTok Video'}*\n\n_VOYAGE XD©_` }, { quoted: message });
    } catch { await reply(sock, chatId, '❌ TikTok download failed. Try again.', message); }
};
