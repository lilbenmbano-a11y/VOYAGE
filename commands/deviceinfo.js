const { reply } = require('./_helper');
const os = require('os');
module.exports = async (sock, chatId, message) => {
    const up=process.uptime();const d=Math.floor(up/86400),h=Math.floor((up%86400)/3600),m=Math.floor((up%3600)/60),s=Math.floor(up%60);
    const ram=(process.memoryUsage().rss/1024/1024).toFixed(1);
    const total=(os.totalmem()/1024/1024).toFixed(0);
    await reply(sock,chatId,`📱 *Device Info*\n\n💻 Platform: ${os.platform()}\n🔧 Node: ${process.version}\n⏱️ Uptime: ${d}d ${h}h ${m}m ${s}s\n💾 RAM: ${ram}MB / ${total}MB\n🖥️ CPU: ${os.cpus()[0]?.model||'N/A'}\n🏠 Hostname: ${os.hostname()}`,message);
};
