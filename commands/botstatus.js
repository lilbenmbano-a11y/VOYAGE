const { reply } = require('./_helper');
module.exports = async (sock, chatId, message) => {
    const up = process.uptime();
    const d=Math.floor(up/86400),h=Math.floor((up%86400)/3600),m=Math.floor((up%3600)/60),s=Math.floor(up%60);
    const ram = (process.memoryUsage().rss/1024/1024).toFixed(1);
    await reply(sock, chatId,
`🤖 *Bot Status*
━━━━━━━━━━━━━━━━━
✅ Status: *Online*
⏱️ Uptime: *${d}d ${h}h ${m}m ${s}s*
💾 RAM: *${ram}MB*
🔧 Node: *${process.version}*
📦 Commands: *100+*
🌐 Mode: *${sock.public?'Public':'Private'}*
━━━━━━━━━━━━━━━━━
_VOYAGE XD©_`, message);
};
