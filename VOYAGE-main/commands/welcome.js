const fs=require('fs');
const {checkAdmin,reply}=require('./_helper');
const FILE='./data/welcome.json';
function get(){try{return JSON.parse(fs.readFileSync(FILE,'utf8'));}catch{return {};}}
function save(d){fs.writeFileSync(FILE,JSON.stringify(d,null,2));}
async function welcomeCommand(sock,chatId,message,args){
    if(!chatId.endsWith('@g.us'))return reply(sock,chatId,'❌ Groups only.',message);
    if(!await checkAdmin(sock,chatId,message))return reply(sock,chatId,'❌ You need to be an admin.',message);
    const d=get(),sub=args[0]?.toLowerCase();
    if(!sub)return reply(sock,chatId,`👋 *Welcome*\nStatus: ${d[chatId]?.enabled?'✅ ON':'❌ OFF'}\n\n.welcome on\n.welcome off\n.welcome set <msg>\n\nVariables: @user, @group`,message);
    if(sub==='on'){d[chatId]={...d[chatId],enabled:true};save(d);return reply(sock,chatId,'✅ Welcome *enabled!*',message);}
    if(sub==='off'){d[chatId]={...d[chatId],enabled:false};save(d);return reply(sock,chatId,'❌ Welcome *disabled.*',message);}
    if(sub==='set'){const msg=args.slice(1).join(' ').trim();if(!msg)return reply(sock,chatId,'❌ Usage: .welcome set <msg>',message);d[chatId]={...d[chatId],msg,enabled:true};save(d);return reply(sock,chatId,`✅ Welcome message set!`,message);}
}
async function handleJoin(sock,gid,participants){
    try{
        const d=get(),c=d[gid];if(!c?.enabled)return;
        const meta=await sock.groupMetadata(gid);
        for(const p of participants){
            let msg=c.msg||`👋 Welcome *@user* to *${meta.subject}*! 🎉\n\nWe're glad to have you here!`;
            msg=msg.replace(/@user/gi,`@${p.split('@')[0]}`).replace(/@group/gi,meta.subject);
            await sock.sendMessage(gid,{text:msg+'\n\n_VOYAGE XD©_',mentions:[p]});
        }
    }catch{}
}
module.exports={welcomeCommand,handleJoin};
