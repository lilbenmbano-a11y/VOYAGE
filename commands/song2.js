const yts = require('yt-search');
const ytdl = require('ytdl-core');
const fs = require('fs'), path = require('path');
const { reply } = require('./_helper');
module.exports = async (sock, chatId, message, args) => {
    const q = args.join(' ').trim();
    if (!q) return reply(sock, chatId, '❌ Usage: .song2 <song name>\n\n_Sends as voice note_', message);
    await sock.sendMessage(chatId, { text: `🔍 Searching: *${q}*...` }, { quoted: message });
    try {
        const res = await yts(q); const vid = res.videos[0];
        if (!vid) return reply(sock, chatId, '❌ No results found.', message);
        if (vid.duration.seconds > 600) return reply(sock, chatId, '❌ Song too long (max 10 min).', message);
        const tmp = path.join('./temp', `song2_${Date.now()}.mp3`);
        await new Promise((res, rej) => ytdl(vid.url, { filter: 'audioonly', quality: 'highestaudio' }).pipe(fs.createWriteStream(tmp)).on('finish', res).on('error', rej));
        await sock.sendMessage(chatId, { audio: fs.readFileSync(tmp), mimetype: 'audio/mpeg', ptt: true, fileName: `${vid.title}.mp3` }, { quoted: message });
        try { fs.unlinkSync(tmp); } catch {}
    } catch { await reply(sock, chatId, '❌ Download failed.', message); }
};
