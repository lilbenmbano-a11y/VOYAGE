const { reply, getSender, getIsOwner, getMentioned, SIG } = require('./_helper');
module.exports = async (sock, chatId, message) => {
    const sender = getSender(sock, message);
    if (!await getIsOwner(sock)(sender, sock, chatId)) return reply(sock, chatId, '❌ Owner only.', message);
    const mentioned = getMentioned(message);
    if (!mentioned.length) return reply(sock, chatId, '❌ Usage: .block @user', message);
    for (const user of mentioned) {
        await sock.updateBlockStatus(user, 'block');
        await sock.sendMessage(chatId, { text: `🚫 @${user.split('@')[0]} blocked.${SIG}`, mentions: [user] }, { quoted: message });
    }
};
