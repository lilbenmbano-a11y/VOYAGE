const { reply, getSender, getIsOwner } = require('./_helper');
module.exports = async (sock, chatId, message, args) => {
    const sender = getSender(sock, message);
    if (!await getIsOwner(sock)(sender, sock, chatId)) return reply(sock, chatId, '❌ Owner only.', message);
    const text = args.join(' ').trim();
    if (!text) return reply(sock, chatId, '❌ Usage: .tostatus <text>', message);
    try {
        await sock.sendMessage('status@broadcast', { text });
        await reply(sock, chatId, '✅ Posted to status!', message);
    } catch { await reply(sock, chatId, '❌ Failed to post status.', message); }
};
