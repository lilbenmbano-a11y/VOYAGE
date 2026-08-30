/**
 * VOYAGE XD — Alive Command (Cypher-style)
 */
const os = require('os');
const settings = require('../settings');

function ramBar() {
    const total = os.totalmem(), free = os.freemem();
    const pct = Math.round(((total - free) / total) * 100);
    const filled = Math.round(pct / 10);
    return { bar: '█'.repeat(filled) + '░'.repeat(10 - filled), pct };
}
function formatUptime(ms) {
    const s = Math.floor(ms / 1000), d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600), mn = Math.floor((s % 3600) / 60), sc = s % 60;
    if (d > 0) return `${d}d ${h}h ${mn}m`;
    if (h > 0) return `${h}h ${mn}m ${sc}s`;
    return `${mn}m ${sc}s`;
}
function measureSpeed() {
    const t = Date.now(); let x = 0;
    for (let i = 0; i < 1e5; i++) x += i;
    return Date.now() - t;
}

module.exports = async (sock, chatId, message) => {
    const { bar, pct } = ramBar();
    const uptime = formatUptime(Date.now() - (global.botStartTime || Date.now()));
    const speed = measureSpeed();
    const caption = `*┏━━━━━━━━━━━━━━━━━━━┓*\n` +
        `┃ ♤ *STATUS*: Online ✅\n` +
        `┃ ♤ *BOTNAME*: ${settings.botName}\n` +
        `┃ ♤ *UPTIME*: ${uptime}\n` +
        `┃ ♤ *SPEED*: ${speed}ms\n` +
        `┃ ♤ *CHIP*: [${bar}] ${pct}%\n` +
        `┃ ♤ *NODE*: ${process.version}\n` +
        `┃ ♤ *DEV*: Voyage XD\n` +
        `*┗━━━━━━━━━━━━━━━━━━━┛*\n\n_VOYAGE XD© — Always On, Always Ready_`;
    try {
        await sock.sendMessage(chatId, {
            image: { url: settings.BOT_IMG },
            caption
        }, { quoted: message });
    } catch {
        await sock.sendMessage(chatId, { text: caption }, { quoted: message });
    }
};
