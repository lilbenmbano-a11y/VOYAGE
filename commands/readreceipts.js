const { reply, getSender, getIsOwner } = require('./_helper');
module.exports = async (sock, chatId, message, args) => {
    const sender = getSender(sock, message);
    if (!await getIsOwner(sock)(sender, sock, chatId)) return reply(sock, chatId, '❌ Owner only.', message);
    const sub = args[0]?.toLowerCase();
    if (!sub) return reply(sock, chatId, '❌ Usage: .readreceipts on/off', message);
    try {
        await sock.updateReadReceiptsPrivacy(sub==='on' ? 'all' : 'none');
        await reply(sock, chatId, `✅ Read receipts: *${sub.toUpperCase()}*`, message);
    } catch { await reply(sock, chatId, '❌ Failed.', message); }
};
