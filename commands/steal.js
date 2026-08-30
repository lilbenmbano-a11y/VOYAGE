const { downloadContentFromMessage } = require('@crysnovax/baileys');
const settings = require('../settings');
const { reply } = require('./_helper');
module.exports = async (sock, chatId, message, args) => {
    try {
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const stkMsg = (quoted || message.message)?.stickerMessage;
        if (!stkMsg) return reply(sock, chatId, '❌ Reply to a sticker with .steal', message);
        const stream = await downloadContentFromMessage(stkMsg, 'sticker');
        const chunks = []; for await (const c of stream) chunks.push(c);
        await sock.sendMessage(chatId, { sticker: Buffer.concat(chunks), packname: args[0]||settings.packname, author: args[1]||settings.author }, { quoted: message });
    } catch { await reply(sock, chatId, '❌ Failed to steal sticker.', message); }
};
