const { reply } = require('./_helper');
module.exports = async (sock, chatId, message, args) => {
    const text = args.join(' ').trim();
    if (!text) return reply(sock, chatId, '❌ Usage: .reverse <text>', message);
    await reply(sock, chatId, `🔄 ${text.split('').reverse().join('')}`, message);
};
