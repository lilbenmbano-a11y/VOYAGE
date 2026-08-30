const fs = require('fs');
const { reply, getSender, getIsOwner } = require('./_helper');

const FILE = './data/antidelete.json';

function get() {
    try { return JSON.parse(fs.readFileSync(FILE, 'utf8')); }
    catch { return { enabled: false }; }
}
function save(d) {
    fs.writeFileSync(FILE, JSON.stringify(d, null, 2));
}

// Exported so index.js can check state
function isEnabled() {
    return get().enabled === true;
}

module.exports = async (sock, chatId, message, args) => {
    const sender = getSender(sock, message);
    if (!await getIsOwner(sock)(sender, sock, chatId))
        return reply(sock, chatId, '❌ Owner only.', message);

    const sub = args[0]?.toLowerCase();
    const d   = get();

    if (!sub)
        return reply(sock, chatId,
            `🗑️ *Anti-Delete*\nStatus: ${d.enabled ? '✅ ON' : '❌ OFF'}\n\n*Usage:*\n.antidelete on\n.antidelete off\n\n_Notifies owner when anyone deletes a message for everyone_`,
            message);

    if (sub === 'on') {
        save({ enabled: true });
        return reply(sock, chatId, '✅ Anti-delete *enabled!*\nYou will receive deleted messages in DM.', message);
    }
    if (sub === 'off') {
        save({ enabled: false });
        return reply(sock, chatId, '❌ Anti-delete *disabled.*', message);
    }

    return reply(sock, chatId, '⚠️ Use: .antidelete on / .antidelete off', message);
};

module.exports.isEnabled = isEnabled;
