const { reply } = require('./_helper');
module.exports = async (sock, chatId, message, args) => {
    const text = args.join(' ').trim();
    if (!text) return reply(sock, chatId, '❌ Usage: .say <text>', message);
    await sock.sendMessage(chatId, { text: text + '\n\n_VOYAGE XD©_' });
};
