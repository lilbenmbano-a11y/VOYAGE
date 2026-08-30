const axios = require('axios');
const { reply } = require('./_helper');
module.exports = async (sock, chatId, message, args) => {
    const url = args[0]?.trim();
    if (!url || !url.includes('tiktok')) return reply(sock, chatId, '❌ Usage: .tiktokaudio <tiktok URL>', message);
    await reply(sock, chatId, '⏳ Extracting TikTok audio...', message);
    try {
        const r = await axios.get(`https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(url)}`, { timeout: 20000 });
        const data = r.data;
        if (!data?.music) return reply(sock, chatId, '❌ Could not fetch audio.', message);
        const audRes = await axios.get(data.music, { responseType: 'arraybuffer', timeout: 30000 });
        await sock.sendMessage(chatId, { audio: Buffer.from(audRes.data), mimetype: 'audio/mpeg', fileName: 'tiktok_audio.mp3' }, { quoted: message });
    } catch { await reply(sock, chatId, '❌ Failed.', message); }
};
