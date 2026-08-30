/**
 * VOYAGE XD — .help / .menu
 * Delegates to lib/menuGenerator.js, which builds the menu from the
 * command registry (lib/commandRegistry.js + lib/commandData.js).
 * See Update 1 report for details.
 */
const { sendMenu } = require('../lib/menuGenerator');

module.exports = async (sock, chatId, message) => {
    await sendMenu(sock, chatId, message);
};
