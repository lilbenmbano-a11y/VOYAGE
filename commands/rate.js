const { reply } = require('./_helper');
module.exports = async (sock, chatId, message, args) => {
    const thing = args.join(' ').trim();
    if (!thing) return reply(sock, chatId, '❌ Usage: .rate <anything>', message);
    let hash=0; for(const c of thing.toLowerCase()) hash=((hash<<5)-hash)+c.charCodeAt(0);
    const score=Math.abs(hash)%11, bar='█'.repeat(score)+'░'.repeat(10-score);
    await reply(sock, chatId, `${score>=8?'🔥':score>=5?'👍':'😐'} *Rating: ${thing}*\n\n${bar} *${score}/10*`, message);
};
