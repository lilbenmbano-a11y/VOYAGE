const { downloadContentFromMessage } = require('@crysnovax/baileys');
const { reply } = require('./_helper');
module.exports = async (sock, chatId, message) => {
    try {
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const stkMsg = (quoted||message.message)?.stickerMessage;
        if (!stkMsg) return reply(sock, chatId, '❌ Reply to a sticker with .toimg', message);
        const stream = await downloadContentFromMessage(stkMsg, 'sticker');
        const chunks = []; for await (const c of stream) chunks.push(c);
        await sock.sendMessage(chatId, { image: Buffer.concat(chunks), caption: '✅ Converted!' }, { quoted: message });
    } catch { await reply(sock, chatId, '❌ Failed.', message); }
};
