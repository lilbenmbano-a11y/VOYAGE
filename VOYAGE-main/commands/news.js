const axios = require('axios');
const { reply } = require('./_helper');
const topics = {world:'world',tech:'technology',sports:'sport',africa:'world/africa',business:'business',health:'health'};
module.exports = async (sock, chatId, message, args) => {
    try {
        const topic = args[0]?.toLowerCase() || 'world';
        const feed = topics[topic] || 'world';
        const res = await axios.get(`http://feeds.bbci.co.uk/news/${feed}/rss.xml`,{timeout:10000,headers:{'User-Agent':'Mozilla/5.0'}});
        const items = res.data.match(/<item>([\s\S]*?)<\/item>/g)?.slice(0,5)||[];
        if (!items.length) return reply(sock, chatId, '❌ No news found.', message);
        let text = `📰 *${topic.charAt(0).toUpperCase()+topic.slice(1)} News*\n_BBC News_\n${'─'.repeat(18)}\n\n`;
        items.forEach((item,i) => {
            const title = item.match(/<title><!\[CDATA\[(.*?)\]\]>/)?.[1] || item.match(/<title>(.*?)<\/title>/)?.[1] || '';
            text += `*${i+1}.* ${title.trim()}\n\n`;
        });
        text += `_Available: world tech sports africa business health_`;
        await reply(sock, chatId, text, message);
    } catch { await reply(sock, chatId, '❌ Could not fetch news.', message); }
};
