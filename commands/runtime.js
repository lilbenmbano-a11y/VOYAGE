const { reply } = require('./_helper');
module.exports = async (sock, chatId, message) => {
    const up = process.uptime();
    const d=Math.floor(up/86400),h=Math.floor((up%86400)/3600),m=Math.floor((up%3600)/60),s=Math.floor(up%60);
    await reply(sock, chatId, `⏱️ *Runtime*\n━━━━━━━━━━━━\n🕐 *${d}d ${h}h ${m}m ${s}s*\n\n_Bot has been running continuously_`, message);
};
