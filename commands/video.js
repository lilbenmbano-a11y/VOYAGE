const yts = require('yt-search');
const ytdl = require('ytdl-core');
const fs = require('fs'), path = require('path');
const { reply } = require('./_helper');
module.exports = async (sock, chatId, message, args) => {
    const q = args.join(' ').trim();
    if (!q) return reply(sock, chatId, '❌ Usage: .video <search query or YouTube URL>', message);
    await sock.sendMessage(chatId, { text: `🔍 Searching: *${q}*...` }, { quoted: message });
    try {
        let url = q;
        if (!q.includes('youtube.com') && !q.includes('youtu.be')) {
            const res = await yts(q); const vid = res.videos[0];
            if (!vid) return reply(sock, chatId, '❌ No results found.', message);
            if (vid.duration.seconds > 300) return reply(sock, chatId, '❌ Video too long (max 5 min).', message);
            url = vid.url;
            await sock.sendMessage(chatId, { text: `🎬 *${vid.title}*\n⏱️ ${vid.timestamp}\n⬇️ Downloading...` }, { quoted: message });
        }
        const tmp = path.join('./temp', `video_${Date.now()}.mp4`);
        await new Promise((res, rej) => ytdl(url, { filter: 'videoandaudio', quality: 'lowest' }).pipe(fs.createWriteStream(tmp)).on('finish', res).on('error', rej));
        await sock.sendMessage(chatId, { video: fs.readFileSync(tmp), caption: '✅ Video\n\n_TunzyMD©_' }, { quoted: message });
        try { fs.unlinkSync(tmp); } catch {}
    } catch { await reply(sock, chatId, '❌ Download failed.', message); }
};
