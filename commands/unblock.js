const { reply, getSender, getIsOwner, getMentioned, SIG } = require('./_helper');
module.exports = async (sock, chatId, message) => {
    const sender = getSender(sock, message);
    if (!await getIsOwner(sock)(sender, sock, chatId)) return reply(sock, chatId, '❌ Owner only.', message);
    const mentioned = getMentioned(message);
    if (!mentioned.length) return reply(sock, chatId, '❌ Usage: .unblock @user', message);
    for (const user of mentioned) {
        await sock.updateBlockStatus(user, 'unblock');
        await sock.sendMessage(chatId, { text: `✅ @${user.split('@')[0]} unblocked.${SIG}`, mentions: [user] }, { quoted: message });
    }
};
