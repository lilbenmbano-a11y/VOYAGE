const { downloadContentFromMessage } = require('@crysnovax/baileys');
const { reply, getSender, getIsOwner } = require('./_helper');

module.exports = async (sock, chatId, message) => {
    const sender = getSender(sock, message);
    if (!await getIsOwner(sock)(sender, sock, chatId))
        return reply(sock, chatId, '❌ Owner only command.', message);

    const ctx = message.message?.extendedTextMessage?.contextInfo;
    const quoted = ctx?.quotedMessage;
    if (!quoted) return reply(sock, chatId, '❌ Reply to a view-once message with *.vv2*', message);

    const voMsg =
        quoted?.viewOnceMessage?.message ||
        quoted?.viewOnceMessageV2?.message ||
        quoted?.viewOnceMessageV2Extension?.message ||
        quoted;

    const imgMsg = voMsg?.imageMessage;
    const vidMsg = voMsg?.videoMessage;
    if (!imgMsg && !vidMsg)
        return reply(sock, chatId, '❌ Not a view-once media.', message);

    try {
        const type = imgMsg ? 'image' : 'video';
        const stream = await downloadContentFromMessage(imgMsg || vidMsg, type);
        const chunks = [];
        for await (const c of stream) chunks.push(c);
        const buf = Buffer.concat(chunks);

        const from = ctx?.participant || sender;
        const cap = `🔓 *View Once — Owner Copy*\n📩 From: @${from.split('@')[0]}\n\n_VOYAGE XD©_`;

        // Send only to owner DM
        if (type === 'image') await sock.sendMessage(sender, { image: buf, caption: cap });
        else await sock.sendMessage(sender, { video: buf, caption: cap });

        await reply(sock, chatId, '✅ Sent to your DM!', message);
    } catch {
        await reply(sock, chatId, '❌ Failed to reveal view-once.', message);
    }
};
