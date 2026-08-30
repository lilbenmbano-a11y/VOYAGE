const fs = require('fs');
const { reply, getSender, getIsOwner } = require('./_helper');
const FILE = './data/mode.json';
function getMode() { try { return JSON.parse(fs.readFileSync(FILE,'utf8')); } catch { return {mode:'public'}; } }
function saveMode(d) { fs.writeFileSync(FILE, JSON.stringify(d,null,2)); }
async function modeCommand(sock, chatId, message, args) {
    const sender = getSender(sock, message);
    const isOwner = getIsOwner(sock);
    if (!await isOwner(sender, sock, chatId)) return reply(sock, chatId, '❌ Owner only.', message);
    const sub = args[0]?.toLowerCase();
    if (!sub) return reply(sock, chatId, `🌐 *Bot Mode*\n\nCurrent: *${getMode().mode.toUpperCase()}*\n\n.mode public — Everyone can use\n.mode private — Only you can use\n\n_Private blocks both DMs and groups_`, message);
    if (!['public','private'].includes(sub)) return reply(sock, chatId, '❌ Use: .mode public OR .mode private', message);
    saveMode({mode:sub}); sock.public = sub==='public';
    await reply(sock, chatId, `✅ Mode set to *${sub.toUpperCase()}*\n\n${sub==='public'?'🌍 Everyone can use the bot.':'🔒 Only you can use the bot.\n_Blocks both groups and DMs._'}`, message);
}
module.exports = { modeCommand, getMode };
