/**
 * Anonymous Chat — match two random users for private anonymous messaging
 * .anonymouschat / .anonstart / .anonstop / .anonNext
 */
const { reply, getSender } = require('./_helper');

const rooms = {};   // id → { a, b, state }
const inRoom = {};  // jid → roomId

function newRoom(sender) {
    const id = `room_${Date.now()}`;
    rooms[id] = { id, a: sender, b: null, state: 'WAITING' };
    inRoom[sender] = id;
    return id;
}

module.exports = async (sock, chatId, message, args, cmd) => {
    if (chatId.endsWith('@g.us'))
        return reply(sock, chatId, '❌ Anonymous Chat is for private chats only.', message);

    const sender = getSender(sock, message);

    if (cmd === 'anonymouschat') {
        return reply(sock, chatId,
            `👻 *Anonymous Chat*\n\nChat anonymously with a random stranger!\n\n` +
            `• .anonstart — find a partner\n• .anonstop — leave chat\n• .anonnext — find new partner\n\n_VOYAGE XD©_`,
            message);
    }

    if (cmd === 'anonstart' || cmd === 'anonfind') {
        if (inRoom[sender]) return reply(sock, chatId, '⚠️ You are already in a session. Use .anonstop to leave.', message);

        // Find waiting room
        const waiting = Object.values(rooms).find(r => r.state === 'WAITING' && r.a !== sender);
        if (waiting) {
            waiting.b = sender; waiting.state = 'CHATTING';
            inRoom[sender] = waiting.id;
            await sock.sendMessage(waiting.a, { text: `✅ *Partner found!* Start chatting.\nUse .anonstop to leave.\n\n_VOYAGE XD©_` });
            await reply(sock, chatId, `✅ *Partner found!* Start chatting.\nUse .anonstop to leave.`, message);
        } else {
            newRoom(sender);
            await reply(sock, chatId, `🔍 Searching for a partner... Please wait.\n\n_VOYAGE XD©_`, message);
        }
        return;
    }

    if (cmd === 'anonstop') {
        const rid = inRoom[sender];
        if (!rid) return reply(sock, chatId, '❌ You are not in a session.', message);
        const room = rooms[rid];
        const other = room.a === sender ? room.b : room.a;
        if (other) { delete inRoom[other]; await sock.sendMessage(other, { text: `👋 Partner left the chat.\n\n_VOYAGE XD©_` }); }
        delete inRoom[sender]; delete rooms[rid];
        return reply(sock, chatId, '👋 Left anonymous chat.', message);
    }

    if (cmd === 'anonnext') {
        const rid = inRoom[sender];
        if (rid) {
            const room = rooms[rid];
            const other = room.a === sender ? room.b : room.a;
            if (other) { delete inRoom[other]; await sock.sendMessage(other, { text: `👋 Partner is looking for someone new.\n\n_VOYAGE XD©_` }); }
            delete inRoom[sender]; delete rooms[rid];
        }
        const waiting = Object.values(rooms).find(r => r.state === 'WAITING' && r.a !== sender);
        if (waiting) {
            waiting.b = sender; waiting.state = 'CHATTING';
            inRoom[sender] = waiting.id;
            await sock.sendMessage(waiting.a, { text: `✅ *New partner found!* Start chatting.\n\n_VOYAGE XD©_` });
            await reply(sock, chatId, `✅ *New partner found!* Start chatting.`, message);
        } else {
            newRoom(sender);
            await reply(sock, chatId, `🔍 Searching for a new partner...\n\n_VOYAGE XD©_`, message);
        }
        return;
    }
};

module.exports.relay = async (sock, chatId, message, text) => {
    if (chatId.endsWith('@g.us')) return;
    const sender = getSender(sock, message);
    const rid    = inRoom[sender];
    if (!rid) return;
    const room   = rooms[rid];
    if (room.state !== 'CHATTING') return;
    const other  = room.a === sender ? room.b : room.a;
    if (!other) return;
    await sock.sendMessage(other, { text: `👤 Stranger: ${text}` });
};
