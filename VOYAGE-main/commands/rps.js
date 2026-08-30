/**
 * Rock Paper Scissors PvP
 * Usage: .rps @user
 */
const { getSender } = require('./_helper');
const { reply }     = require('./_helper');

const sessions = {};
const CHOICES  = ['🪨 Rock', '📄 Paper', '✂️ Scissors'];
const WINS     = { '🪨 Rock': '✂️ Scissors', '📄 Paper': '🪨 Rock', '✂️ Scissors': '📄 Paper' };

module.exports = async (sock, chatId, message, args) => {
    const sender   = getSender(sock, message);
    const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const opponent  = mentioned[0];

    if (!opponent)
        return reply(sock, chatId, `❌ Tag someone to challenge!\nUsage: .rps @person`, message);
    if (opponent === sender)
        return reply(sock, chatId, `❌ You can't challenge yourself!`, message);

    const sessionId = `rps_${chatId}_${Date.now()}`;
    sessions[sessionId] = { challenger: sender, opponent, choices: {}, chatId, timeout: null };

    const tag1 = `@${sender.split('@')[0]}`;
    const tag2 = `@${opponent.split('@')[0]}`;

    sessions[sessionId].timeout = setTimeout(() => {
        delete sessions[sessionId];
    }, 60000);

    await sock.sendMessage(chatId, {
        text: `🎮 *ROCK PAPER SCISSORS*\n\n${tag1} challenges ${tag2}!\n\nBoth players: reply with your choice:\n• *rock*\n• *paper*\n• *scissors*\n\n⏱️ 60 seconds to respond!\n\n_Session ID: ${sessionId}_\n\n_VOYAGE XD©_`,
        mentions: [sender, opponent],
    }, { quoted: message });

    // Store handler
    if (!global.rpsHandler) global.rpsHandler = {};
    global.rpsHandler[chatId] = global.rpsHandler[chatId] || {};
    global.rpsHandler[chatId][sessionId] = async (respSock, respChat, respMsg) => {
        const respSender = getSender(respSock, respMsg);
        if (![sender, opponent].includes(respSender)) return;

        const rawText = respMsg.message?.conversation ||
                        respMsg.message?.extendedTextMessage?.text || '';
        const choice  = CHOICES.find(c => rawText.toLowerCase().includes(c.split(' ')[1].toLowerCase()));
        if (!choice) return;

        const session = sessions[sessionId];
        if (!session || session.choices[respSender]) return;
        session.choices[respSender] = choice;

        if (Object.keys(session.choices).length < 2) {
            await respSock.sendMessage(respChat, {
                text: `✅ @${respSender.split('@')[0]} chose. Waiting for the other player...`,
                mentions: [respSender],
            });
            return;
        }

        clearTimeout(session.timeout);
        delete sessions[sessionId];
        delete global.rpsHandler[chatId][sessionId];

        const c1 = session.choices[sender];
        const c2 = session.choices[opponent];
        let result;
        if (c1 === c2)                 result = '🤝 *It\'s a TIE!*';
        else if (WINS[c1] === c2)      result = `🏆 *${tag1} wins!* ${c1} beats ${c2}`;
        else                           result = `🏆 *${tag2} wins!* ${c2} beats ${c1}`;

        await respSock.sendMessage(respChat, {
            text: `🎮 *ROCK PAPER SCISSORS — RESULT*\n\n${tag1}: ${c1}\n${tag2}: ${c2}\n\n${result}\n\n_VOYAGE XD©_`,
            mentions: [sender, opponent],
        });
    };
};

module.exports.handleResponse = async (sock, chatId, message) => {
    if (!global.rpsHandler?.[chatId]) return;
    for (const fn of Object.values(global.rpsHandler[chatId])) {
        await fn(sock, chatId, message);
    }
};
