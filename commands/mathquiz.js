/**
 * Math Quiz game
 * Usage: .mathquiz easy / medium / hard
 */
const { reply } = require('./_helper');

const active = {};

const LEVELS = {
    easy:   { range: 20,  ops: ['+','-'],        time: 30 },
    medium: { range: 50,  ops: ['+','-','*'],     time: 25 },
    hard:   { range: 100, ops: ['+','-','*','/'], time: 20 },
};

function generate(level) {
    const cfg = LEVELS[level] || LEVELS.medium;
    const op  = cfg.ops[Math.floor(Math.random() * cfg.ops.length)];
    let a = Math.floor(Math.random() * cfg.range) + 1;
    let b = Math.floor(Math.random() * cfg.range) + 1;
    if (op === '/') { b = Math.floor(Math.random() * 9) + 1; a = b * (Math.floor(Math.random() * 10) + 1); }
    const answer = eval(`${a} ${op} ${b}`);
    return { question: `${a} ${op} ${b}`, answer: Math.round(answer * 100) / 100 };
}

module.exports = async (sock, chatId, message, args) => {
    if (active[chatId]) return reply(sock, chatId, '⚠️ A quiz is already running! Answer it first.', message);

    const level = (args[0] || 'medium').toLowerCase();
    if (!LEVELS[level]) return reply(sock, chatId, '❌ Levels: easy / medium / hard', message);

    const { question, answer } = generate(level);
    const seconds = LEVELS[level].time;
    active[chatId] = { answer, timeout: null };

    await sock.sendMessage(chatId, {
        text: `🧮 *Math Quiz — ${level.toUpperCase()}*\n\n*What is: ${question} = ?*\n\n⏱️ You have ${seconds} seconds!\n\n_VOYAGE XD©_`,
    }, { quoted: message });

    active[chatId].timeout = setTimeout(async () => {
        if (!active[chatId]) return;
        delete active[chatId];
        await sock.sendMessage(chatId, {
            text: `⏰ Time's up! The answer was *${answer}*\n\n_VOYAGE XD©_`,
        });
    }, seconds * 1000);
};

module.exports.checkAnswer = async (sock, chatId, message, text) => {
    if (!active[chatId]) return;
    const num = parseFloat(text.trim());
    if (isNaN(num)) return;
    if (Math.abs(num - active[chatId].answer) < 0.01) {
        clearTimeout(active[chatId].timeout);
        delete active[chatId];
        const sender = message.key.participant || message.key.remoteJid;
        await sock.sendMessage(chatId, {
            text: `🎉 Correct! @${sender.split('@')[0]} got it!\n\n_VOYAGE XD©_`,
            mentions: [sender],
        });
    }
};
