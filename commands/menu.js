/**
 * VOYAGE XD — .menu (kept as a separate file for backward
 * compatibility with anything that imports commands/menu directly;
 * both this and commands/help.js share the same registry-driven
 * generator so they can never drift out of sync).
 */
const { sendMenu } = require('../lib/menuGenerator');

module.exports = async (sock, chatId, message) => {
    await sendMenu(sock, chatId, message);
};
