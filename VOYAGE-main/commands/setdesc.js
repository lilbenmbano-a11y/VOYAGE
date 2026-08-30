const { checkAdmin, checkBotAdmin, reply } = require('./_helper');
module.exports = async (sock, chatId, message, args) => {
    if (!chatId.endsWith('@g.us')) return reply(sock, chatId, '❌ Groups only.', message);
    if (!await checkAdmin(sock, chatId, message)) return reply(sock, chatId, '❌ You need to be an admin.', message);
    if (!await checkBotAdmin(sock, chatId)) return reply(sock, chatId, '❌ Make me an admin first.', message);
    const desc = args.join(' ').trim(); if (!desc) return reply(sock, chatId, '❌ Usage: .setdesc <description>', message);
    await sock.groupUpdateDescription(chatId, desc);
    await reply(sock, chatId, '✅ Group description updated!', message);
};
