/**
 * VOYAGE XD — Menu Generator
 * ────────────────────────────────────────────────────────────────
 * Builds the bot's menu text straight from the command registry, so
 * the four departments (🖼️ MEDIA CENTER, 🎧 AUDIO LAB, 🧠 INTELLIGENCE
 * CORE, 🛠️ UTILITY TOOLS) are always in sync with whatever commands
 * are actually registered — nothing here is hand-typed per command.
 *
 * Both commands/help.js and commands/menu.js call into this so the
 * two entry points (.help and .menu) can never drift out of sync
 * with each other again.
 *
 * The menu design reference image is read from MENU_IMAGE_URL at
 * request time (never hard-coded) and falls back to the bot's
 * regular profile image if that variable isn't set.
 */
const os = require('os');
const settings = require('../settings');
const userState = require('./userState');
const registry = require('./commandRegistry');

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

/**
 * Returns the menu reference image URL. Read from the environment
 * every call (never cached/hard-coded) so it can be rotated without
 * a redeploy. Falls back to settings.BOT_IMG if unset.
 */
function getMenuImageUrl() {
    return process.env.MENU_IMAGE_URL || settings.BOT_IMG;
}

/** Build the full menu text for a given user/session. */
function buildMenuText(sock) {
    const { bar, pct } = ramBar();
    const uptime = formatUptime(Date.now() - (global.botStartTime || Date.now()));
    const prefix = userState.getPrefix(sock?._ownerPhone, settings.prefix || '.');
    const totalCmds = registry.getEnabled().length;

    let out = `*┏━━━━━━━━━━━━━━━━━━━┓*\n`;
    out += `┃ ♤ *BOTNAME*: ${settings.botName}\n`;
    out += `┃ ♤ *DEV*: Voyage XD\n`;
    out += `┃ ♤ *PREFIX*: [ ${prefix} ]\n`;
    out += `┃ ♤ *VERSION*: v${settings.version}\n`;
    out += `┃ ♤ *UPTIME*: ${uptime}\n`;
    out += `┃ ♤ *COMMANDS*: ${totalCmds}+\n`;
    out += `┃ ♤ *CHIP*: [${bar}] ${pct}%\n`;
    out += `┃ ♤ *NODE*: ${process.version}\n`;
    out += `*┗━━━━━━━━━━━━━━━━━━━┛*\n`;

    for (const { key, label } of registry.getCategories()) {
        const cmds = registry.getByCategory(key);
        if (!cmds.length) continue;
        out += `\n┏❒ *${label}* ❒\n`;
        for (const c of cmds) {
            const aliasSuffix = c.aliases.length ? ` (${c.aliases.join(', ')})` : '';
            out += `┃✰ ${prefix}${c.name}${aliasSuffix}\n`;
        }
        out += `┗❒\n`;
    }

    out += `\n©Copyright Voyage XD — VOYAGE XD v${settings.version}\n_VOYAGE XD© — Always On, Always Ready_`;
    return out;
}

/** Send the menu (with the design-reference image where possible). */
async function sendMenu(sock, chatId, message) {
    const text = buildMenuText(sock);
    try {
        await sock.sendMessage(chatId, {
            image: { url: getMenuImageUrl() },
            caption: text,
        }, { quoted: message });
    } catch {
        await sock.sendMessage(chatId, { text }, { quoted: message });
    }
}

module.exports = { buildMenuText, sendMenu, getMenuImageUrl };
