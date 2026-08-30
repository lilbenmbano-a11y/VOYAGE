const { reply } = require('./_helper');
module.exports = async (sock, chatId, message) => {
    if (!chatId.endsWith('@g.us')) return reply(sock, chatId, '❌ Groups only.', message);
    const meta = await sock.groupMetadata(chatId);
    const admins = meta.participants.filter(p=>p.admin).length;
    const members = meta.participants.length - admins;
    await reply(sock, chatId,
`📋 *Group Info*
━━━━━━━━━━━━━━━━━
🏷️ *Name:* ${meta.subject}
👥 *Total:* ${meta.participants.length} members
⭐ *Admins:* ${admins}
👤 *Members:* ${members}
💬 *Messaging:* ${meta.announce?'Admins only':'Everyone'}
🔒 *Settings:* ${meta.restrict?'Admins only':'Everyone'}
📅 *Created:* ${new Date(meta.creation*1000).toDateString()}
━━━━━━━━━━━━━━━━━
📝 *Desc:* ${meta.desc?.trim().slice(0,150)||'No description'}`, message);
};
