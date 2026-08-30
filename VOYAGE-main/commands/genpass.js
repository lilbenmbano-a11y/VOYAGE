const { reply } = require('./_helper');
module.exports = async (sock, chatId, message, args) => {
    const len = Math.min(parseInt(args[0])||16, 64);
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let pass = '';
    for (let i=0;i<len;i++) pass+=chars[Math.floor(Math.random()*chars.length)];
    await reply(sock, chatId, `🔐 *Password Generator*\n━━━━━━━━━━━━\n\`${pass}\`\n\nLength: ${len}\n\n_Do NOT share this!_`, message);
};
