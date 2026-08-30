const { downloadContentFromMessage } = require('@crysnovax/baileys');
const { reply, getSender } = require('./_helper');

module.exports = async (sock, chatId, message) => {
    try {
        const sender = getSender(sock, message);
        const ctx = message.message?.extendedTextMessage?.contextInfo;
        const quoted = ctx?.quotedMessage;

        if (!quoted) return reply(sock, chatId, '❌ Reply to a view-once message with *.vv*', message);

        const voMsg =
            quoted?.viewOnceMessage?.message ||
            quoted?.viewOnceMessageV2?.message ||
            quoted?.viewOnceMessageV2Extension?.message ||
            quoted;

        const imgMsg = voMsg?.imageMessage;
        const vidMsg = voMsg?.videoMessage;

        if (!imgMsg && !vidMsg)
            return reply(sock, chatId, '❌ That is not a view-once media message.', message);

        const type = imgMsg ? 'image' : 'video';
        const stream = await downloadContentFromMessage(imgMsg || vidMsg, type);
        const chunks = [];
        for await (const c of stream) chunks.push(c);
        const buf = Buffer.concat(chunks);

        const from = ctx?.participant || sender;
        const dmCaption = `🔓 *View Once Revealed*\n📩 From: @${from.split('@')[0]}\n\n_VOYAGE XD©_`;

        // ✅ Send ONLY to sender's DM
        if (type === 'image') {
            await sock.sendMessage(sender, { image: buf, caption: dmCaption });
        } else {
            await sock.sendMessage(sender, { video: buf, caption: dmCaption });
        }

        // Acknowledge in chat without revealing media
        await reply(sock, chatId, '✅ View-once media sent to your DM!', message);

    } catch (e) {
        await reply(sock, chatId, '❌ Could not reveal. Message may have expired.', message);
    }
};
