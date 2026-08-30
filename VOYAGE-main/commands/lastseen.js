const { reply, getSender, getIsOwner } = require('./_helper');
module.exports = async (sock, chatId, message, args) => {
    const sender = getSender(sock, message);
    if (!await getIsOwner(sock)(sender, sock, chatId)) return reply(sock, chatId, '❌ Owner only.', message);
    const sub = args[0]?.toLowerCase() || 'all';
    try {
        await sock.updateLastSeenPrivacy(sub === 'all' ? 'all' : sub === 'contacts' ? 'contacts' : 'none');
        await reply(sock, chatId, `✅ Last seen set to: *${sub}*`, message);
    } catch { await reply(sock, chatId, '❌ Failed. Use: .lastseen all / contacts / none', message); }
};
