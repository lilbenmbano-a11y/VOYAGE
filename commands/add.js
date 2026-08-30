const { checkAdmin, checkBotAdmin, reply, SIG } = require('./_helper');
module.exports = async (sock, chatId, message, args) => {
    if (!chatId.endsWith('@g.us')) return reply(sock, chatId, '❌ Groups only.', message);
    if (!await checkAdmin(sock, chatId, message)) return reply(sock, chatId, '❌ Admins only.', message);
    if (!await checkBotAdmin(sock, chatId)) return reply(sock, chatId, '❌ Make me admin first.', message);
    const num = args[0]?.replace(/[^0-9]/g,'');
    if (!num) return reply(sock, chatId, '❌ Usage: .add <number>\nExample: .add 263788114185', message);
    const jid = num + '@s.whatsapp.net';
    try {
        const res = await sock.groupParticipantsUpdate(chatId, [jid], 'add');
        const status = res[0]?.status;
        if (status === 200) await sock.sendMessage(chatId, { text: `✅ +${num} added to group!${SIG}` });
        else if (status === 403) await reply(sock, chatId, `❌ +${num} has their privacy set to prevent being added.`, message);
        else await reply(sock, chatId, `❌ Could not add +${num}. Status: ${status}`, message);
    } catch { await reply(sock, chatId, `❌ Failed to add +${num}.`, message); }
};
