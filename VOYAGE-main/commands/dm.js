const { reply, getSender } = require('./_helper');
module.exports = async (sock, chatId, message, args) => {
    const sender = getSender(sock, message);
    const text = args.join(' ').trim();
    if (!text) return reply(sock, chatId, '❌ Usage: .dm <message>\nSends a message to your own DM', message);
    try {
        await sock.sendMessage(sender, { text: `📩 *Message to yourself*\n\n${text}\n\n_TunzyMD©_` });
        await reply(sock, chatId, '✅ Message sent to your DM!', message);
    } catch { await reply(sock, chatId, '❌ Failed to send DM.', message); }
};
