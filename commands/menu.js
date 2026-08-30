/**
 * VOYAGE XD — Cypher-Style Menu
 * Categories match Voyage XD C's actual commands
 */
const os = require('os');
const settings = require('../settings');
const { reply, getSender } = require('./_helper');

function ramBar() {
    const total = os.totalmem(), free = os.freemem();
    const pct = Math.round(((total - free) / total) * 100);
    const filled = Math.round(pct / 10);
    return { bar: '█'.repeat(filled) + '░'.repeat(10 - filled), pct };
}
function formatUptime(ms) {
    const s = Math.floor(ms / 1000), d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600), mn = Math.floor((s % 3600) / 60), sc = s % 60;
    if (d > 0) return `${d}d ${h}h ${mn}m`;
    if (h > 0) return `${h}h ${mn}m ${sc}s`;
    return `${mn}m ${sc}s`;
}

const MENU_CATEGORIES = [
    {
        icon: '⚡', name: 'GENERAL',
        cmds: ['help','menu','ping','alive','uptime','runtime','owner','repo','pair',
               'session','deviceinfo','disk','botstatus','time','today','age',
               'id','getpp','getabout','whoami','setbotname','setprefix','version',
               'qr','weather','wiki','news','define','define2','urban','country',
               'github','currency','remind','encode','decode','reverse','upper','lower',
               'calc','translate','translate2','tinyurl','ssweb','browse','say',
               'fancy','fliptext','texttopdf','genpass','password','myip','tempmail']
    },
    {
        icon: '📥', name: 'DOWNLOADS',
        cmds: ['song','song2','play','play2','ytmp3','ytmp4','ytv','yta',
               'video','tiktok','tiktokaudio','tiktok2','instagram','twitter',
               'facebook','fb','fbvideo','spotify','spotifydl',
               'pinterest','mediafire','terabox','apk','gitclone',
               'savestatus','image','pin','snackvideo']
    },
    {
        icon: '👥', name: 'GROUP',
        cmds: ['kick','kickall','kickinactive','promote','demote','add','ban','unban',
               'mute','unmute','lock','unlock','warn','warnings','clearwarn','listwarn',
               'setwarn','resetwarn','del','tagall','hidetag','tagadmin','groupinfo',
               'admins','totalmembers','listmembers','listadmins','resetlink','invite',
               'setwelcome','setgoodbye','welcome','goodbye','antilink','antispam',
               'poll','topmembers','groupid','open','close','link']
    },
    {
        icon: '🤖', name: 'AI & CHAT',
        cmds: ['ai','deepseek','chatbot','tts','ocr']
    },
    {
        icon: '🎵', name: 'AUDIO FX',
        cmds: ['tomp3','toaudio','tovideo','bass','robot','earrape','deep','voiceai',
               'blown','toptt','volaudio','volvideo','reverse']
    },
    {
        icon: '🖼️', name: 'MEDIA TOOLS',
        cmds: ['sticker','steal','toimg','tourl','toviewonce','tostatus',
               'vv','vv2','remini','removebg','wallpaper','profile','getdp',
               'emojimix','stickermeme']
    },
    {
        icon: '🎮', name: 'FUN & GAMES',
        cmds: ['joke','dadjoke','funfact','fact','quote','motivate','advice',
               '8ball','flip','dice','choose','roast','insult','compliment',
               'compliment2','ship','love','rate','rizz','pickup','truth','dare',
               'truthordare','zodiac','horoscope','tictactoe','trivia','memes',
               'wouldyourather','confession','hack','cashapp','slot','rps',
               'mathquiz','xxqc','animereact','animeimg','animesearch']
    },
    {
        icon: '🔍', name: 'SEARCH',
        cmds: ['google','gsearch','yts','shazam','imdb','lyrics','tenor',
               'spotifysearch','pixabay','tiktoksearch']
    },
    {
        icon: '✨', name: 'TEXT EFFECTS',
        cmds: ['styletext','aesthetic','bold','italic','fliptext']
    },
    {
        icon: '📿', name: 'RELIGION',
        cmds: ['bible','quran']
    },
    {
        icon: '🔧', name: 'OWNER / SETTINGS',
        cmds: ['mode','public','private','anticall','antidelete','antiviewonce',
               'autoreact','autoread','autosavestatus','alwaysonline','lastseen',
               'readreceipts','freezelastseen','setpp','setbio','setname',
               'react','online','restart','tostatus','toviewonce','join','leave',
               'block','unblock','unblockall','dm','groupid','afk']
    },
];

module.exports = async (sock, chatId, message) => {
    const { bar, pct } = ramBar();
    const uptime = formatUptime(Date.now() - (global.botStartTime || Date.now()));
    const totalCmds = MENU_CATEGORIES.reduce((a, c) => a + c.cmds.length, 0);
    const prefix = settings.prefix;

    let out = `*┏━━━━━━━━━━━━━━━━━━━┓*\n`;
    out += `┃ ♤ *BOTNAME*: ${settings.botName}\n`;
    out += `┃ ♤ *DEV*: Voyage XD\n`;
    out += `┃ ♤ *PREFIX*: [ ${prefix} ]\n`;
    out += `┃ ♤ *VERSION*: v${settings.version}\n`;
    out += `┃ ♤ *UPTIME*: ${uptime}\n`;
    out += `┃ ♤ *COMMANDS*: ${totalCmds}+\n`;
    out += `┃ ♤ *CHIP*: [${bar}] ${pct}%\n`;
    out += `┃ ♤ *NODE*: ${process.version}\n`;
    out += `*┗━━━━━━━━━━━━━━━━━━━┛*\n`;

    for (const cat of MENU_CATEGORIES) {
        out += `\n┏❒ ${cat.icon} *${cat.name} MENU* ❒\n`;
        for (const cmd of cat.cmds) {
            out += `┃✰ ${cmd}\n`;
        }
        out += `┗❒\n`;
    }
    out += `\n©Copyright Voyage XD — VOYAGE XD v4.0\n_VOYAGE XD© — Always On, Always Ready_`;

    try {
        await sock.sendMessage(chatId, {
            image: { url: settings.BOT_IMG },
            caption: out
        }, { quoted: message });
    } catch {
        await sock.sendMessage(chatId, { text: out }, { quoted: message });
    }
};
