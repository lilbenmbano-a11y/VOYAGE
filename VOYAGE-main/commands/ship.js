const { getMentioned, reply, SIG } = require('./_helper');
module.exports = async (sock, chatId, message) => {
    const mentioned=getMentioned(message);
    if (mentioned.length<2) return reply(sock, chatId, '❌ Mention 2 people: .ship @user1 @user2', message);
    const [u1,u2]=mentioned;
    let hash=0; for(const c of (u1+u2)) hash=((hash<<5)-hash)+c.charCodeAt(0);
    const score=Math.abs(hash)%101, bar='█'.repeat(Math.round(score/10))+'░'.repeat(10-Math.round(score/10));
    const e=score>80?'💘':score>50?'💕':score>30?'💛':'💔';
    await sock.sendMessage(chatId,{text:`${e} *Ship Meter*\n\n@${u1.split('@')[0]} + @${u2.split('@')[0]}\n\n${bar} *${score}%*\n\n${score>80?'Soulmates! 😍':score>50?'Good match! 💞':score>30?'Could work! 🤔':'Keep looking... 💀'}${SIG}`,mentions:[u1,u2]},{quoted:message});
};
