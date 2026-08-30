const { reply } = require('./_helper');
module.exports = async (sock, chatId, message, args) => {
    const text=args.join(' ').trim(); if(!text)return reply(sock,chatId,'❌ Usage: .count <text>',message);
    const chars=text.length, words=text.split(/\s+/).filter(Boolean).length, sentences=text.split(/[.!?]+/).filter(Boolean).length;
    await reply(sock,chatId,`📊 *Text Counter*\n\n📝 Characters: *${chars}*\n💬 Words: *${words}*\n📄 Sentences: *${sentences}*`,message);
};
