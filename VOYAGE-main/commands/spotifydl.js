/**
 * Spotify Audio Downloader
 * Usage: .spotifydl <spotify track URL>
 */
const axios  = require('axios');
const { reply } = require('./_helper');

module.exports = async (sock, chatId, message, args) => {
    const url = args[0]?.trim();
    if (!url) return reply(sock, chatId, '❌ Usage: .spotifydl <Spotify track URL>', message);
    if (!/spotify\.com\/track\//i.test(url))
        return reply(sock, chatId, '❌ Invalid Spotify link. Use a track URL like:\nhttps://open.spotify.com/track/...', message);

    await reply(sock, chatId, '🎵 Downloading from Spotify...', message);

    const cleanUrl = url.split('?')[0];
    const headers  = {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json, text/plain, */*',
        'Origin': 'https://spodownloader.com',
        'Referer': 'https://spodownloader.com/',
    };

    try {
        // Step 1: Get track info
        const trackRes = await axios.get('https://api.fabdl.com/spotify/get', {
            params: { url: cleanUrl }, headers, timeout: 15000,
        });
        const track = trackRes.data?.result;
        if (!track) throw new Error('Could not fetch track info');

        // Step 2: Start conversion
        const convRes = await axios.get(
            `https://api.fabdl.com/spotify/mp3-convert-task/${track.gid}/${track.id}`,
            { headers, timeout: 15000 }
        );
        const convert = convRes.data?.result;
        if (!convert?.tid) throw new Error('Conversion failed to start');

        // Step 3: Poll for progress
        let progress, tries = 0;
        do {
            await new Promise(r => setTimeout(r, 2500));
            const progRes = await axios.get(
                `https://api.fabdl.com/spotify/mp3-convert-progress/${convert.tid}`,
                { headers, timeout: 15000 }
            );
            progress = progRes.data?.result;
            tries++;
            if (tries > 20) throw new Error('Conversion timed out');
        } while (progress?.status !== 3);

        const dlUrl  = 'https://api.fabdl.com' + progress.download_url;
        const audio  = await axios.get(dlUrl, { responseType: 'arraybuffer', headers, timeout: 60000 });

        await sock.sendMessage(chatId, {
            audio:    Buffer.from(audio.data),
            mimetype: 'audio/mpeg',
            fileName: `${track.name} - ${track.artists}.mp3`,
            contextInfo: {
                externalAdReply: {
                    title: track.name,
                    body:  track.artists,
                    thumbnailUrl: track.image,
                    sourceUrl: cleanUrl,
                },
            },
        }, { quoted: message });

    } catch (e) {
        // Fallback API
        try {
            const fb = await axios.get(
                `https://api.nexray.web.id/downloader/v1/spotify?url=${encodeURIComponent(cleanUrl)}`,
                { timeout: 30000 }
            );
            const d = fb.data;
            if (!d?.status || !d?.result?.download) throw new Error('Fallback failed');
            const audio = await axios.get(d.result.download, { responseType: 'arraybuffer', timeout: 60000 });
            await sock.sendMessage(chatId, {
                audio:    Buffer.from(audio.data),
                mimetype: 'audio/mpeg',
                fileName: `${d.result.title || 'spotify'}.mp3`,
            }, { quoted: message });
        } catch {
            await reply(sock, chatId, '❌ Spotify download failed. Try again or use .play for YouTube.', message);
        }
    }
};
