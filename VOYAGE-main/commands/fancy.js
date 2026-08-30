const { reply } = require('./_helper');
const styles = {
    bold:   t => t.split('').map(c=>'𝐀𝐁𝐂𝐃𝐄𝐅𝐆𝐇𝐈𝐉𝐊𝐋𝐌𝐍𝐎𝐏𝐐𝐑𝐒𝐓𝐔𝐕𝐖𝐗𝐘𝐙abcdefghijklmnopqrstuvwxyz'.includes(c)?'𝐀𝐁𝐂𝐃𝐄𝐅𝐆𝐇𝐈𝐉𝐊𝐋𝐌𝐍𝐎𝐏𝐐𝐑𝐒𝐓𝐔𝐕𝐖𝐗𝐘𝐙'.charAt('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.indexOf(c.toUpperCase()))||c:c).join(''),
    italic: t => [...t].map(c=>{const i='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.indexOf(c);return i>=0?'𝘈𝘉𝘊𝘋𝘌𝘍𝘎𝘏𝘐𝘑𝘒𝘓𝘔𝘕𝘖𝘗𝘘𝘙𝘚𝘛𝘜𝘝𝘞𝘟𝘠𝘡𝘢𝘣𝘤𝘥𝘦𝘧𝘨𝘩𝘪𝘫𝘬𝘭𝘮𝘯𝘰𝘱𝘲𝘳𝘴𝘵𝘶𝘷𝘸𝘹𝘺𝘻'[i]:c}).join(''),
};
module.exports = async (sock, chatId, message, args) => {
    const sub = args[0]?.toLowerCase(); const text = args.slice(1).join(' ').trim();
    if (!sub || !text) return reply(sock, chatId, '❌ Usage: .fancy <style> <text>\n\nStyles: bold, italic', message);
    const fn = styles[sub];
    if (!fn) return reply(sock, chatId, `❌ Unknown style: ${sub}\nAvailable: bold, italic`, message);
    await reply(sock, chatId, fn(text), message);
};
