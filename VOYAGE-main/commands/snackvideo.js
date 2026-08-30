/**
 * Snack Video Downloader
 * Usage: .snackvideo <URL>
 */
const axios  = require('axios');
const { reply } = require('./_helper');

module.exports = async (sock, chatId, message, args) => {
    const url = args[0]?.trim();
    if (!url) return reply(sock, chatId, '❌ Usage: .snackvideo <Snack Video URL>', message);

    await reply(sock, chatId, '⏳ Downloading Snack Video...', message);
    try {
        const { data } = await axios.get(
            `https://api.siputzx.my.id/api/d/snackvideo?url=${encodeURIComponent(url)}`,
            { timeout: 20000 }
        );
        const vidUrl = data?.result?.media;
        const title  = data?.result?.title || 'Snack Video';
        if (!vidUrl) throw new Error('No video URL');

        await sock.sendMessage(chatId, {
            video:   { url: vidUrl },
            caption: `🎥 *${title}*\n\n_VOYAGE XD©_`,
        }, { quoted: message });
    } catch {
        await reply(sock, chatId, '❌ Snack video download failed. Check the URL.', message);
    }
};
