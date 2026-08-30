const { reply } = require('./_helper');
module.exports = async (sock, chatId, message, args) => {
    const dob=args.join(' ').trim();
    if(!dob)return reply(sock,chatId,'❌ Usage: .age DD/MM/YYYY\nExample: .age 15/03/2000',message);
    try {
        const [d,m,y]=dob.split('/').map(Number); const birth=new Date(y,m-1,d);
        if(isNaN(birth.getTime()))throw new Error();
        const now=new Date(); let age=now.getFullYear()-birth.getFullYear();
        if(now.getMonth()<birth.getMonth()||(now.getMonth()===birth.getMonth()&&now.getDate()<birth.getDate()))age--;
        const next=new Date(now.getFullYear(),birth.getMonth(),birth.getDate());
        if(next<now)next.setFullYear(now.getFullYear()+1);
        const days=Math.ceil((next-now)/86400000);
        await reply(sock,chatId,`🎂 *Age Calculator*\n\n📅 DOB: ${dob}\n🎉 Age: *${age} years old*\n⏳ Next birthday: *${days} days*`,message);
    } catch { await reply(sock,chatId,'❌ Invalid date. Format: DD/MM/YYYY',message); }
};
