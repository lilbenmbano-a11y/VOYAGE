/**
 * TikTok Profile Stalker
 * Usage: .tiktokstalk <username>
 */
const axios  = require('axios');
const { reply } = require('./_helper');

module.exports = async (sock, chatId, message, args) => {
    const username = args[0]?.replace('@', '').trim();
    if (!username) return reply(sock, chatId, '❌ Usage: .tiktokstalk <username>', message);

    await reply(sock, chatId, `🔍 Looking up TikTok: @${username}...`, message);

    try {
        const { data } = await axios.get(
            `https://api.nexray.web.id/stalker/tiktok?username=${encodeURIComponent(username)}`,
            { timeout: 15000 }
        );

        if (!data?.status || !data?.result)
            return reply(sock, chatId, '❌ TikTok user not found.', message);

        const r = data.result;
        const s = r.stats || {};

        const caption =
            `📌 *TIKTOK PROFILE*\n\n` +
            `👤 *Name:* ${r.name || '-'}\n` +
            `🆔 *Username:* @${r.username}\n` +
            `📝 *Bio:* ${r.bio || '-'}\n\n` +
            `✅ *Verified:* ${r.verified ? 'Yes' : 'No'}\n` +
            `🔒 *Private:* ${r.private ? 'Yes' : 'No'}\n` +
            `🌍 *Region:* ${r.region || '-'}\n\n` +
            `📊 *STATS*\n` +
            `👥 Followers: ${(s.followers || 0).toLocaleString()}\n` +
            `➡️ Following: ${(s.following || 0).toLocaleString()}\n` +
            `❤️ Likes: ${(s.likes || 0).toLocaleString()}\n` +
            `🎥 Videos: ${(s.videos || 0).toLocaleString()}\n\n` +
            `🔗 ${r.link || `https://www.tiktok.com/@${username}`}\n\n` +
            `_VOYAGE XD©_`;

        if (r.avatar) {
            await sock.sendMessage(chatId, { image: { url: r.avatar }, caption }, { quoted: message });
        } else {
            await sock.sendMessage(chatId, { text: caption }, { quoted: message });
        }

    } catch {
        await reply(sock, chatId, '❌ Failed to fetch TikTok profile.', message);
    }
};
