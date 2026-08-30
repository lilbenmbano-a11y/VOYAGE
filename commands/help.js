const settings = require('../settings');
module.exports = async (sock, chatId, message) => {
    const menu = `
╔══════════════════════════════╗
║    ║    🤖  𝐕𝐎𝐘𝐀𝐆𝐄 𝐗𝐃  ⚡           ║
║
║      Always On, Always Ready ║
║  v${settings.version} | 370+ Commands   ║
╚══════════════════════════════╝

⚡ ─── 𝐆𝐄𝐍𝐄𝐑𝐀𝐋 ─── ⚡
♦ help / menu / ping / alive
♦ uptime / runtime / owner / repo
♦ pair / session / deviceinfo / disk
♦ botstatus / getpp / getbio

🎵 ─── 𝐌𝐄𝐃𝐈𝐀 ─── 🎵
♦ sticker / steal / toimg / tourl
♦ toviewonce / tostatus / vv / vv2
♦ savestatus / remini / wallpaper
♦ profile / getdp

🛠️ ─── 𝐓𝐎𝐎𝐋𝐒 ─── 🛠️
♦ weather / wiki / news / imdb
♦ tr / translate / translate2
♦ calc / define / define2 / urban
♦ qr / country / github / currency
♦ remind / time / today / age
♦ encode / decode / reverse
♦ upper / lower / password / genpass
♦ fancy / fliptext / aesthetic
♦ tinyurl / ssweb / texttopdf
♦ say / browse / getabout / tourl
♦ ocr / removebg / myip
♦ tempmail / speedtest
♦ stickersearch / stickermeme
♦ backup / groupbackup

🔍 ─── 𝐒𝐄𝐀𝐑𝐂𝐇 ─── 🔍
♦ google / gsearch
♦ pinterest / pixabay
♦ spotify / spotifysearch
♦ tenor / gif
♦ shazam / yts

📥 ─── 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃 ─── 📥
♦ ytmp3 / yta / ytmp4 / ytv
♦ tiktok / tiktokaudio
♦ instagram / twitter / facebook
♦ song / song2 / video / image
♦ spotifydl / spdl
♦ mediafire / mf
♦ terabox / snackvideo
♦ apk / gitclone / pin

🎵 ─── 𝐀𝐔𝐃𝐈𝐎 𝐅𝐗 ─── 🎵
♦ tomp3 / toaudio / tovideo
♦ bass / robot / earrape
♦ deep / blown / toptt
♦ volaudio / volvideo

✍️ ─── 𝐓𝐄𝐗𝐓 𝐄𝐅𝐅𝐄𝐂𝐓𝐒 ─── ✍️
♦ bold / italic / script
♦ bubbletext / glitch / vaporwave / aesthetic2

🎮 ─── 𝐅𝐔𝐍 & 𝐆𝐀𝐌𝐄𝐒 ─── 🎮
♦ joke / dadjoke / funfact / fact
♦ quote / motivate / advice
♦ 8ball / flip / dice / choose
♦ roast / insult / compliment / compliment2
♦ ship / love / rate / rizz
♦ truth / dare / truthordare
♦ zodiac / horoscope
♦ tictactoe / poll / trivia / memes
♦ wouldyourather / xxqc
♦ pickup / confession / hack / whoami
♦ slot / rps / rockpaperscissors
♦ mathquiz / mathgame
♦ cashapp

🖼️ ─── 𝐑𝐀𝐍𝐃𝐎𝐌 𝐈𝐌𝐀𝐆𝐄𝐒 ─── 🖼️
♦ randomboy / randomgirl
♦ cat / dog / nature / car / food

🌸 ─── 𝐀𝐍𝐈𝐌𝐄 𝐈𝐌𝐀𝐆𝐄𝐒 ─── 🌸
♦ neko / waifu / kitsune / husbando
♦ shinobu / megumin / emilia / elaina
♦ naruto / sasuke / itachi / hinata / kakashi
♦ nezuko / miku / boruto / erza / mikasa
♦ madara / pokemon / onepiece
♦ akira / akiyama / bts / kpop / exo
♦ hacker / art / space / mountain
♦ cartoon / hijab / cyber / fox
♦ gifs / amv / randomnime
♦ + all .anime<name> aliases

💫 ─── 𝐀𝐍𝐈𝐌𝐄 𝐑𝐄𝐀𝐂𝐓𝐈𝐎𝐍𝐒 ─── 💫
♦ hug / kiss / pat / cuddle
♦ slap / bonk / punch / bite
♦ poke / lick / tickle / feed
♦ dance / cry / wave / wink
♦ blush / smile / happy / smug
♦ handhold / highfive / kill
♦ yeet / nom / nod / nope / bully
♦ spank / glomp / awoo / cringe
♦ + all .anime<reaction> aliases

🍥 ─── 𝐀𝐍𝐈𝐌𝐄 & 𝐌𝐀𝐍𝐆𝐀 ─── 🍥
♦ anime / animeinfo / animelatest
♦ animequote / manga
♦ genshin / tiktokstalk

💬 ─── 𝐂𝐇𝐀𝐓 & 𝐐𝐔𝐎𝐓𝐄𝐒 ─── 💬
♦ anonymouschat / anonstart
♦ anonstop / anonnext
♦ shortquote / lifefact / funfacthidup
♦ quoteshacker / xquote

👥 ─── 𝐆𝐑𝐎𝐔𝐏 𝐀𝐃𝐌𝐈𝐍 ─── 👥
♦ kick / kickall / kickinactive
♦ promote / demote / mute / unmute
♦ lock / unlock / open / close
♦ warn / warnings / clearwarn / listwarn
♦ del / tagall / tag / tagadmin / hidetag
♦ antilink / antibadword / antispam
♦ antilinkall / antilinktiktok
♦ antilinkig / antilinkfacebook
♦ antilinktwitter / antilinktelegram
♦ antilinkytvid / antilinkytch
♦ antibot / antitoxic / antinsfw
♦ antitagsw / antipromosi / antivirus
♦ autosticker / autostickergc
♦ welcome / goodbye / setwelcome / setgoodbye
♦ groupinfo / admins / topmembers
♦ setname / setdesc / groupid / grouplist
♦ getlink / resetlink / link / invite
♦ add / vcf / pin / announce / chatbot
♦ backup / groupbackup

👑 ─── 𝐎𝐖𝐍𝐄𝐑 𝐎𝐍𝐋𝐘 ─── 👑
♦ mode / restart / myip / serverip
♦ ban / unban / bc / broadcast
♦ autoreply / alwaysonline
♦ join / leave / block / unblock / unblockall
♦ setbio / setprofilepic
♦ setbotname / setprefix / setwarn
♦ react / online / dm / tostatus
♦ autosavestatus / antiviewonce
♦ autoreact / autoread / anticall / antidelete
♦ lastseen / freezelastseen / readreceipts
♦ afk / disk

🤖 ─── 𝐀𝐈 ─── 🤖
♦ ai / ask / gpt / deepseek
♦ teach / translate2

📖 ─── 𝐑𝐄𝐋𝐈𝐆𝐈𝐎𝐍 ─── 📖
♦ bible / quran / alquran / alkitab

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 _VOYAGE XD — Weaving Your Experience_ ⚡
`;
    await sock.sendMessage(chatId, { text: menu }, { quoted: message });
};
