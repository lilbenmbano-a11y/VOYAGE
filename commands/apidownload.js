/**
 * VOYAGE XD — API Download Commands
 * Uses Malvin API + DavidCyril API
 * Commands: song2, play2, ytmp3, fbvideo, fb, tiktok2, spotify, voiceai
 */
const https   = require('https');
const http    = require('http');
const settings = require('../settings');
const { reply } = require('./_helper');

// ── HTTP helpers ──────────────────────────────────────────────────────────
function apiGet(url) {
    return new Promise((resolve, reject) => {
        const mod = url.startsWith('https') ? https : http;
        mod.get(url, { headers: { 'User-Agent': 'VOYAGEXD/4.0' } }, res => {
            if ([301,302,303,307,308].includes(res.statusCode) && res.headers.location)
                return apiGet(res.headers.location).then(resolve).catch(reject);
            let d = '';
            res.on('data', c => d += c);
            res.on('end', () => { try { resolve(JSON.parse(d)); } catch { resolve({ _raw: d }); } });
        }).on('error', reject);
    });
}

function fetchBuffer(url, timeout = 90000) {
    return new Promise((resolve, reject) => {
        const mod = url.startsWith('https') ? https : http;
        const req = mod.get(url, { headers: { 'User-Agent': 'VOYAGEXD/4.0' } }, res => {
            if ([301,302,303,307,308].includes(res.statusCode) && res.headers.location)
                return fetchBuffer(res.headers.location, timeout).then(resolve).catch(reject);
            if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
            const chunks = [];
            res.on('data', c => chunks.push(c));
            res.on('end', () => resolve(Buffer.concat(chunks)));
        });
        req.on('error', reject);
        req.setTimeout(timeout, () => { req.destroy(); reject(new Error('Timeout')); });
    });
}

async function ytSearch(query) {
    const url = `${settings.MALVIN_API}/youtube/search?query=${encodeURIComponent(query)}&apikey=${settings.MALVIN_KEY}`;
    return apiGet(url);
}

async function malvinDl(ytUrl, quality) {
    const url = `${settings.MALVIN_API}/youtube2/download?url=${encodeURIComponent(ytUrl)}&quality=${quality}&apikey=${settings.MALVIN_KEY}`;
    return apiGet(url);
}

const BOT_IMG = () => settings.BOT_IMG;
const SIG = '\n\n_VOYAGE XD©_';

// ── song2 — davidcyril API ────────────────────────────────────────────────
async function song2Cmd(sock, chatId, message, args) {
    const query = args.join(' ').trim();
    if (!query) return reply(sock, chatId, `*---🎵 SONG2---*\n  Usage: .song2 <song title>` + SIG, message);
    await sock.sendMessage(chatId, { text: `*---🎵 SONG2---*\n  🔍 Searching: *${query}*\n  ⏳ Please wait...` + SIG }, { quoted: message });
    try {
        const res = await apiGet(`${settings.DAVID_API}/download/song?query=${encodeURIComponent(query)}`);
        if (!res || res.status === false || (!res.result && !res.audio))
            return reply(sock, chatId, `*---🎵 SONG2---*\n  ❌ API returned no result.` + SIG, message);
        const r = res.result || res;
        const title = r.title || query;
        const duration = r.duration || '?';
        const thumb = r.thumbnail || BOT_IMG();
        const downloadUrl = r?.audio?.download_url || r?.audio?.url || r?.audio || r?.download_url || r?.url;
        if (!downloadUrl || typeof downloadUrl !== 'string')
            return reply(sock, chatId, `*---🎵 SONG2---*\n  ❌ No audio URL found.` + SIG, message);
        await sock.sendMessage(chatId, {
            image: { url: thumb },
            caption: `*---🎵 SONG2---*\n  📌 *${title}*\n  ⏱️ Duration » ${duration}\n  🎚️ Quality » MP3 128kbps\n  📥 Downloading...` + SIG
        }, { quoted: message });
        const buf = await fetchBuffer(downloadUrl);
        await sock.sendMessage(chatId, { audio: buf, mimetype: 'audio/mpeg', pttAudio: false, fileName: `${title}.mp3` }, { quoted: message });
    } catch (e) {
        reply(sock, chatId, `*---🎵 SONG2---*\n  ❌ Error: ${e.message}` + SIG, message);
    }
}

// ── play2 — Malvin API fallback ───────────────────────────────────────────
async function play2Cmd(sock, chatId, message, args) {
    const query = args.join(' ').trim();
    if (!query) return reply(sock, chatId, `*---🎵 PLAY2---*\n  Usage: .play2 <song title>` + SIG, message);
    await sock.sendMessage(chatId, { text: `*---🎵 PLAY2---*\n  🔍 Searching: *${query}*\n  ⏳ Please wait...` + SIG }, { quoted: message });
    try {
        // Try davidcyril first
        const res = await apiGet(`${settings.DAVID_API}/download/play?query=${encodeURIComponent(query)}`);
        const r = res?.result || res;
        let downloadUrl = r?.audio?.download_url || r?.download_url || r?.url || r?.audio;
        let title = r?.title || query;
        let thumb = r?.thumbnail || BOT_IMG();
        let duration = r?.duration || '?';

        if (!downloadUrl || typeof downloadUrl !== 'string') {
            // Fallback to Malvin
            const search = await ytSearch(query);
            const first = (search?.results || search?.data || search?.videos || [])[0];
            if (!first) return reply(sock, chatId, `*---🎵 PLAY2---*\n  ❌ No results found.` + SIG, message);
            const ytUrl = first?.url || first?.link || (first?.id ? `https://youtu.be/${first.id}` : null);
            if (!ytUrl) return reply(sock, chatId, `*---🎵 PLAY2---*\n  ❌ Could not resolve URL.` + SIG, message);
            const dl = await malvinDl(ytUrl, '128k');
            downloadUrl = dl?.download || dl?.url || dl?.link || dl?.audio;
            title = dl?.title || title;
            thumb = dl?.thumbnail || thumb;
            duration = dl?.duration || duration;
            if (!downloadUrl) return reply(sock, chatId, `*---🎵 PLAY2---*\n  ❌ All APIs failed.` + SIG, message);
        }
        await sock.sendMessage(chatId, {
            image: { url: thumb },
            caption: `*---🎵 PLAY2---*\n  📌 *${title}*\n  ⏱️ Duration » ${duration}\n  📥 Downloading...` + SIG
        }, { quoted: message });
        const buf = await fetchBuffer(downloadUrl);
        await sock.sendMessage(chatId, { audio: buf, mimetype: 'audio/mpeg', pttAudio: false, fileName: `${title}.mp3` }, { quoted: message });
    } catch (e) {
        reply(sock, chatId, `*---🎵 PLAY2---*\n  ❌ Error: ${e.message}` + SIG, message);
    }
}

// ── ytmp3 — youtube url → mp3 ─────────────────────────────────────────────
async function ytmp3Cmd(sock, chatId, message, args) {
    const url = args[0]?.trim();
    if (!url || !url.match(/youtu\.?be/i))
        return reply(sock, chatId, `*---🎵 YTMP3---*\n  Usage: .ytmp3 <youtube url>` + SIG, message);
    await sock.sendMessage(chatId, { text: `*---🎵 YTMP3---*\n  🔗 ${url}\n  ⏳ Downloading...` + SIG }, { quoted: message });
    try {
        // Try Malvin first
        const dl = await malvinDl(url, '128k');
        let downloadUrl = dl?.download || dl?.url || dl?.link || dl?.audio;
        let title = dl?.title || 'Audio';
        let thumb = dl?.thumbnail || BOT_IMG();
        let duration = dl?.duration || '?';
        if (!downloadUrl) {
            // Try davidcyril
            const res2 = await apiGet(`${settings.DAVID_API}/download/ytmp3?url=${encodeURIComponent(url)}`);
            downloadUrl = res2?.audio || res2?.url || res2?.download || res2?.link;
            title = res2?.title || title;
            thumb = res2?.thumbnail || thumb;
            duration = res2?.duration || duration;
        }
        if (!downloadUrl) return reply(sock, chatId, `*---🎵 YTMP3---*\n  ❌ Download failed.` + SIG, message);
        await sock.sendMessage(chatId, {
            image: { url: thumb },
            caption: `*---🎵 YTMP3---*\n  📌 *${title}*\n  ⏱️ Duration » ${duration}\n  📥 Downloading...` + SIG
        }, { quoted: message });
        const buf = await fetchBuffer(downloadUrl);
        await sock.sendMessage(chatId, { audio: buf, mimetype: 'audio/mpeg', pttAudio: false, fileName: `${title}.mp3` }, { quoted: message });
    } catch (e) {
        reply(sock, chatId, `*---🎵 YTMP3---*\n  ❌ Error: ${e.message}` + SIG, message);
    }
}

// ── tiktok2 — davidcyril API ──────────────────────────────────────────────
async function tiktok2Cmd(sock, chatId, message, args) {
    const url = args[0]?.trim();
    if (!url || !url.match(/tiktok\.com|vm\.tiktok/i))
        return reply(sock, chatId, `*---🎵 TIKTOK2---*\n  Usage: .tiktok2 <tiktok url>` + SIG, message);
    await sock.sendMessage(chatId, { text: `*---🎵 TIKTOK2---*\n  🔗 Fetching (no watermark)...\n  ⏳ Please wait...` + SIG }, { quoted: message });
    try {
        const res = await apiGet(`${settings.DAVID_API}/download/tiktok?url=${encodeURIComponent(url)}`);
        const r = res?.result || res;
        const videoUrl = r?.video?.download_url || r?.video_url || r?.video || r?.url || r?.download;
        const title = r?.title || r?.caption || 'TikTok Video';
        const author = r?.author?.nickname || r?.author || '';
        const thumb = r?.thumbnail || r?.cover || BOT_IMG();
        if (!videoUrl) return reply(sock, chatId, `*---🎵 TIKTOK2---*\n  ❌ Failed. Try .tiktok <url>` + SIG, message);
        await sock.sendMessage(chatId, {
            image: { url: thumb },
            caption: `*---🎵 TIKTOK2---*\n  📌 *${title}*\n${author ? `  👤 *${author}*\n` : ''}  📥 Downloading (no watermark)...` + SIG
        }, { quoted: message });
        const buf = await fetchBuffer(videoUrl);
        await sock.sendMessage(chatId, { video: buf, mimetype: 'video/mp4', fileName: 'tiktok.mp4', caption: `🎵 *${title}*` }, { quoted: message });
    } catch (e) {
        reply(sock, chatId, `*---🎵 TIKTOK2---*\n  ❌ Error: ${e.message}` + SIG, message);
    }
}

// ── fbvideo — facebook video downloader ──────────────────────────────────
async function fbvideoCmd(sock, chatId, message, args) {
    const url = args[0]?.trim();
    if (!url || !url.match(/facebook\.com|fb\.watch/i))
        return reply(sock, chatId, `*---📘 FB VIDEO---*\n  Usage: .fbvideo <facebook url>` + SIG, message);
    await sock.sendMessage(chatId, { text: `*---📘 FB VIDEO---*\n  🔗 Fetching...\n  ⏳ Please wait...` + SIG }, { quoted: message });
    try {
        const res = await apiGet(`${settings.DAVID_API}/download/facebook?url=${encodeURIComponent(url)}`);
        const r = res?.result || res;
        const hdUrl = r?.hd || r?.video_hd || r?.hd_url;
        const sdUrl = r?.sd || r?.video_sd || r?.sd_url || r?.video || r?.url || r?.download;
        const videoUrl = hdUrl || sdUrl;
        const title = r?.title || 'Facebook Video';
        const thumb = r?.thumbnail || BOT_IMG();
        if (!videoUrl) return reply(sock, chatId, `*---📘 FB VIDEO---*\n  ❌ Download failed.` + SIG, message);
        await sock.sendMessage(chatId, {
            image: { url: thumb },
            caption: `*---📘 FB VIDEO---*\n  📌 *${title}*\n  🎥 Quality » ${hdUrl ? 'HD' : 'SD'}\n  📥 Downloading...` + SIG
        }, { quoted: message });
        const buf = await fetchBuffer(videoUrl);
        await sock.sendMessage(chatId, { video: buf, mimetype: 'video/mp4', fileName: 'facebook.mp4', caption: `📘 *${title}*` }, { quoted: message });
    } catch (e) {
        reply(sock, chatId, `*---📘 FB VIDEO---*\n  ❌ Error: ${e.message}` + SIG, message);
    }
}

// ── spotify — song name or spotify url ───────────────────────────────────
async function spotifyCmd(sock, chatId, message, args) {
    const query = args.join(' ').trim();
    if (!query) return reply(sock, chatId, `*---🎧 SPOTIFY---*\n  Usage: .spotify <song name>` + SIG, message);
    await sock.sendMessage(chatId, { text: `*---🎧 SPOTIFY---*\n  🔍 Searching: *${query}*\n  ⏳ Please wait...` + SIG }, { quoted: message });
    try {
        const res = await apiGet(`${settings.DAVID_API}/download/spotify?query=${encodeURIComponent(query)}`);
        const r = res?.result || res;
        const downloadUrl = r?.audio?.download_url || r?.download_url || r?.url || r?.audio;
        const title = r?.title || r?.name || query;
        const artist = r?.artists || r?.artist || '';
        const duration = r?.duration || (r?.duration_ms ? `${Math.floor(r.duration_ms/60000)}:${String(Math.floor((r.duration_ms%60000)/1000)).padStart(2,'0')}` : '?');
        const thumb = r?.thumbnail || r?.image || r?.album?.images?.[0]?.url || BOT_IMG();
        if (!downloadUrl || typeof downloadUrl !== 'string')
            return reply(sock, chatId, `*---🎧 SPOTIFY---*\n  ❌ Download failed.` + SIG, message);
        await sock.sendMessage(chatId, {
            image: { url: thumb },
            caption: `*---🎧 SPOTIFY---*\n  📌 *${title}*\n${artist ? `  🎤 *${artist}*\n` : ''}  ⏱️ Duration » ${duration}\n  📥 Downloading...` + SIG
        }, { quoted: message });
        const buf = await fetchBuffer(downloadUrl);
        await sock.sendMessage(chatId, { audio: buf, mimetype: 'audio/mpeg', pttAudio: false, fileName: `${title}.mp3` }, { quoted: message });
    } catch (e) {
        reply(sock, chatId, `*---🎧 SPOTIFY---*\n  ❌ Error: ${e.message}` + SIG, message);
    }
}

// ── voiceai — text to voice note ─────────────────────────────────────────
async function voiceaiCmd(sock, chatId, message, args) {
    const text = args.join(' ').trim();
    if (!text) return reply(sock, chatId, `*---🎤 VOICE AI---*\n  Usage: .voiceai <text>` + SIG, message);
    await sock.sendMessage(chatId, { text: `*---🎤 VOICE AI---*\n  💬 Converting...\n  ⏳ Please wait...` + SIG }, { quoted: message });
    try {
        const res = await apiGet(`${settings.DAVID_API}/tools/voiceai?text=${encodeURIComponent(text)}`);
        const r = res?.result || res;
        const audioUrl = r?.url || r?.audio || r?.voice || r?.result;
        if (!audioUrl || typeof audioUrl !== 'string')
            return reply(sock, chatId, `*---🎤 VOICE AI---*\n  ❌ Failed.` + SIG, message);
        const buf = await fetchBuffer(audioUrl);
        await sock.sendMessage(chatId, { audio: buf, mimetype: 'audio/mpeg', ptt: true }, { quoted: message });
    } catch (e) {
        reply(sock, chatId, `*---🎤 VOICE AI---*\n  ❌ Error: ${e.message}` + SIG, message);
    }
}

// ── ytv2 — youtube video via Malvin API ──────────────────────────────────
async function ytv2Cmd(sock, chatId, message, args) {
    const query = args.join(' ').trim();
    if (!query) return reply(sock, chatId, `*---🎬 YTV2---*\n  Usage: .ytv2 <title or url>\n  Quality: 360p | 480p | 720p` + SIG, message);
    await sock.sendMessage(chatId, { text: `*---🎬 YTV2---*\n  🔍 Searching...\n  ⏳ Please wait...` + SIG }, { quoted: message });
    try {
        let ytUrl = query, title = query, thumb = BOT_IMG();
        if (!query.match(/youtu\.?be/i)) {
            const search = await ytSearch(query);
            const first = (search?.results || search?.data || search?.videos || [])[0];
            if (!first) return reply(sock, chatId, `*---🎬 YTV2---*\n  ❌ No results.` + SIG, message);
            ytUrl = first?.url || first?.link || (first?.id ? `https://youtu.be/${first.id}` : null);
            title = first?.title || first?.name || query;
            thumb = first?.thumbnail || BOT_IMG();
            if (!ytUrl) return reply(sock, chatId, `*---🎬 YTV2---*\n  ❌ Could not resolve URL.` + SIG, message);
        }
        const quality = args.includes('720p') ? '720p' : args.includes('480p') ? '480p' : '360p';
        const dl = await malvinDl(ytUrl, quality);
        const downloadUrl = dl?.download || dl?.url || dl?.link || dl?.video;
        if (!downloadUrl) return reply(sock, chatId, `*---🎬 YTV2---*\n  ❌ Download failed.` + SIG, message);
        title = dl?.title || title;
        thumb = dl?.thumbnail || thumb;
        await sock.sendMessage(chatId, {
            image: { url: thumb },
            caption: `*---🎬 YTV2---*\n  📌 *${title}*\n  📐 Quality » ${quality}\n  📥 Downloading...` + SIG
        }, { quoted: message });
        const buf = await fetchBuffer(downloadUrl);
        await sock.sendMessage(chatId, { video: buf, mimetype: 'video/mp4', fileName: `${title}.mp4`, caption: `🎬 *${title}*` }, { quoted: message });
    } catch (e) {
        reply(sock, chatId, `*---🎬 YTV2---*\n  ❌ Error: ${e.message}` + SIG, message);
    }
}

module.exports = {
    song2Cmd,
    play2Cmd,
    ytmp3Cmd,
    tiktok2Cmd,
    fbvideoCmd,
    spotifyCmd,
    voiceaiCmd,
    ytv2Cmd,
};
