const { reply, getSender, getIsOwner } = require('./_helper');
const os = require('os');
module.exports = async (sock, chatId, message) => {
    const sender = getSender(sock, message);
    if (!await getIsOwner(sock)(sender, sock, chatId)) return reply(sock, chatId, '❌ Owner only.', message);
    const total = os.totalmem(), free = os.freemem(), used = total-free;
    const pct = Math.round((used/total)*100);
    const bar = '█'.repeat(Math.round(pct/10))+'░'.repeat(10-Math.round(pct/10));
    await reply(sock, chatId, `💾 *System Info*\n━━━━━━━━━━━━\n🖥️ Platform: ${os.platform()}\n💾 RAM: ${(used/1024/1024).toFixed(0)}MB / ${(total/1024/1024).toFixed(0)}MB\n${bar} ${pct}%\n🔧 Node: ${process.version}\n⏱️ Uptime: ${Math.floor(os.uptime()/3600)}h`, message);
};
