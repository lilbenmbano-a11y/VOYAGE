const axios = require('axios');
const { reply } = require('./_helper');
module.exports = async (sock, chatId, message, args) => {
    try {
        const word = args[0]?.trim();
        if (!word) return reply(sock, chatId, '❌ Usage: .define <word>', message);
        const res = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`,{timeout:10000});
        const d=res.data[0], m=d.meanings[0], def=m.definitions[0];
        let text = `📖 *${d.word}*${d.phonetic?` _(${d.phonetic})_`:''}\n\n🏷️ *${m.partOfSpeech}*\n\n📝 ${def.definition}`;
        if (def.example) text += `\n\n💬 _"${def.example}"_`;
        if (def.synonyms?.length) text += `\n\n🔄 Synonyms: ${def.synonyms.slice(0,5).join(', ')}`;
        await reply(sock, chatId, text, message);
    } catch { await reply(sock, chatId, `❌ Word *${args[0]}* not found.`, message); }
};
