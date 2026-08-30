const { reply } = require('./_helper');
module.exports = async (sock, chatId, message) => {
    const start = Date.now();
    await sock.sendMessage(chatId, { react: { text: '🏓', key: message.key } });
    const ms = Date.now() - start;
    await reply(sock, chatId, `🏓 *Pong!*\n⚡ Speed: *${ms}ms*\n🌐 Status: *Online*`, message);
};
