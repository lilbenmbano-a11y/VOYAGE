const { reply } = require('./_helper');
module.exports = async (sock, chatId, message) => {
    const start = Date.now();
    await sock.sendMessage(chatId, { text: '🏓 Pinging...' }, { quoted: message });
    const ms = Date.now() - start;
    const bar = ms < 100 ? '🟢 Excellent' : ms < 300 ? '🟡 Good' : '🔴 Slow';
    await reply(sock, chatId,
`🏓 *Pong!*
━━━━━━━━━━━━
⚡ Speed: *${ms}ms*
📶 Status: ${bar}
🤖 Bot: *Online*`, message);
};
