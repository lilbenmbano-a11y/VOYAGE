const axios = require('axios');
const { reply } = require('./_helper');
module.exports = async (sock, chatId, message, args) => {
    const url = args[0]?.trim();
    if (!url || (!url.includes('twitter') && !url.includes('x.com'))) return reply(sock, chatId, '❌ Usage: .twitter <tweet URL>', message);
    await reply(sock, chatId, '🐦 Downloading from Twitter/X...', message);
    try {
        const r = await axios.get(`https://twitsave.com/info?url=${encodeURIComponent(url)}`, { timeout: 15000 });
        const match = r.data.match(/https:\/\/video\.twimg\.com[^"]+\.mp4[^"]*/);
        if (!match) return reply(sock, chatId, '❌ No video found. Make sure the tweet has a video.', message);
        const buf = await axios.get(match[0], { responseType: 'arraybuffer', timeout: 30000 });
        await sock.sendMessage(chatId, { video: Buffer.from(buf.data), caption: '🐦 Twitter/X Video\n\n_TunzyMD©_' }, { quoted: message });
    } catch { await reply(sock, chatId, '❌ Twitter download failed.', message); }
};
