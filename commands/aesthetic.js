const { reply } = require('./_helper');
module.exports = async (sock, chatId, message, args) => {
    if (!args.length) return reply(sock, chatId, '❌ Usage: .aesthetic <text>', message);
    const text = args.join(' ');
    const normal = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const fullwidth = 'ＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚ０１２３４５６７８９';
    let result = '';
    for (const c of text) {
        const idx = normal.indexOf(c);
        result += idx !== -1 ? fullwidth[idx] : c === ' ' ? '　' : c;
    }
    await reply(sock, chatId, `✨ *Aesthetic Text*\n\n${result}`, message);
};
