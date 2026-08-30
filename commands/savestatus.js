const { downloadContentFromMessage } = require('@crysnovax/baileys');
const { reply, getSender } = require('./_helper');
module.exports = async (sock, chatId, message) => {
    try {
        const ctx = message.message?.extendedTextMessage?.contextInfo;
        const quoted = ctx?.quotedMessage;
        if (!quoted) return reply(sock, chatId, '❌ Reply to a status/story with .savestatus', message);
        const imgMsg = quoted?.imageMessage, vidMsg = quoted?.videoMessage;
        const txtMsg = quoted?.conversation || quoted?.extendedTextMessage?.text;
        const botNum = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        if (txtMsg) { await sock.sendMessage(botNum, { text: `📝 *Saved Status*\n\n${txtMsg}` }); return reply(sock, chatId, '✅ Text status saved to your chat!', message); }
        if (!imgMsg && !vidMsg) return reply(sock, chatId, '❌ No media found in quoted message.', message);
        const type = imgMsg ? 'image' : 'video';
        const stream = await downloadContentFromMessage(imgMsg||vidMsg, type);
        const chunks = []; for await (const c of stream) chunks.push(c);
        if (type==='image') await sock.sendMessage(botNum, { image: Buffer.concat(chunks), caption: '✅ Saved Status' });
        else await sock.sendMessage(botNum, { video: Buffer.concat(chunks), caption: '✅ Saved Status' });
        await reply(sock, chatId, `✅ ${type} status saved to your chat!`, message);
    } catch { await reply(sock, chatId, '❌ Failed to save status.', message); }
};
