const axios = require('axios');
const { reply } = require('./_helper');
module.exports = async (sock, chatId, message, args) => {
    const repo = args[0]?.trim();
    if (!repo) return reply(sock, chatId, '❌ Usage: .gitclone <github-url>\nExample: .gitclone https://github.com/user/repo', message);
    try {
        const match = repo.match(/github\.com\/([^\/]+)\/([^\/\s]+)/);
        if (!match) return reply(sock, chatId, '❌ Invalid GitHub URL.', message);
        const [,user, repoName] = match;
        const r = await axios.get(`https://api.github.com/repos/${user}/${repoName}`, { timeout: 10000 });
        const d = r.data;
        await reply(sock, chatId, `🐙 *${d.full_name}*\n━━━━━━━━━━━━\n📝 ${d.description||'No description'}\n⭐ ${d.stargazers_count} stars\n🍴 ${d.forks_count} forks\n💻 ${d.language||'N/A'}\n\n📦 *Clone:*\n\`git clone ${d.clone_url}\`\n\n⬇️ *ZIP:*\nhttps://github.com/${user}/${repoName}/archive/refs/heads/${d.default_branch}.zip`, message);
    } catch { await reply(sock, chatId, '❌ Repo not found or private.', message); }
};
