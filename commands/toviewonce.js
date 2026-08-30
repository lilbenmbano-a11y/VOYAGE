const { downloadContentFromMessage } = require('@crysnovax/baileys');
const { reply, getSender, getIsOwner } = require('./_helper');
module.exports = async (sock, chatId, message) => {
    const sender = getSender(sock, message);
    if (!await getIsOwner(sock)(sender, sock, chatId)) return reply(sock, chatId, '❌ Owner only.', message);
    const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage || message.message;
    const imgMsg = quoted?.imageMessage; const vidMsg = quoted?.videoMessage;
    if (!imgMsg && !vidMsg) return reply(sock, chatId, '❌ Reply to an image/video with .toviewonce', message);
    try {
        const type = imgMsg ? 'image' : 'video';
        const stream = await downloadContentFromMessage(imgMsg||vidMsg, type);
        const chunks = []; for await (const c of stream) chunks.push(c);
        const buf = Buffer.concat(chunks);
        if (type==='image') await sock.sendMessage(chatId, { image: buf, viewOnce: true, caption: '' });
        else await sock.sendMessage(chatId, { video: buf, viewOnce: true, caption: '' });
        await reply(sock, chatId, '✅ Sent as view-once!', message);
    } catch { await reply(sock, chatId, '❌ Failed.', message); }
};
