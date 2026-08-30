const { checkAdmin, reply } = require('./_helper');
module.exports = async (sock, chatId, message, args) => {
    if (!chatId.endsWith('@g.us')) return reply(sock, chatId, '❌ Groups only.', message);
    if (!await checkAdmin(sock, chatId, message)) return reply(sock, chatId, '❌ You need to be an admin.', message);
    const text = args.join(' ').trim(); if (!text) return reply(sock, chatId, '❌ Usage: .announce <message>', message);
    const meta = await sock.groupMetadata(chatId);
    const mentions = meta.participants.map(p => p.id);
    await sock.sendMessage(chatId, { text: `📢 *ANNOUNCEMENT*\n\n${text}\n\n_— ${meta.subject}_\n\n_TunzyMD©_`, mentions }, { quoted: message });
};
