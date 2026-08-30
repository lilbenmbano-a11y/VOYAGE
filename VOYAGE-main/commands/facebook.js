const axios = require('axios');
const { reply } = require('./_helper');
module.exports = async (sock, chatId, message, args) => {
    const url = args[0]?.trim();
    if (!url || !url.includes('facebook')) return reply(sock, chatId, '❌ Usage: .facebook <facebook video URL>', message);
    await reply(sock, chatId, '📘 Downloading from Facebook...', message);
    try {
        const r = await axios.get(`https://fdown.net/download.php?URLz=${encodeURIComponent(url)}`, { timeout: 15000, headers: { 'User-Agent': 'Mozilla/5.0' } });
        const match = r.data.match(/href="(https:\/\/[^"]+\.mp4[^"]*)"/);
        if (!match) return reply(sock, chatId, '❌ Could not download. Make sure the video is public.', message);
        const buf = await axios.get(match[1], { responseType: 'arraybuffer', timeout: 30000 });
        await sock.sendMessage(chatId, { video: Buffer.from(buf.data), caption: '📘 Facebook Video\n\n_TunzyMD©_' }, { quoted: message });
    } catch { await reply(sock, chatId, '❌ Facebook download failed.', message); }
};
