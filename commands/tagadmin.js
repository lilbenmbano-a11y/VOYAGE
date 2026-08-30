const { checkAdmin, reply } = require('./_helper');
const isAdminLib = require('../lib/isAdmin');
module.exports = async (sock, chatId, message, args) => {
    if (!chatId.endsWith('@g.us')) return reply(sock, chatId, '❌ Groups only.', message);
    if (!await checkAdmin(sock, chatId, message)) return reply(sock, chatId, '❌ Admins only.', message);
    const text = args.join(' ').trim() || '📢 Admins needed!';
    const admins = await isAdminLib.getAdmins(sock, chatId);
    await sock.sendMessage(chatId, { text: `${text}\n\n${admins.map(a=>`@${a.split('@')[0]}`).join(' ')}\n\n_TunzyMD©_`, mentions: admins }, { quoted: message });
};
