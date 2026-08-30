const { reply, getSender, getIsOwner } = require('./_helper');
module.exports = async (sock, chatId, message, args) => {
    const sender = getSender(sock, message);
    if (!await getIsOwner(sock)(sender, sock, chatId)) return reply(sock, chatId, '❌ Owner only.', message);
    const link = args[0]?.trim();
    if (!link) return reply(sock, chatId, '❌ Usage: .join <invite link>', message);
    try {
        const code = link.includes('chat.whatsapp.com/') ? link.split('chat.whatsapp.com/')[1] : link;
        await sock.groupAcceptInvite(code.split('?')[0]);
        await reply(sock, chatId, '✅ Joined group successfully!', message);
    } catch { await reply(sock, chatId, '❌ Failed to join. Link may be invalid or expired.', message); }
};
