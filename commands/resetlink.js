const { checkAdmin, checkBotAdmin, reply } = require('./_helper');
module.exports = async (sock, chatId, message) => {
    if (!chatId.endsWith('@g.us')) return reply(sock, chatId, '❌ Groups only.', message);
    if (!await checkAdmin(sock, chatId, message)) return reply(sock, chatId, '❌ You need to be an admin.', message);
    if (!await checkBotAdmin(sock, chatId)) return reply(sock, chatId, '❌ Make me an admin first.', message);
    await sock.groupRevokeInvite(chatId);
    const code = await sock.groupInviteCode(chatId);
    await reply(sock, chatId, `✅ *Link reset!*\n\n🔗 https://chat.whatsapp.com/${code}`, message);
};
