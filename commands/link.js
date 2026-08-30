const { checkAdmin, reply } = require('./_helper');
module.exports = async (sock, chatId, message) => {
    if (!chatId.endsWith('@g.us')) return reply(sock, chatId, '❌ Groups only.', message);
    if (!await checkAdmin(sock, chatId, message)) return reply(sock, chatId, '❌ Admins only.', message);
    const code = await sock.groupInviteCode(chatId);
    await reply(sock, chatId, `🔗 *Group Link*\n\nhttps://chat.whatsapp.com/${code}`, message);
};
