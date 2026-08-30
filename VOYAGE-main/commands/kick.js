const { checkAdmin, checkBotAdmin, getMentioned, reply, isAdmin, SIG } = require('./_helper');
module.exports = async (sock, chatId, message) => {
    if (!chatId.endsWith('@g.us')) return reply(sock, chatId, '❌ Groups only.', message);
    if (!await checkAdmin(sock, chatId, message)) return reply(sock, chatId, '❌ You need to be an admin.', message);
    if (!await checkBotAdmin(sock, chatId)) return reply(sock, chatId, '❌ Make me an admin first.', message);
    const mentioned = getMentioned(message);
    if (!mentioned.length) return reply(sock, chatId, '❌ Tag someone: .kick @user', message);
    for (const user of mentioned) {
        if (await isAdmin(sock, chatId, user)) {
            await sock.sendMessage(chatId, { text: `⚠️ Cannot kick @${user.split('@')[0]} — they are an admin.${SIG}`, mentions: [user] }, { quoted: message });
            continue;
        }
        await sock.groupParticipantsUpdate(chatId, [user], 'remove');
        await sock.sendMessage(chatId, { text: `✅ @${user.split('@')[0]} has been kicked.${SIG}`, mentions: [user] });
    }
};
