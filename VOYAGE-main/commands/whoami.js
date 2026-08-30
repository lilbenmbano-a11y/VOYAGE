const { reply, getSender } = require('./_helper');
module.exports = async (sock, chatId, message) => {
    const sender = getSender(sock, message);
    const num = sender.split('@')[0];
    const isGroup = chatId.endsWith('@g.us');
    let groupName = '';
    if (isGroup) {
        try {
            const meta = await sock.groupMetadata(chatId);
            groupName = meta.subject;
        } catch {}
    }
    await reply(sock, chatId,
`🪪 *Who Are You?*
━━━━━━━━━━━━━━
📱 *Number:* +${num}
🆔 *JID:* ${sender}
${isGroup ? `👥 *Group:* ${groupName}\n🔗 *Group JID:* ${chatId}` : '💬 *Chat:* Private DM'}
━━━━━━━━━━━━━━
_Info fetched by VOYAGE_XD_`, message);
};
