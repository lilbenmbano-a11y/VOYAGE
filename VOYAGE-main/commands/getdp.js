const { getBuffer } = require('../lib/myfunc');
const { getMentioned, reply, getSender } = require('./_helper');
module.exports = async (sock, chatId, message) => {
    try {
        const mentioned = getMentioned(message);
        const target = mentioned[0] || getSender(sock, message);
        const num = target.split('@')[0];
        let ppUrl;
        try { ppUrl = await sock.profilePictureUrl(target, 'image'); }
        catch { return reply(sock, chatId, `❌ @${num} has no profile picture or it is private.`, message); }
        const buf = await getBuffer(ppUrl);
        await sock.sendMessage(chatId, { image: buf, caption: `🖼️ *Profile Picture*\n📱 +${num}`, mentions: [target] }, { quoted: message });
    } catch { await reply(sock, chatId, '❌ Could not fetch profile picture.', message); }
};
