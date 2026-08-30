const { reply } = require('./_helper');
module.exports = async (sock, chatId, message) => {
    if (!chatId.endsWith('@g.us')) return reply(sock, chatId, '❌ Groups only.', message);
    const meta = await sock.groupMetadata(chatId);
    const admins = meta.participants.filter(p=>p.admin).length;
    const members = meta.participants.length - admins;
    await reply(sock, chatId, `👥 *Total Members*\n━━━━━━━━━━━━\n🏷️ Group: *${meta.subject}*\n👥 Total: *${meta.participants.length}*\n⭐ Admins: *${admins}*\n👤 Members: *${members}*`, message);
};
