const { checkAdmin, reply } = require('./_helper');
module.exports = async (sock, chatId, message, args) => {
    if (!chatId.endsWith('@g.us')) return reply(sock, chatId, '❌ Groups only.', message);
    if (!await checkAdmin(sock, chatId, message)) return reply(sock, chatId, '❌ You need to be an admin.', message);
    const meta = await sock.groupMetadata(chatId);
    const mentions = meta.participants.map(p => p.id);
    const text = (args.join(' ')||'📢 Attention everyone!') + '\n\n' + mentions.map(m=>`@${m.split('@')[0]}`).join(' ') + '\n\n_VOYAGE XD©_';
    await sock.sendMessage(chatId, { text, mentions }, { quoted: message });
};
