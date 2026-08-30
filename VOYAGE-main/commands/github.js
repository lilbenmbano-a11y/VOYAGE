const axios = require('axios');
const { reply } = require('./_helper');
module.exports = async (sock, chatId, message, args) => {
    try {
        const user = args[0]?.trim();
        if (!user) return reply(sock, chatId, '❌ Usage: .github <username>', message);
        const res = await axios.get(`https://api.github.com/users/${user}`,{timeout:10000});
        const u = res.data;
        await reply(sock, chatId, `🐙 *GitHub: @${u.login}*\n\n👤 ${u.name||'N/A'}\n📝 ${u.bio||'No bio'}\n📍 ${u.location||'N/A'}\n\n⭐ Repos: ${u.public_repos}\n👥 Followers: ${u.followers}\n👣 Following: ${u.following}\n\n🔗 ${u.html_url}`, message);
    } catch { await reply(sock, chatId, `❌ GitHub user not found.`, message); }
};
