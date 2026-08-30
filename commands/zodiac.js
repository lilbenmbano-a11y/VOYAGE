const { reply } = require('./_helper');
const signs={aries:{e:'♈',d:'Mar 21–Apr 19',t:'Bold & Ambitious'},taurus:{e:'♉',d:'Apr 20–May 20',t:'Reliable & Patient'},gemini:{e:'♊',d:'May 21–Jun 20',t:'Witty & Curious'},cancer:{e:'♋',d:'Jun 21–Jul 22',t:'Intuitive & Caring'},leo:{e:'♌',d:'Jul 23–Aug 22',t:'Creative & Passionate'},virgo:{e:'♍',d:'Aug 23–Sep 22',t:'Analytical & Kind'},libra:{e:'♎',d:'Sep 23–Oct 22',t:'Diplomatic & Fair'},scorpio:{e:'♏',d:'Oct 23–Nov 21',t:'Brave & Resourceful'},sagittarius:{e:'♐',d:'Nov 22–Dec 21',t:'Generous & Idealistic'},capricorn:{e:'♑',d:'Dec 22–Jan 19',t:'Disciplined & Responsible'},aquarius:{e:'♒',d:'Jan 20–Feb 18',t:'Progressive & Original'},pisces:{e:'♓',d:'Feb 19–Mar 20',t:'Compassionate & Artistic'}};
module.exports = async (sock, chatId, message, args) => {
    const name=args[0]?.toLowerCase(); const sign=signs[name];
    if (!sign) return reply(sock, chatId, `❌ Usage: .zodiac <sign>\nSigns: ${Object.keys(signs).join(', ')}`, message);
    await reply(sock, chatId, `${sign.e} *${name.charAt(0).toUpperCase()+name.slice(1)}*\n\n📅 ${sign.d}\n✨ ${sign.t}`, message);
};
