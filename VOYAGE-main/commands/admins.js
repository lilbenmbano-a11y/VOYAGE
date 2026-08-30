const { reply, SIG } = require('./_helper');
module.exports = async (sock, chatId, message) => {
    if (!chatId.endsWith('@g.us')) return reply(sock, chatId, '❌ Groups only.', message);
    const meta = await sock.groupMetadata(chatId);
    const admins = meta.participants.filter(p=>p.admin);
    const mentions = admins.map(p=>p.id);
    let text = `⭐ *Group Admins (${admins.length})*\n━━━━━━━━━━━━━━━\n`;
    admins.forEach(p => { text += `${p.admin==='superadmin'?'👑':'⭐'} @${p.id.split('@')[0]}\n`; });
    await sock.sendMessage(chatId, { text: text+SIG, mentions }, { quoted: message });
};
