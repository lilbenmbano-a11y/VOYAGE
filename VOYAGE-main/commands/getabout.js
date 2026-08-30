const { getMentioned, reply, getSender } = require('./_helper');
module.exports = async (sock, chatId, message) => {
    try {
        const mentioned = getMentioned(message);
        const target = mentioned[0] || getSender(sock, message);
        const status = await sock.fetchStatus(target);
        await reply(sock, chatId, `📝 *About/Status*\n━━━━━━━━━━━━\n👤 +${target.split('@')[0]}\n💬 ${status?.status || 'No status set'}`, message);
    } catch { await reply(sock, chatId, '❌ Could not fetch status.', message); }
};
