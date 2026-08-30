/**
 * YouTube to MP3 Download
 * Usage: .ytmp3 <YouTube URL or song name>
 */
const yts  = require('yt-search');
const ytdl = require('ytdl-core');
const fs   = require('fs');
const path = require('path');
const { reply } = require('./_helper');

module.exports = async (sock, chatId, message, args) => {
    const input = args.join(' ').trim();
    if (!input) return reply(sock, chatId, '❌ Usage: .ytmp3 <YouTube URL or song name>', message);

    await reply(sock, chatId, `🔍 Looking up: *${input}*...`, message);

    try {
        let url, title, thumb, duration;

        if (ytdl.validateURL(input)) {
            url = input;
            const info = await ytdl.getBasicInfo(url);
            title    = info.videoDetails.title;
            thumb    = info.videoDetails.thumbnails.pop()?.url;
            duration = info.videoDetails.lengthSeconds;
        } else {
            const res = await yts(input);
            const vid = res.videos[0];
            if (!vid) return reply(sock, chatId, '❌ No results found.', message);
            url      = vid.url;
            title    = vid.title;
            thumb    = vid.thumbnail;
            duration = vid.duration?.seconds;
        }

        if (duration && parseInt(duration) > 720)
            return reply(sock, chatId, '❌ Video too long (max 12 min).', message);

        await sock.sendMessage(chatId, {
            text: `🎵 *${title}*\n⬇️ Downloading audio...`,
        }, { quoted: message });

        const tmpFile = path.join('./temp', `ytmp3_${Date.now()}.mp3`);
        if (!fs.existsSync('./temp')) fs.mkdirSync('./temp', { recursive: true });

        await new Promise((resolve, reject) => {
            ytdl(url, { filter: 'audioonly', quality: 'highestaudio' })
                .pipe(fs.createWriteStream(tmpFile))
                .on('finish', resolve)
                .on('error', reject);
        });

        await sock.sendMessage(chatId, {
            audio:    fs.readFileSync(tmpFile),
            mimetype: 'audio/mpeg',
            fileName: `${title}.mp3`,
        }, { quoted: message });

        try { fs.unlinkSync(tmpFile); } catch {}

    } catch (e) {
        await reply(sock, chatId, `❌ Download failed. Try a different link.`, message);
    }
};
