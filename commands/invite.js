const { checkAdmin, reply } = require('./_helper');
module.exports = async (sock, chatId, message) => {
    if (!chatId.endsWith('@g.us')) return reply(sock, chatId, '❌ Groups only.', message);
    if (!await checkAdmin(sock, chatId, message)) return reply(sock, chatId, '❌ Admins only.', message);
    const code = await sock.groupInviteCode(chatId);
    const meta = await sock.groupMetadata(chatId);
    await reply(sock, chatId, `📨 *Group Invite*\n━━━━━━━━━━━━\n🏷️ ${meta.subject}\n👥 ${meta.participants.length} members\n\n🔗 https://chat.whatsapp.com/${code}`, message);
};
