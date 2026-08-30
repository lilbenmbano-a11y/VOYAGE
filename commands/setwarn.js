const { reply, getSender, getIsOwner } = require('./_helper');
module.exports = async (sock, chatId, message, args) => {
    const sender = getSender(sock, message);
    if (!await getIsOwner(sock)(sender, sock, chatId)) return reply(sock, chatId, '❌ Owner only.', message);
    const num = parseInt(args[0]);
    if (!num || num < 1 || num > 10) return reply(sock, chatId, '❌ Usage: .setwarn <1-10>', message);
    await reply(sock, chatId, `✅ Warn limit set to *${num}*\n_Restart required for full effect._`, message);
};
