/**
 * TeraBox Downloader
 * Usage: .terabox <terabox link>
 */
const axios  = require('axios');
const { reply } = require('./_helper');

module.exports = async (sock, chatId, message, args) => {
    const url = args[0]?.trim();
    if (!url) return reply(sock, chatId, '❌ Usage: .terabox <TeraBox link>', message);

    await reply(sock, chatId, '⏳ Fetching TeraBox file info...', message);

    try {
        const { data } = await axios.post('https://teraboxdl.site/api/proxy', { url }, {
            headers: {
                origin: 'https://teraboxdl.site',
                referer: 'https://teraboxdl.site/',
                'user-agent': 'Mozilla/5.0 (Linux; Android 12) AppleWebKit/537.36 Chrome/130.0.0.0 Mobile Safari/537.36',
            },
            timeout: 30000,
        });

        if (!data?.files?.length) throw new Error('No files found');

        let text = `📦 *TeraBox Downloader*\n\n📊 Total Files: ${data.files.length}\n\n`;
        data.files.forEach((f, i) => {
            text += `*${i + 1}. ${f.name}*\n`;
            text += `📁 Type: ${f.type || '-'}\n`;
            text += `📦 Size: ${f.size || '-'}\n`;
            text += `🔗 Download: ${f.download}\n\n`;
        });
        text += `_VOYAGE XD©_`;

        await sock.sendMessage(chatId, { text }, { quoted: message });

    } catch (e) {
        await reply(sock, chatId, `❌ TeraBox fetch failed. Check the link and try again.`, message);
    }
};
