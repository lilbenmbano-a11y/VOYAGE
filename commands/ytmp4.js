/**
 * YouTube to MP4 Download
 * Usage: .ytmp4 <YouTube URL or video name>
 */
const yts  = require('yt-search');
const ytdl = require('ytdl-core');
const fs   = require('fs');
const path = require('path');
const { reply } = require('./_helper');

module.exports = async (sock, chatId, message, args) => {
    const input = args.join(' ').trim();
    if (!input) return reply(sock, chatId, '❌ Usage: .ytmp4 <YouTube URL or video name>', message);

    await reply(sock, chatId, `🔍 Looking up: *${input}*...`, message);

    try {
        let url, title, duration;

        if (ytdl.validateURL(input)) {
            url = input;
            const info = await ytdl.getBasicInfo(url);
            title    = info.videoDetails.title;
            duration = info.videoDetails.lengthSeconds;
        } else {
            const res = await yts(input);
            const vid = res.videos[0];
            if (!vid) return reply(sock, chatId, '❌ No results found.', message);
            url      = vid.url;
            title    = vid.title;
            duration = vid.duration?.seconds;
        }

        if (duration && parseInt(duration) > 360)
            return reply(sock, chatId, '❌ Video too long for MP4 (max 6 min). Use .ytmp3 for longer audio.', message);

        await sock.sendMessage(chatId, {
            text: `🎬 *${title}*\n⬇️ Downloading video...`,
        }, { quoted: message });

        const tmpFile = path.join('./temp', `ytmp4_${Date.now()}.mp4`);
        if (!fs.existsSync('./temp')) fs.mkdirSync('./temp', { recursive: true });

        await new Promise((resolve, reject) => {
            ytdl(url, { filter: 'videoandaudio', quality: 'highestvideo' })
                .pipe(fs.createWriteStream(tmpFile))
                .on('finish', resolve)
                .on('error', reject);
        });

        const stat = fs.statSync(tmpFile);
        if (stat.size > 64 * 1024 * 1024)
            return reply(sock, chatId, '❌ File too large to send (>64MB).', message);

        await sock.sendMessage(chatId, {
            video:   fs.readFileSync(tmpFile),
            caption: `🎬 *${title}*\n\n_VOYAGE XD©_`,
        }, { quoted: message });

        try { fs.unlinkSync(tmpFile); } catch {}

    } catch (e) {
        await reply(sock, chatId, `❌ Download failed. Try a different link.`, message);
    }
};
