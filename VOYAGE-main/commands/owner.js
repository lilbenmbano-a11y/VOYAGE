const settings = require('../settings');
const { reply } = require('./_helper');
module.exports = async (sock, chatId, message) => {
    await reply(sock, chatId,
`👑 *Bot Owner*
━━━━━━━━━━━━━━━━
📛 *Name:* ${settings.botOwner}
📱 *Number:* +${settings.ownerNumber}
🤖 *Bot:* VOYAGE XD v${settings.version}
━━━━━━━━━━━━━━━━
_Contact the owner for support_`, message);
    try {
        await sock.sendMessage(chatId, {
            contacts: {
                displayName: settings.botOwner,
                contacts: [{
                    vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${settings.botOwner}\nTEL;type=CELL;waid=${settings.ownerNumber}:+${settings.ownerNumber}\nEND:VCARD`
                }]
            }
        });
    } catch {}
};
