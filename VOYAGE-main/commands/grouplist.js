const { reply, getSender, getIsOwner } = require('./_helper');
module.exports = async (sock, chatId, message) => {
    const sender = getSender(sock, message);
    const isOwner = getIsOwner(sock);
    if (!await isOwner(sender, sock, chatId)) return reply(sock, chatId, '❌ Owner only.', message);
    const groups = await sock.groupFetchAllParticipating();
    const list = Object.values(groups);
    if (!list.length) return reply(sock, chatId, '❌ Bot is not in any groups.', message);
    let text = `📋 *Group List (${list.length})*\n━━━━━━━━━━━━━━━\n\n`;
    list.forEach((g,i) => { text += `*${i+1}.* ${g.subject}\n👥 ${g.participants.length} members\n\n`; });
    await reply(sock, chatId, text, message);
};
