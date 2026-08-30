const { checkAdmin, checkBotAdmin, reply } = require('./_helper');
module.exports = async (sock, chatId, message, args) => {
    if (!chatId.endsWith('@g.us')) return reply(sock, chatId, '❌ Groups only.', message);
    if (!await checkAdmin(sock, chatId, message)) return reply(sock, chatId, '❌ You need to be an admin.', message);
    if (!await checkBotAdmin(sock, chatId)) return reply(sock, chatId, '❌ Make me an admin first.', message);
    const name = args.join(' ').trim(); if (!name) return reply(sock, chatId, '❌ Usage: .setname <name>', message);
    await sock.groupUpdateSubject(chatId, name);
    await reply(sock, chatId, `✅ Group name changed to *${name}*`, message);
};
