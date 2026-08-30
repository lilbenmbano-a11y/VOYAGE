const fs=require('fs');
const {checkAdmin,reply,getSender,isAdmin,getIsOwner}=require('./_helper');
const FILE='./data/antibadword.json';
const DEFAULT=['fuck','shit','bitch','asshole','bastard'];
function get(){try{return JSON.parse(fs.readFileSync(FILE,'utf8'));}catch{return {};}}
function save(d){fs.writeFileSync(FILE,JSON.stringify(d,null,2));}
async function antibadwordCommand(sock,chatId,message,args){
    if(!chatId.endsWith('@g.us'))return reply(sock,chatId,'❌ Groups only.',message);
    if(!await checkAdmin(sock,chatId,message))return reply(sock,chatId,'❌ You need to be an admin.',message);
    const d=get(),sub=args[0]?.toLowerCase();
    if(!sub)return reply(sock,chatId,`🤬 *Anti-Badword*\nStatus: ${d[chatId]?.enabled?'✅ ON':'❌ OFF'}\n\n.abw on\n.abw off\n.abw add <word>`,message);
    if(sub==='on'){d[chatId]={...d[chatId],enabled:true};save(d);return reply(sock,chatId,'✅ Anti-badword *enabled!*',message);}
    if(sub==='off'){d[chatId]={...d[chatId],enabled:false};save(d);return reply(sock,chatId,'❌ Anti-badword *disabled.*',message);}
    if(sub==='add'&&args[1]){if(!d[chatId])d[chatId]={enabled:true,words:[]};if(!d[chatId].words)d[chatId].words=[];d[chatId].words.push(args[1].toLowerCase());save(d);return reply(sock,chatId,`✅ Word *${args[1]}* added.`,message);}
}
async function handleBadword(sock,chatId,message){
    if(!chatId.endsWith('@g.us'))return;
    const d=get();if(!d[chatId]?.enabled)return;
    const sender=getSender(sock,message);
    const isOwner=getIsOwner(sock);
    if(await isAdmin(sock,chatId,sender)||await isOwner(sender,sock,chatId))return;
    const text=(message.message?.conversation||message.message?.extendedTextMessage?.text||'').toLowerCase();
    const words=d[chatId]?.words||DEFAULT;
    if(!words.some(w=>text.includes(w)))return;
    try{await sock.sendMessage(chatId,{delete:message.key});}catch{}
    await sock.sendMessage(chatId,{text:`⚠️ @${sender.split('@')[0]}, please watch your *language!*\n\n_VOYAGE XD©_`,mentions:[sender]});
}
module.exports={antibadwordCommand,handleBadword};
