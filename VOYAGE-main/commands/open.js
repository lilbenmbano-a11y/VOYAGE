const { checkAdmin, checkBotAdmin, reply } = require('./_helper');
module.exports = async (sock, chatId, message) => {
    if (!chatId.endsWith('@g.us')) return reply(sock, chatId, '❌ Groups only.', message);
    if (!await checkAdmin(sock, chatId, message)) return reply(sock, chatId, '❌ Admins only.', message);
    if (!await checkBotAdmin(sock, chatId)) return reply(sock, chatId, '❌ Make me admin first.', message);
    await sock.groupSettingUpdate(chatId, 'not_announcement');
    await reply(sock, chatId, '🔓 *Group opened!*\nEveryone can send messages.', message);
};
