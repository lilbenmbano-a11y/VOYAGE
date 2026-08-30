const fs = require('fs');
const { reply, getSender } = require('./_helper');
const FILE='./data/notes.json';
function get(){try{return JSON.parse(fs.readFileSync(FILE,'utf8'));}catch{return {};}}
function save(d){fs.writeFileSync(FILE,JSON.stringify(d,null,2));}
module.exports = async (sock, chatId, message, args) => {
    const d=get(), sub=args[0]?.toLowerCase(), sender=getSender(sock,message);
    if(!sub||sub==='list'){const notes=d[sender]||{};const keys=Object.keys(notes);if(!keys.length)return reply(sock,chatId,'📝 No notes. .notes save <n> <text>',message);return reply(sock,chatId,`📝 *Your Notes*\n\n${keys.map((k,i)=>`*${i+1}.* ${k}`).join('\n')}\n\nUse: .notes get <n>`,message);}
    if(sub==='save'){const name=args[1];const text=args.slice(2).join(' ').trim();if(!name||!text)return reply(sock,chatId,'❌ Usage: .notes save <n> <text>',message);if(!d[sender])d[sender]={};d[sender][name]=text;save(d);return reply(sock,chatId,`✅ Note *${name}* saved!`,message);}
    if(sub==='get'){const name=args[1];if(!name)return reply(sock,chatId,'❌ Usage: .notes get <n>',message);const note=d[sender]?.[name];return reply(sock,chatId,note?`📝 *${name}*\n\n${note}`:`❌ Note *${name}* not found.`,message);}
    if(sub==='delete'){const name=args[1];if(!d[sender]?.[name])return reply(sock,chatId,`❌ Note not found.`,message);delete d[sender][name];save(d);return reply(sock,chatId,`✅ Note *${name}* deleted.`,message);}
};
