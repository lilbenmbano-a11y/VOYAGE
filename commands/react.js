const { reply, getSender, getIsOwner } = require('./_helper');
module.exports = async (sock, chatId, message, args) => {
    const sender = getSender(sock, message);
    if (!await getIsOwner(sock)(sender, sock, chatId)) return reply(sock, chatId, '❌ Owner only.', message);
    const emoji = args[0] || '❤️';
    const ctx = message.message?.extendedTextMessage?.contextInfo;
    if (!ctx?.stanzaId) return reply(sock, chatId, '❌ Reply to a message with .react <emoji>', message);
    try {
        await sock.sendMessage(chatId, { react: { text: emoji, key: { remoteJid: chatId, id: ctx.stanzaId, participant: ctx.participant } } });
    } catch { await reply(sock, chatId, '❌ Failed to react.', message); }
};
