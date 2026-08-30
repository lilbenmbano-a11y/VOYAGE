const axios = require('axios');
const { reply } = require('./_helper');
function cp(e){return [...e].map(c=>c.codePointAt(0).toString(16)).join('-');}
module.exports = async (sock, chatId, message, args) => {
    try {
        const input=args.join(' ').trim(); const emojis=[...input].filter(c=>c.codePointAt(0)>127);
        if(emojis.length<2)return reply(sock,chatId,'❌ Provide 2 emojis!\nUsage: .emojimix 😂🔥',message);
        const [e1,e2]=emojis;
        const url1=`https://www.gstatic.com/android/keyboard/emojikitchen/20201001/u${cp(e1)}/u${cp(e1)}_u${cp(e2)}.png`;
        try{const r=await axios.get(url1,{responseType:'arraybuffer',timeout:10000});await sock.sendMessage(chatId,{image:Buffer.from(r.data),caption:`✨ ${e1}+${e2}`},{quoted:message});}
        catch{const url2=`https://www.gstatic.com/android/keyboard/emojikitchen/20201001/u${cp(e2)}/u${cp(e2)}_u${cp(e1)}.png`;const r2=await axios.get(url2,{responseType:'arraybuffer',timeout:10000});await sock.sendMessage(chatId,{image:Buffer.from(r2.data),caption:`✨ ${e1}+${e2}`},{quoted:message});}
    } catch { await reply(sock,chatId,'❌ Emoji combo not supported. Try: .emojimix 😂🔥',message); }
};
