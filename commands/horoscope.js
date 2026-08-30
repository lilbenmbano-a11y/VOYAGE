const axios = require('axios');
const { reply } = require('./_helper');
const signs=['aries','taurus','gemini','cancer','leo','virgo','libra','scorpio','sagittarius','capricorn','aquarius','pisces'];
module.exports = async (sock, chatId, message, args) => {
    try {
        const sign=args[0]?.toLowerCase();
        if(!sign||!signs.includes(sign))return reply(sock,chatId,`❌ Usage: .horoscope <sign>\nSigns: ${signs.join(', ')}`,message);
        const r=await axios.get(`https://horoscope-app-api.vercel.app/api/v1/get-horoscope/daily?sign=${sign}&day=TODAY`,{timeout:10000});
        const data=r.data?.data;
        if(!data)return reply(sock,chatId,'❌ Could not fetch horoscope.',message);
        await reply(sock,chatId,`🔮 *${sign.charAt(0).toUpperCase()+sign.slice(1)} Horoscope*\n📅 ${data.date||'Today'}\n\n${data.horoscope_data||'No data.'}`,message);
    } catch { await reply(sock,chatId,'❌ Horoscope service unavailable.',message); }
};
