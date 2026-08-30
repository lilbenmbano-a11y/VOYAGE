const { reply } = require('./_helper');
module.exports = async (sock, chatId, message, args) => {
    const names=args.join(' ').split('&').map(s=>s.trim());
    if (names.length<2) return reply(sock, chatId, '❌ Usage: .love Name1 & Name2', message);
    let hash=0; for(const c of (names[0]+names[1]).toLowerCase()) hash=((hash<<5)-hash)+c.charCodeAt(0);
    const score=Math.abs(hash)%101, bar='█'.repeat(Math.round(score/10))+'░'.repeat(10-Math.round(score/10));
    await reply(sock, chatId, `${score>80?'💘':score>50?'💕':score>30?'💛':'💔'} *Love Calculator*\n\n💑 ${names[0]} & ${names[1]}\n\n${bar} *${score}%*\n\n${score>80?'Soulmates! 😍':score>50?'Good match! 💞':score>30?'Could work! 🤔':'Keep looking... 💀'}`, message);
};
