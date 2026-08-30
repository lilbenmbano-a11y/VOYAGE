const fs = require('fs');
const { checkAdmin, reply, getSender, isAdmin, getIsOwner } = require('./_helper');
const FILE='./data/antilink.json';
const LINK_RE=/(https?:\/\/[^\s]+)|(www\.[^\s]+)|chat\.whatsapp\.com\/[a-zA-Z0-9]+/gi;
function get(){try{return JSON.parse(fs.readFileSync(FILE,'utf8'));}catch{return {};}}
function save(d){fs.writeFileSync(FILE,JSON.stringify(d,null,2));}
async function antilinkCommand(sock,chatId,message,args){
    if(!chatId.endsWith('@g.us'))return reply(sock,chatId,'❌ Groups only.',message);
    if(!await checkAdmin(sock,chatId,message))return reply(sock,chatId,'❌ You need to be an admin.',message);
    const d=get(),sub=args[0]?.toLowerCase();
    if(!sub)return reply(sock,chatId,`🔗 *Anti-Link*\nStatus: ${d[chatId]?.enabled?'✅ ON':'❌ OFF'}\n\n.antilink on\n.antilink off`,message);
    if(sub==='on'){d[chatId]={enabled:true};save(d);return reply(sock,chatId,'✅ Anti-link *enabled!*',message);}
    if(sub==='off'){d[chatId]={enabled:false};save(d);return reply(sock,chatId,'❌ Anti-link *disabled.*',message);}
}
async function handleLink(sock,chatId,message){
    if(!chatId.endsWith('@g.us'))return;
    const d=get();if(!d[chatId]?.enabled)return;
    const sender=getSender(sock,message);
    const isOwner=getIsOwner(sock);
    if(await isAdmin(sock,chatId,sender)||await isOwner(sender,sock,chatId))return;
    const text=message.message?.conversation||message.message?.extendedTextMessage?.text||message.message?.imageMessage?.caption||'';
    if(!LINK_RE.test(text))return;
    try{await sock.sendMessage(chatId,{delete:message.key});}catch{}
    await sock.sendMessage(chatId,{text:`⚠️ @${sender.split('@')[0]}, links are *not allowed* here!\n\n_TunzyMD©_`,mentions:[sender]});
}
module.exports={antilinkCommand,handleLink};
