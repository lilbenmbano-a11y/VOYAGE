const { downloadContentFromMessage } = require('@crysnovax/baileys');
const { reply, getSender, getIsOwner } = require('./_helper');
module.exports = async (sock, chatId, message) => {
    const sender = getSender(sock, message);
    if (!await getIsOwner(sock)(sender, sock, chatId)) return reply(sock, chatId, '❌ Owner only.', message);
    const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage || message.message;
    const imgMsg = quoted?.imageMessage;
    if (!imgMsg) return reply(sock, chatId, '❌ Reply to an image with .setprofilepic', message);
    try {
        const stream = await downloadContentFromMessage(imgMsg, 'image');
        const chunks = []; for await (const c of stream) chunks.push(c);
        await sock.updateProfilePicture(sock.user.id, Buffer.concat(chunks));
        await reply(sock, chatId, '✅ Profile picture updated!', message);
    } catch { await reply(sock, chatId, '❌ Failed to update profile picture.', message); }
};
