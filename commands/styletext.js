/**
 * Stylize text in different fonts/styles
 * Usage: .styletext <text>  /  .glitch <text>  /  .bubble <text>  /  .bold <text>  /  .italic <text>
 */
const { reply } = require('./_helper');

const maps = {
    bold:    Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'),
    boldOut: Array.from('𝐀𝐁𝐂𝐃𝐄𝐅𝐆𝐇𝐈𝐉𝐊𝐋𝐌𝐍𝐎𝐏𝐐𝐑𝐒𝐓𝐔𝐕𝐖𝐗𝐘𝐙𝐚𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢𝐣𝐤𝐥𝐦𝐧𝐨𝐩𝐪𝐫𝐬𝐭𝐮𝐯𝐰𝐱𝐲𝐳𝟎𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗'),
    italic:  Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'),
    italOut: Array.from('𝘈𝘉𝘊𝘋𝘌𝘍𝘎𝘏𝘐𝘑𝘒𝘓𝘔𝘕𝘖𝘗𝘘𝘙𝘚𝘛𝘜𝘝𝘞𝘟𝘠𝘡𝘢𝘣𝘤𝘥𝘦𝘧𝘨𝘩𝘪𝘫𝘬𝘭𝘮𝘯𝘰𝘱𝘲𝘳𝘴𝘵𝘶𝘷𝘸𝘹𝘺𝘻'),
    script:  Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'),
    scrOut:  Array.from('𝒜ℬ𝒞𝒟ℰℱ𝒢ℋℐ𝒥𝒦ℒℳ𝒩𝒪𝒫𝒬ℛ𝒮𝒯𝒰𝒱𝒲𝒳𝒴𝒵𝒶𝒷𝒸𝒹ℯ𝒻ℊ𝒽𝒾𝒿𝓀𝓁𝓂𝓃ℴ𝓅𝓆𝓇𝓈𝓉𝓊𝓋𝓌𝓍𝓎𝓏'),
    bubble:  Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'),
    bubOut:  Array.from('ⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩ⓪①②③④⑤⑥⑦⑧⑨'),
};

function transform(text, fromArr, toArr) {
    return text.split('').map(c => {
        const i = fromArr.indexOf(c);
        return i >= 0 ? toArr[i] : c;
    }).join('');
}

function glitch(text) {
    const diacritics = ['̴','̷','̸','̶','̨','̧','͜','̣','̦','̥'];
    return text.split('').map(c => {
        if (c === ' ') return c;
        const count = Math.floor(Math.random() * 3) + 1;
        let r = c;
        for (let i = 0; i < count; i++) r += diacritics[Math.floor(Math.random() * diacritics.length)];
        return r;
    }).join('');
}

function vaporwave(text) {
    return text.split('').map(c => {
        const code = c.charCodeAt(0);
        if (code >= 0x21 && code <= 0x7E) return String.fromCharCode(code + 0xFEE0);
        return c === ' ' ? '　' : c;
    }).join('');
}

module.exports = async (sock, chatId, message, args, style) => {
    const text = args.join(' ').trim();
    if (!text) return reply(sock, chatId, `❌ Usage: .${style} <text>`, message);

    let out;
    switch (style) {
        case 'bold':       out = transform(text, maps.bold, maps.boldOut); break;
        case 'italic':     out = transform(text, maps.italic, maps.italOut); break;
        case 'script':     out = transform(text, maps.script, maps.scrOut); break;
        case 'bubble':     out = transform(text, maps.bubble, maps.bubOut); break;
        case 'glitch':     out = glitch(text); break;
        case 'vaporwave':  out = vaporwave(text); break;
        default:           out = text;
    }

    await sock.sendMessage(chatId, {
        text: `✨ *${style.charAt(0).toUpperCase() + style.slice(1)} Text:*\n\n${out}\n\n_VOYAGE XD©_`,
    }, { quoted: message });
};
