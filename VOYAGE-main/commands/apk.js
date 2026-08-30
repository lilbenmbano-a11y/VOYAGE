const axios = require('axios');
const { reply } = require('./_helper');
module.exports = async (sock, chatId, message, args) => {
    const q = args.join(' ').trim();
    if (!q) return reply(sock, chatId, '❌ Usage: .apk <app name>', message);
    await reply(sock, chatId, `🔍 Searching APK for: *${q}*...`, message);
    try {
        const r = await axios.get(`https://www.apkmirror.com/?post_type=app_release&searchtype=apk&s=${encodeURIComponent(q)}`, { timeout: 10000, headers: { 'User-Agent': 'Mozilla/5.0' } });
        const match = r.data.match(/class="fontBlack"[^>]*>([^<]+)<\/a>/);
        const linkMatch = r.data.match(/href="(\/apk\/[^"]+)" class="fontBlack"/);
        if (!match) return reply(sock, chatId, `❌ No APK found for *${q}*.\n\nTry searching on apkmirror.com`, message);
        await reply(sock, chatId, `📦 *APK Found*\n━━━━━━━━━━━━\n📱 ${match[1]}\n🔗 https://apkmirror.com${linkMatch?.[1]||'/?s='+encodeURIComponent(q)}\n\n_Download from the link above_`, message);
    } catch { await reply(sock, chatId, `❌ Search failed. Try: https://apkmirror.com`, message); }
};
