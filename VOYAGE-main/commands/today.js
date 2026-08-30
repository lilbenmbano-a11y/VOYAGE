const axios = require('axios');
const { reply } = require('./_helper');
module.exports = async (sock, chatId, message) => {
    try {
        const now=new Date(); const m=now.getMonth()+1; const d=now.getDate();
        const r = await axios.get(`https://history.muffinlabs.com/date/${m}/${d}`,{timeout:10000});
        const events=r.data.data.Events.slice(0,5);
        let text=`📅 *Today in History (${d}/${m})*\n\n`;
        events.forEach(e=>{text+=`• *${e.year}:* ${e.text}\n\n`;});
        await reply(sock, chatId, text, message);
    } catch { await reply(sock, chatId, '❌ Could not fetch history.', message); }
};
