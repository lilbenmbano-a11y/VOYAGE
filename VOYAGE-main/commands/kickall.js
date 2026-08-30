const { reply, getSender, getIsOwner } = require('./_helper');
const isAdminLib = require('../lib/isAdmin');
module.exports = async (sock, chatId, message) => {
    if (!chatId.endsWith('@g.us')) return reply(sock, chatId, '❌ Groups only.', message);
    const sender = getSender(sock, message);
    const isOwner = getIsOwner(sock);
    if (!await isOwner(sender, sock, chatId)) return reply(sock, chatId, '❌ Owner only.', message);
    if (!await isAdminLib.isBotAdmin(sock, chatId)) return reply(sock, chatId, '❌ Make me an admin first.', message);
    const meta = await sock.groupMetadata(chatId);
    const members = meta.participants.filter(p=>!p.admin).map(p=>p.id);
    if (!members.length) return reply(sock, chatId, '✅ No regular members to kick.', message);
    await reply(sock, chatId, `⚠️ Kicking ${members.length} members...`, message);
    for (const m of members) { try { await sock.groupParticipantsUpdate(chatId,[m],'remove'); await new Promise(r=>setTimeout(r,500)); } catch {} }
    await reply(sock, chatId, `✅ Kicked ${members.length} members.`, message);
};
