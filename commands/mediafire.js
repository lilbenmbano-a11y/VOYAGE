/**
 * MediaFire Downloader
 * Usage: .mediafire <mediafire.com link>
 */
const fetch = require('node-fetch');
const fs    = require('fs');
const path  = require('path');
const { reply } = require('./_helper');

module.exports = async (sock, chatId, message, args) => {
    const url = args[0]?.trim();
    if (!url || !url.includes('mediafire.com'))
        return reply(sock, chatId, '❌ Usage: .mediafire <mediafire.com link>', message);

    await reply(sock, chatId, '⏳ Fetching MediaFire link...', message);

    try {
        const cheerio = require('cheerio');
        const res     = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 15000 });
        const html    = await res.text();
        const $       = cheerio.load(html);

        const directLink = $('a#downloadButton').attr('href');
        const fileName   = $('div.filename').text().trim() || 'mediafire_file';

        if (!directLink) return reply(sock, chatId, '❌ Could not extract download link. Link may be invalid.', message);

        if (!fs.existsSync('./temp')) fs.mkdirSync('./temp', { recursive: true });

        const safeName = fileName.replace(/[^a-z0-9._-]/gi, '_');
        const tmpPath  = path.join('./temp', `mf_${Date.now()}_${safeName}`);

        await reply(sock, chatId, `📦 Downloading: *${fileName}*...`, message);

        const file    = await fetch(directLink, { timeout: 60000 });
        const stream  = fs.createWriteStream(tmpPath);
        await new Promise((res, rej) => { file.body.pipe(stream); file.body.on('error', rej); stream.on('finish', res); });

        const stat = fs.statSync(tmpPath);
        if (stat.size > 64 * 1024 * 1024)
            return reply(sock, chatId, `❌ File too large to send (${(stat.size / 1024 / 1024).toFixed(1)}MB). Max 64MB.\n🔗 Direct link: ${directLink}`, message);

        const mime = require('mime-types');
        const mimeType = mime.lookup(fileName) || 'application/octet-stream';

        await sock.sendMessage(chatId, {
            document: fs.readFileSync(tmpPath),
            fileName,
            mimetype: mimeType,
            caption: `📦 *${fileName}*\n✅ Downloaded from MediaFire\n\n_VOYAGE XD©_`,
        }, { quoted: message });

        try { fs.unlinkSync(tmpPath); } catch {}

    } catch (e) {
        await reply(sock, chatId, `❌ MediaFire download failed: ${e.message}`, message);
    }
};
