/**
 * VOYAGE XD v4.1.0 — Main Message Handler
 * ✅ Uses sock._ownerPhone for per-user owner check
 * ✅ Private mode blocks both DMs and groups
 * ✅ voyage_xd© signature
 * ✅ All commands properly imported and registered
 */
const fs      = require('fs');
const path    = require('path');
const settings = require('./settings');
const { isBanned }    = require('./lib/isBanned');
const { getSender }   = require('./lib/getSender');
const { makeIsOwner } = require('./lib/isOwner');
const { getMode }     = require('./commands/mode');

// Temp cleanup
const tempDir = path.join(process.cwd(), 'temp');
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
process.env.TMPDIR = tempDir; process.env.TEMP = tempDir; process.env.TMP = tempDir;

// ── All command imports ───────────────────────────────────────────────────
const helpCmd        = require('./commands/help');
const menuCmd        = require('./commands/menu');
const pingCmd        = require('./commands/ping');
const aliveCmd       = require('./commands/alive');
const uptimeCmd      = require('./commands/uptime');
const runtimeCmd     = require('./commands/runtime');
const ownerCmd       = require('./commands/owner');
const pairCmd        = require('./commands/pair');
const stickerCmd     = require('./commands/sticker');
const stealCmd       = require('./commands/steal');
const toimgCmd       = require('./commands/toimg');
const playCmd        = require('./commands/play');
const lyricsCmd      = require('./commands/lyrics');
const ttsCmd         = require('./commands/tts');
const vvCmd          = require('./commands/vv');
const getDpCmd       = require('./commands/getdp');
const saveStatusCmd  = require('./commands/savestatus');
const weatherCmd     = require('./commands/weather');
const wikiCmd        = require('./commands/wiki');
const newsCmd        = require('./commands/news');
const trCmd          = require('./commands/translate');
const calcCmd        = require('./commands/calc');
const defineCmd      = require('./commands/define');
const urbanCmd       = require('./commands/urban');
const qrCmd          = require('./commands/qr');
const countryCmd     = require('./commands/country');
const githubCmd      = require('./commands/github');
const currencyCmd    = require('./commands/currency');
const remindCmd      = require('./commands/remind');
const timeCmd        = require('./commands/time');
const encodeCmd      = require('./commands/encode');
const decodeCmd      = require('./commands/decode');
const reverseCmd     = require('./commands/reverse');
const upperCmd       = require('./commands/upper');
const lowerCmd       = require('./commands/lower');
const passwordCmd    = require('./commands/password');
const todayCmd       = require('./commands/today');
const jokeCmd        = require('./commands/joke');
const dadjokCmd      = require('./commands/dadjoke');
const factCmd        = require('./commands/fact');
const quoteCmd       = require('./commands/quote');
const motivateCmd    = require('./commands/motivate');
const eightballCmd   = require('./commands/eightball');
const flipCmd        = require('./commands/flip');
const diceCmd        = require('./commands/dice');
const chooseCmd      = require('./commands/choose');
const roastCmd       = require('./commands/roast');
const shipCmd        = require('./commands/ship');
const loveCmd        = require('./commands/love');
const complimentCmd  = require('./commands/compliment');
const insultCmd      = require('./commands/insult');
const truthCmd       = require('./commands/truth');
const dareCmd        = require('./commands/dare');
const rateCmd        = require('./commands/rate');
const zodiacCmd      = require('./commands/zodiac');
const horoscopeCmd   = require('./commands/horoscope');
const pollCmd        = require('./commands/poll');
const tttCmd         = require('./commands/tictactoe');
const ageCmd         = require('./commands/age');
const emojimixCmd    = require('./commands/emojimix');
const notesCmd       = require('./commands/notes');
const { afkCommand, checkAfk, clearAfk } = require('./commands/afk');
const deviceCmd      = require('./commands/deviceinfo');
const profileCmd     = require('./commands/profile');
const countCmd       = require('./commands/count');
const kickCmd        = require('./commands/kick');
const kickallCmd     = require('./commands/kickall');
const promoteCmd     = require('./commands/promote');
const demoteCmd      = require('./commands/demote');
const muteCmd        = require('./commands/mute');
const unmuteCmd      = require('./commands/unmute');
const lockCmd        = require('./commands/lock');
const unlockCmd      = require('./commands/unlock');
const warnCmd        = require('./commands/warn');
const warningsCmd    = require('./commands/warnings');
const clearwarnCmd   = require('./commands/clearwarn');
const delCmd         = require('./commands/del');
const tagallCmd      = require('./commands/tagall');
const hidetagCmd     = require('./commands/hidetag');
const groupinfoCmd   = require('./commands/groupinfo');
const adminsCmd      = require('./commands/admins');
const { topMembersCmd, inc } = require('./commands/topmembers');
const setnameCmd     = require('./commands/setname');
const setdescCmd     = require('./commands/setdesc');
const getlinkCmd     = require('./commands/getlink');
const resetlinkCmd   = require('./commands/resetlink');
const announceCmd    = require('./commands/announce');
const { antilinkCommand, handleLink }       = require('./commands/antilink');
const { antibadwordCommand, handleBadword } = require('./commands/antibadword');
const { antispamCommand, handleSpam }       = require('./commands/antispam');
const { welcomeCommand, handleJoin }        = require('./commands/welcome');
const { goodbyeCommand, handleLeave }       = require('./commands/goodbye');
const { chatbotCommand, handleChatbot }     = require('./commands/chatbot');
const { modeCommand }                       = require('./commands/mode');
const banCmd         = require('./commands/ban');
const unbanCmd       = require('./commands/unban');
const { bcCommand, addUser }               = require('./commands/bc');
const { autoReplyCommand, handleAutoReply } = require('./commands/autoreply');
const { alwaysOnlineCommand, initAlwaysOnline } = require('./commands/alwaysonline');
const grouplistCmd   = require('./commands/grouplist');
const aiCmd          = require('./commands/ai');

// ── NEW COMMANDS (Part 3) ─────────────────────────────────────────────────────
const { animeReact, ACTIONS: REACT_ACTIONS } = require('./commands/animereact');
const { animeImg,   IMG_CMDS }               = require('./commands/animeimg');
const slotCmd          = require('./commands/slot');
const googleCmd        = require('./commands/googlesearch');
const pinterestNewCmd  = require('./commands/pinterest');
const spotifyCmd       = require('./commands/spotifysearch');
const ytmp3Cmd         = require('./commands/ytmp3');
const ytmp4Cmd         = require('./commands/ytmp4');

// ── NEW COMMANDS (Part 4 — Full Port) ────────────────────────────────────────
const removebgCmd       = require('./commands/removebg');
const ocrCmd            = require('./commands/ocr');
const mediafireCmd      = require('./commands/mediafire');
const teraboxCmd        = require('./commands/terabox');
const spotifydlCmd      = require('./commands/spotifydl');
const tiktokstalkcmd    = require('./commands/tiktokstalk');
const rpsCmd            = require('./commands/rps');
const myipCmd           = require('./commands/myip');
const tempmailCmd       = require('./commands/tempmail');
const animequoteCmd     = require('./commands/quotesanime');
const { animeSearch, animeInfo, animeLatest } = require('./commands/animesearch');
const mangaCmd          = require('./commands/mangasearch');
const pixabayCmd        = require('./commands/pixabay');
const tenorCmd          = require('./commands/tenor');
const stickermemeCmd    = require('./commands/stickermeme');
const snackvideoCmd     = require('./commands/snackvideo');
const genshinCmd        = require('./commands/genshinstalk');
const styletextCmd      = require('./commands/styletext');
const { sendUnsplash, sendWaifuPics, sendRandomPerson, sendCatOrDog } = require('./commands/randomimage');

// ── ROUND 2 — Remaining Commands ─────────────────────────────────────────────
const { handleAntilinkPlus, checkAntilinkPlus, PLATFORMS: AL_PLATFORMS } = require('./commands/antilinkplus');
const { getpp, getbio }              = require('./commands/getprofile');
const { autostickerCommand, handleAutoSticker } = require('./commands/autosticker');
const { quranCmd, alkitabCmd }       = require('./commands/quran');
const mathquizCmd                    = require('./commands/mathquiz');
const anonymouschatCmd               = require('./commands/anonymouschat');
const { speedtestCmd, stickersearchCmd, shortquoteCmd, lifefactCmd, hackerquoteCmd, backupCmd } = require('./commands/extratools');

// ── NEW COMMANDS ──────────────────────────────────────────────────────────
// AI
const deepseekCmd    = require('./commands/deepseek');
const teachCmd       = require('./commands/teach');
const translate2Cmd  = require('./commands/translate2');
// AUDIO
const tomp3Cmd       = require('./commands/tomp3');
const toaudioCmd     = require('./commands/toaudio');
const tovideoCmd     = require('./commands/tovideo');
const bassCmd        = require('./commands/bass');
const robotCmd       = require('./commands/robot');
const earrapeCmd     = require('./commands/earrape');
const deepAudioCmd   = require('./commands/deep');
const blownCmd       = require('./commands/blown');
const topttCmd       = require('./commands/toptt');
const volaudioCmd    = require('./commands/volaudio');
const volvideoCmd    = require('./commands/volvideo');
// DOWNLOAD
const tiktokCmd      = require('./commands/tiktok');
const tiktokaudioCmd = require('./commands/tiktokaudio');
const instagramCmd   = require('./commands/instagram');
const twitterCmd     = require('./commands/twitter');
const facebookCmd    = require('./commands/facebook');
const songCmd        = require('./commands/song');
const song2Cmd       = require('./commands/song2');
const videoCmd       = require('./commands/video');
const imageCmd       = require('./commands/image');
const pinCmd         = require('./commands/pin');
const apkCmd         = require('./commands/apk');
const gitcloneCmd    = require('./commands/gitclone');
// FUN
const memesCmd       = require('./commands/memes');
const triviaCmd      = require('./commands/trivia');
const truthdetCmd    = require('./commands/truthdetector');
const xxqcCmd        = require('./commands/xxqc');
const todCmd         = require('./commands/truthordare');
// GROUP
const addCmd         = require('./commands/add');
const totalmembersCmd= require('./commands/totalmembers');
const useridCmd      = require('./commands/userid');
const tagCmd         = require('./commands/tag');
const tagadminCmd    = require('./commands/tagadmin');
const inviteCmd      = require('./commands/invite');
const openCmd        = require('./commands/open');
const closeCmd       = require('./commands/close');
const linkCmd        = require('./commands/link');
const kickinactiveCmd= require('./commands/kickinactive');
const vcfCmd         = require('./commands/vcf');
// OWNER
const joinCmd        = require('./commands/join');
const leaveCmd       = require('./commands/leave');
const blockCmd       = require('./commands/block');
const unblockCmd     = require('./commands/unblock');
const setbioCmd      = require('./commands/setbio');
const setppCmd       = require('./commands/setprofilepic');
const reactCmd       = require('./commands/react');
const onlineCmd      = require('./commands/online');
const restartCmd     = require('./commands/restart');
const tostatusCmd    = require('./commands/tostatus');
const toviewonceCmd  = require('./commands/toviewonce');
const vv2Cmd         = require('./commands/vv2');
const groupidCmd     = require('./commands/groupid');
const diskCmd        = require('./commands/disk');
const autosaveCmd    = require('./commands/autosavestatus');
const lastseenCmd    = require('./commands/lastseen');
const readreceiptsCmd= require('./commands/readreceipts');
const unblockallCmd  = require('./commands/unblockall');
const freezelsCmd    = require('./commands/freezelastseen');
// RELIGION (imported earlier)
// SEARCH
const imdbCmd        = require('./commands/imdb');
const shazamCmd      = require('./commands/shazam');
const ytsCmd         = require('./commands/yts');
const define2Cmd     = require('./commands/define2');
// SETTINGS
const anticallCmd    = require('./commands/anticall');
const antideleteCmd  = require('./commands/antidelete');
const antivoCmd      = require('./commands/antiviewonce');
const autoreactCmd   = require('./commands/autoreact');
const autoreadCmd    = require('./commands/autoread');
const setbotnameCmd  = require('./commands/setbotname');
const setprefixCmd   = require('./commands/setprefix');
const setwelcomeCmd  = require('./commands/setwelcome');
const setgoodbyeCmd  = require('./commands/setgoodbye');
const listwarnCmd    = require('./commands/listwarn');
const setwarnCmd     = require('./commands/setwarn');
const resetwarnCmd   = require('./commands/resetwarn');
// TOOLS
const sayCmd         = require('./commands/say');
const fancyCmd       = require('./commands/fancy');
const fliptextCmd    = require('./commands/fliptext');
const tinyurlCmd     = require('./commands/tinyurl');
const sswebCmd       = require('./commands/ssweb');
const getaboutCmd    = require('./commands/getabout');
const browseCmd      = require('./commands/browse');
const texttopdfCmd   = require('./commands/texttopdf');
const genpassCmd     = require('./commands/genpass');
const tourlCmd       = require('./commands/tourl');
// OTHER
const botstatusCmd   = require('./commands/botstatus');
const ping2Cmd       = require('./commands/ping2');
const repoCmd        = require('./commands/repo');
const wallpaperCmd   = require('./commands/wallpaper');
const reminiCmd      = require('./commands/remini');
const dmCmd          = require('./commands/dm');
// ── NEW VOYAGE_XD COMMANDS ──────────────────────────────────────────────────
const rizzCmd        = require('./commands/rizz');
const pickupCmd      = require('./commands/pickup');
const confessionCmd  = require('./commands/confession');
const adviceCmd      = require('./commands/advice');
const hackCmd        = require('./commands/hack');
const wyrCmd         = require('./commands/wouldyourather');
const funfactCmd     = require('./commands/funfact');
const whoamiCmd      = require('./commands/whoami');
const aestheticCmd   = require('./commands/aesthetic');
const compliment2Cmd = require('./commands/compliment2');
const cashappCmd     = require('./commands/cashapp');
// ── VOYAGE XD NEW COMMANDS ─────────────────────────────────────────────────
const apiDlCmd       = require('./commands/apidownload');
const extrasCmd      = require('./commands/extras');

// Expose initAlwaysOnline globally
if (!global.initAlwaysOnline) global.initAlwaysOnline = initAlwaysOnline;

async function handleMessages(sock, update) {
    try {
        const { messages, type } = update;
        if (type !== 'notify') return;
        const message = messages[0];
        if (!message?.message) return;
        if (Object.keys(message.message)[0]==='ephemeralMessage')
            message.message = message.message.ephemeralMessage.message;

        const chatId    = message.key.remoteJid;
        const isGroup   = chatId?.endsWith('@g.us');
        const senderId  = getSender(sock, message);

        if (!chatId || !senderId) return;
        if (chatId === 'status@broadcast') return;
        if (isBanned(senderId)) return;

        // ✅ Per-user owner check using sock._ownerPhone
        const isOwnerFn = makeIsOwner(sock._ownerPhone || '');

        // ✅ Private mode blocks BOTH groups and DMs
        if (getMode().mode === "private" && !message.key.fromMe && !await isOwnerFn(senderId, sock, chatId)) return;

        // ── rawText declared early so group handlers can use it ──────────
        const rawText =
            message.message?.conversation ||
            message.message?.extendedTextMessage?.text ||
            message.message?.imageMessage?.caption ||
            message.message?.videoMessage?.caption || '';

        if (!isGroup) { addUser(senderId); await handleAutoReply(sock, message); }

        // AFK check
        try {
            const afk = checkAfk(senderId);
            if (afk) {
                clearAfk(senderId);
                const mins = Math.round((Date.now()-afk.time)/60000);
                await sock.sendMessage(chatId,{text:`👋 Welcome back @${senderId.split('@')[0]}!\nYou were AFK for ${mins} min.\n\n_voyage_xd©_`,mentions:[senderId]});
            }
        } catch {}

        if (isGroup) {
            inc(chatId, senderId);
            await handleLink(sock, chatId, message);
            await handleBadword(sock, chatId, message);
            await handleSpam(sock, chatId, message, senderId);
            await checkAntilinkPlus(sock, chatId, message, rawText || '');
            await handleAutoSticker(sock, chatId, message);
        }

        // ── Auto Anti-ViewOnce: detect & forward to sender's DM ──────────
        try {
            const avoData = (() => { try { return JSON.parse(require('fs').readFileSync('./data/antiviewonce.json','utf8')); } catch { return {enabled:false}; } })();
            if (avoData.enabled) {
                const msgContent = message.message;
                const voMsg =
                    msgContent?.viewOnceMessage?.message ||
                    msgContent?.viewOnceMessageV2?.message ||
                    msgContent?.viewOnceMessageV2Extension?.message;
                if (voMsg) {
                    const { downloadContentFromMessage } = require('@crysnovax/baileys');
                    const imgMsg = voMsg?.imageMessage;
                    const vidMsg = voMsg?.videoMessage;
                    if (imgMsg || vidMsg) {
                        const type = imgMsg ? 'image' : 'video';
                        const stream = await downloadContentFromMessage(imgMsg || vidMsg, type);
                        const chunks = [];
                        for await (const c of stream) chunks.push(c);
                        const buf = Buffer.concat(chunks);
                        const from = senderId.split('@')[0];
                        const cap = `👁️ *Auto-Saved View Once*\n📩 From: @${from}\n\n_VOYAGE XD©_`;
                        const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
                        if (type === 'image') await sock.sendMessage(botJid, { image: buf, caption: cap });
                        else await sock.sendMessage(botJid, { video: buf, caption: cap });
                    }
                }
            }
        } catch {}

        const prefix = settings.prefix || '.';
        if (!rawText.trim().startsWith(prefix)) {
            if (rawText) await handleChatbot(sock, chatId, message, rawText);
            await mathquizCmd.checkAnswer(sock, chatId, message, rawText);
            await anonymouschatCmd.relay(sock, chatId, message, rawText);
            return;
        }

        const [cmd] = rawText.trim().slice(prefix.length).toLowerCase().split(/\s+/);
        const args  = rawText.trim().slice(prefix.length).split(/\s+/).slice(1);

        switch (cmd) {
            case 'help': case 'menu':          await helpCmd(sock,chatId,message); break;
            case 'ping':                       await pingCmd(sock,chatId,message); break;
            case 'alive':                      await aliveCmd(sock,chatId,message); break;
            case 'uptime':                     await uptimeCmd(sock,chatId,message); break;
            case 'runtime': case 'runtime2':   await runtimeCmd(sock,chatId,message); break;
            case 'owner':                      await ownerCmd(sock,chatId,message); break;
            case 'pair':                       await pairCmd(sock,chatId,message,args); break;
            case 'deviceinfo': case 'sysinfo': await deviceCmd(sock,chatId,message); break;
            case 'sticker': case 's':          await stickerCmd(sock,chatId,message); break;
            case 'steal':                      await stealCmd(sock,chatId,message,args); break;
            case 'toimg':                      await toimgCmd(sock,chatId,message); break;
            case 'play':                       await playCmd(sock,chatId,message,args); break;
            case 'lyrics': case 'lyric':       await lyricsCmd(sock,chatId,message,args); break;
            case 'tts':                        await ttsCmd(sock,chatId,message,args); break;
            case 'vv': case 'viewonce':        await vvCmd(sock,chatId,message); break;
            case 'getdp': case 'dp':           await getDpCmd(sock,chatId,message); break;
            case 'savestatus':                 await saveStatusCmd(sock,chatId,message); break;
            case 'weather':                    await weatherCmd(sock,chatId,message,args); break;
            case 'wiki': case 'wikipedia':     await wikiCmd(sock,chatId,message,args); break;
            case 'news':                       await newsCmd(sock,chatId,message,args); break;
            case 'tr': case 'translate':       await trCmd(sock,chatId,message,args); break;
            case 'calc': case 'math':          await calcCmd(sock,chatId,message,args); break;
            case 'define': case 'dict':        await defineCmd(sock,chatId,message,args); break;
            case 'urban':                      await urbanCmd(sock,chatId,message,args); break;
            case 'qr': case 'qrcode':          await qrCmd(sock,chatId,message,args); break;
            case 'country':                    await countryCmd(sock,chatId,message,args); break;
            case 'github': case 'gh':          await githubCmd(sock,chatId,message,args); break;
            case 'currency': case 'convert':   await currencyCmd(sock,chatId,message,args); break;
            case 'remind':                     await remindCmd(sock,chatId,message,args); break;
            case 'time':                       await timeCmd(sock,chatId,message,args); break;
            case 'encode':                     await encodeCmd(sock,chatId,message,args); break;
            case 'decode':                     await decodeCmd(sock,chatId,message,args); break;
            case 'reverse':                    await reverseCmd(sock,chatId,message,args); break;
            case 'upper': case 'uppercase':    await upperCmd(sock,chatId,message,args); break;
            case 'lower': case 'lowercase':    await lowerCmd(sock,chatId,message,args); break;
            case 'password': case 'pass':      await passwordCmd(sock,chatId,message,args); break;
            case 'today':                      await todayCmd(sock,chatId,message); break;
            case 'age':                        await ageCmd(sock,chatId,message,args); break;
            case 'count':                      await countCmd(sock,chatId,message,args); break;
            case 'emojimix':                   await emojimixCmd(sock,chatId,message,args); break;
            case 'notes':                      await notesCmd(sock,chatId,message,args); break;
            case 'afk':                        await afkCommand(sock,chatId,message,args); break;
            case 'profile': case 'pp':         await profileCmd(sock,chatId,message); break;
            case 'joke': case 'jokes':         await jokeCmd(sock,chatId,message); break;
            case 'dadjoke':                    await dadjokCmd(sock,chatId,message); break;
            case 'fact':                       await factCmd(sock,chatId,message); break;
            case 'quote':                      await quoteCmd(sock,chatId,message); break;
            case 'motivate': case 'inspire':   await motivateCmd(sock,chatId,message); break;
            case '8ball':                      await eightballCmd(sock,chatId,message,args); break;
            case 'flip': case 'coin':          await flipCmd(sock,chatId,message); break;
            case 'dice': case 'roll':          await diceCmd(sock,chatId,message,args); break;
            case 'choose': case 'pick':        await chooseCmd(sock,chatId,message,args); break;
            case 'roast':                      await roastCmd(sock,chatId,message); break;
            case 'ship':                       await shipCmd(sock,chatId,message); break;
            case 'love':                       await loveCmd(sock,chatId,message,args); break;
            case 'compliment': case 'praise':  await complimentCmd(sock,chatId,message); break;
            case 'insult': case 'burn':        await insultCmd(sock,chatId,message); break;
            case 'truth':                      await truthCmd(sock,chatId,message); break;
            case 'dare':                       await dareCmd(sock,chatId,message); break;
            case 'rate':                       await rateCmd(sock,chatId,message,args); break;
            case 'zodiac':                     await zodiacCmd(sock,chatId,message,args); break;
            case 'horoscope':                  await horoscopeCmd(sock,chatId,message,args); break;
            case 'poll':                       await pollCmd(sock,chatId,message,args); break;
            case 'tictactoe': case 'ttt':      await tttCmd(sock,chatId,message,args); break;
            case 'kick': case 'remove':        await kickCmd(sock,chatId,message); break;
            case 'kickall':                    await kickallCmd(sock,chatId,message); break;
            case 'promote':                    await promoteCmd(sock,chatId,message); break;
            case 'demote':                     await demoteCmd(sock,chatId,message); break;
            case 'mute':                       await muteCmd(sock,chatId,message); break;
            case 'unmute':                     await unmuteCmd(sock,chatId,message); break;
            case 'lock':                       await lockCmd(sock,chatId,message); break;
            case 'unlock':                     await unlockCmd(sock,chatId,message); break;
            case 'warn':                       await warnCmd(sock,chatId,message); break;
            case 'warnings': case 'warnlist':  await warningsCmd(sock,chatId,message); break;
            case 'clearwarn':                  await clearwarnCmd(sock,chatId,message); break;
            case 'del': case 'delete':         await delCmd(sock,chatId,message); break;
            case 'tagall': case 'everyone':    await tagallCmd(sock,chatId,message,args); break;
            case 'hidetag': case 'ht':         await hidetagCmd(sock,chatId,message,args); break;
            case 'groupinfo': case 'ginfo':    await groupinfoCmd(sock,chatId,message); break;
            case 'admins': case 'staff':       await adminsCmd(sock,chatId,message); break;
            case 'topmembers': case 'ranking': await topMembersCmd(sock,chatId,message); break;
            case 'setname':                    await setnameCmd(sock,chatId,message,args); break;
            case 'setdesc':                    await setdescCmd(sock,chatId,message,args); break;
            case 'getlink': case 'invitelink': await getlinkCmd(sock,chatId,message); break;
            case 'resetlink': case 'revoke':   await resetlinkCmd(sock,chatId,message); break;
            case 'announce':                   await announceCmd(sock,chatId,message,args); break;
            case 'antilink':                   await antilinkCommand(sock,chatId,message,args); break;
            case 'antibadword': case 'abw':    await antibadwordCommand(sock,chatId,message,args); break;
            case 'antispam':                   await antispamCommand(sock,chatId,message,args); break;
            case 'welcome':                    await welcomeCommand(sock,chatId,message,args); break;
            case 'goodbye': case 'bye':        await goodbyeCommand(sock,chatId,message,args); break;
            case 'chatbot': case 'cb':         await chatbotCommand(sock,chatId,message,args); break;
            case 'mode':                       await modeCommand(sock,chatId,message,args); break;
            case 'ban':                        await banCmd(sock,chatId,message); break;
            case 'unban':                      await unbanCmd(sock,chatId,message); break;
            case 'bc': case 'broadcast':       await bcCommand(sock,chatId,message,args); break;
            case 'autoreply': case 'ar':       await autoReplyCommand(sock,chatId,message,args); break;
            case 'alwaysonline': case 'ao':    await alwaysOnlineCommand(sock,chatId,message,args); break;
            case 'grouplist': case 'groups':   await grouplistCmd(sock,chatId,message); break;
            case 'ai': case 'ask': case 'gpt': await aiCmd(sock,chatId,message,args); break;
            // AI
            case 'deepseek':                   await deepseekCmd(sock,chatId,message,args); break;
            case 'teach':                       await teachCmd(sock,chatId,message,args); break;
            case 'translate2':                  await translate2Cmd(sock,chatId,message,args); break;
            // AUDIO
            case 'tomp3':                       await tomp3Cmd(sock,chatId,message); break;
            case 'toaudio':                     await toaudioCmd(sock,chatId,message); break;
            case 'tovideo':                     await tovideoCmd(sock,chatId,message); break;
            case 'bass':                        await bassCmd(sock,chatId,message); break;
            case 'robot':                       await robotCmd(sock,chatId,message); break;
            case 'earrape':                     await earrapeCmd(sock,chatId,message); break;
            case 'deep':                        await deepAudioCmd(sock,chatId,message); break;
            case 'blown':                       await blownCmd(sock,chatId,message); break;
            case 'toptt':                       await topttCmd(sock,chatId,message); break;
            case 'volaudio':                    await volaudioCmd(sock,chatId,message,args); break;
            case 'volvideo':                    await volvideoCmd(sock,chatId,message,args); break;
            // DOWNLOAD
            case 'tiktok':                      await tiktokCmd(sock,chatId,message,args); break;
            case 'tiktokaudio':                 await tiktokaudioCmd(sock,chatId,message,args); break;
            case 'instagram':                   await instagramCmd(sock,chatId,message,args); break;
            case 'twitter':                     await twitterCmd(sock,chatId,message,args); break;
            case 'facebook':                    await facebookCmd(sock,chatId,message,args); break;
            case 'song':                        await songCmd(sock,chatId,message,args); break;
            case 'song2':                       await song2Cmd(sock,chatId,message,args); break;
            case 'video':                       await videoCmd(sock,chatId,message,args); break;
            case 'image':                       await imageCmd(sock,chatId,message,args); break;
            case 'pin':                         await pinCmd(sock,chatId,message,args); break;
            case 'apk':                         await apkCmd(sock,chatId,message,args); break;
            case 'gitclone':                    await gitcloneCmd(sock,chatId,message,args); break;
            // FUN
            case 'memes':                       await memesCmd(sock,chatId,message); break;
            case 'trivia':                      await triviaCmd(sock,chatId,message); break;
            case 'truthdetector':               await truthdetCmd(sock,chatId,message,args); break;
            case 'xxqc':                        await xxqcCmd(sock,chatId,message); break;
            case 'truthordare':                 await todCmd(sock,chatId,message); break;
            // GROUP
            case 'add':                         await addCmd(sock,chatId,message,args); break;
            case 'totalmembers':                await totalmembersCmd(sock,chatId,message); break;
            case 'userid':                      await useridCmd(sock,chatId,message); break;
            case 'tag':                         await tagCmd(sock,chatId,message,args); break;
            case 'tagadmin':                    await tagadminCmd(sock,chatId,message,args); break;
            case 'invite':                      await inviteCmd(sock,chatId,message); break;
            case 'open':                        await openCmd(sock,chatId,message); break;
            case 'close':                       await closeCmd(sock,chatId,message); break;
            case 'link':                        await linkCmd(sock,chatId,message); break;
            case 'kickinactive':                await kickinactiveCmd(sock,chatId,message,args); break;
            case 'vcf':                         await vcfCmd(sock,chatId,message); break;
            // OWNER
            case 'join':                        await joinCmd(sock,chatId,message,args); break;
            case 'leave':                       await leaveCmd(sock,chatId,message); break;
            case 'block':                       await blockCmd(sock,chatId,message); break;
            case 'unblock':                     await unblockCmd(sock,chatId,message); break;
            case 'setbio':                      await setbioCmd(sock,chatId,message,args); break;
            case 'setprofilepic': case 'setpp': await setppCmd(sock,chatId,message); break;
            case 'react':                       await reactCmd(sock,chatId,message,args); break;
            case 'online':                      await onlineCmd(sock,chatId,message,args); break;
            case 'restart':                     await restartCmd(sock,chatId,message); break;
            case 'tostatus':                    await tostatusCmd(sock,chatId,message,args); break;
            case 'toviewonce':                  await toviewonceCmd(sock,chatId,message); break;
            case 'vv2':                         await vv2Cmd(sock,chatId,message); break;
            case 'groupid':                     await groupidCmd(sock,chatId,message); break;
            case 'disk': case 'sysinfo2':       await diskCmd(sock,chatId,message); break;
            case 'autosavestatus':              await autosaveCmd(sock,chatId,message,args); break;
            case 'lastseen':                    await lastseenCmd(sock,chatId,message,args); break;
            case 'readreceipts':                await readreceiptsCmd(sock,chatId,message,args); break;
            case 'unblockall':                  await unblockallCmd(sock,chatId,message); break;
            case 'freezelastseen':              await freezelsCmd(sock,chatId,message,args); break;
            // RELIGION
            case 'bible':                       await bibleCmd(sock,chatId,message,args); break;
            case 'quran':                       await quranCmd(sock,chatId,message,args); break;
            // SEARCH
            case 'imdb':                        await imdbCmd(sock,chatId,message,args); break;
            case 'shazam':                      await shazamCmd(sock,chatId,message); break;
            case 'yts':                         await ytsCmd(sock,chatId,message,args); break;
            case 'define2':                     await define2Cmd(sock,chatId,message,args); break;
            // SETTINGS
            case 'anticall':                    await anticallCmd.anticallCommand(sock,chatId,message,args); break;
            case 'antidelete':                  await antideleteCmd(sock,chatId,message,args); break;
            case 'antiviewonce':                await antivoCmd(sock,chatId,message,args); break;
            case 'autoreact':                   await autoreactCmd(sock,chatId,message,args); break;
            case 'autoread':                    await autoreadCmd(sock,chatId,message,args); break;
            case 'setbotname':                  await setbotnameCmd(sock,chatId,message,args); break;
            case 'setprefix':                   await setprefixCmd(sock,chatId,message,args); break;
            case 'setwelcome':                  await setwelcomeCmd(sock,chatId,message,args); break;
            case 'setgoodbye':                  await setgoodbyeCmd(sock,chatId,message,args); break;
            case 'listwarn':                    await listwarnCmd(sock,chatId,message); break;
            case 'setwarn':                     await setwarnCmd(sock,chatId,message,args); break;
            case 'resetwarn': case 'clrwarn':   await resetwarnCmd(sock,chatId,message); break;
            // TOOLS
            case 'say':                         await sayCmd(sock,chatId,message,args); break;
            case 'fancy':                       await fancyCmd(sock,chatId,message,args); break;
            case 'fliptext':                    await fliptextCmd(sock,chatId,message,args); break;
            case 'tinyurl':                     await tinyurlCmd(sock,chatId,message,args); break;
            case 'ssweb':                       await sswebCmd(sock,chatId,message,args); break;
            case 'getabout':                    await getaboutCmd(sock,chatId,message); break;
            case 'browse':                      await browseCmd(sock,chatId,message,args); break;
            case 'texttopdf':                   await texttopdfCmd(sock,chatId,message,args); break;
            case 'genpass':                     await genpassCmd(sock,chatId,message,args); break;
            case 'tourl':                       await tourlCmd(sock,chatId,message); break;
            // OTHER
            case 'botstatus':                   await botstatusCmd(sock,chatId,message); break;
            case 'ping2':                       await ping2Cmd(sock,chatId,message); break;
            case 'repo':                        await repoCmd(sock,chatId,message); break;
            case 'wallpaper':                   await wallpaperCmd(sock,chatId,message,args); break;
            case 'remini':                      await reminiCmd(sock,chatId,message); break;
            case 'dm':                          await dmCmd(sock,chatId,message,args); break;
            // ── NEW VOYAGE_XD COMMANDS ──────────────────────────────
            case 'rizz':                        await rizzCmd(sock,chatId,message,args); break;
            case 'pickup': case 'pickupline':   await pickupCmd(sock,chatId,message,args); break;
            case 'confession': case 'confess':  await confessionCmd(sock,chatId,message,args); break;
            case 'advice':                      await adviceCmd(sock,chatId,message,args); break;
            case 'hack':                        await hackCmd(sock,chatId,message,args); break;
            case 'wouldyourather': case 'wyr':  await wyrCmd(sock,chatId,message,args); break;
            case 'funfact': case 'ff':          await funfactCmd(sock,chatId,message,args); break;
            case 'whoami':                      await whoamiCmd(sock,chatId,message,args); break;
            case 'aesthetic': case 'aes':       await aestheticCmd(sock,chatId,message,args); break;
            case 'compliment2': case 'hype':    await compliment2Cmd(sock,chatId,message,args); break;
            case 'cashapp': case 'cash':        await cashappCmd(sock,chatId,message,args); break;
            // ── VOYAGE XD DOWNLOAD EXTRAS ─────────────────────────────────
            case 'song3':                       await apiDlCmd.song2Cmd(sock,chatId,message,args); break;
            case 'play2':                       await apiDlCmd.play2Cmd(sock,chatId,message,args); break;
            case 'ytmp3':                       await apiDlCmd.ytmp3Cmd(sock,chatId,message,args); break;
            case 'tiktok2':                     await apiDlCmd.tiktok2Cmd(sock,chatId,message,args); break;
            case 'fbvideo': case 'fb':          await apiDlCmd.fbvideoCmd(sock,chatId,message,args); break;
            case 'spotify': case 'spotifydl':   await apiDlCmd.spotifyCmd(sock,chatId,message,args); break;
            case 'voiceai':                     await apiDlCmd.voiceaiCmd(sock,chatId,message,args); break;
            case 'ytv2':                        await apiDlCmd.ytv2Cmd(sock,chatId,message,args); break;
            // ── VOYAGE XD EXTRAS ──────────────────────────────────────────
            case 'info':                        await extrasCmd.infoCmd(sock,chatId,message); break;
            case 'repeat':                      await extrasCmd.repeatCmd(sock,chatId,message,args); break;
            case 'setmenuimg':                  await extrasCmd.setmenuimgCmd(sock,chatId,message,args); break;
            case 'trivia2':                     await extrasCmd.triviaCmd(sock,chatId,message,args); break;
            case 'trivia2answer':               await extrasCmd.triviaanswerCmd(sock,chatId,message); break;
            case 'alwaysonline2':               await extrasCmd.alwaysonlineCmd(sock,chatId,message,args); break;
            case 'weather2':                    await extrasCmd.weather2Cmd(sock,chatId,message,args); break;
            case 'tr3': case 'translate3':      await extrasCmd.translate3Cmd(sock,chatId,message,args); break;
            case 'qrcode2':                     await extrasCmd.qrcode2Cmd(sock,chatId,message,args); break;
            case 'tinyurl2':                    await extrasCmd.tinyurl2Cmd(sock,chatId,message,args); break;
            case 'speedtest2':                  await extrasCmd.speedtestCmd(sock,chatId,message); break;
            case 'myip2':                       await extrasCmd.myip2Cmd(sock,chatId,message); break;

            // ── ANIME REACTIONS ───────────────────────────────────────────
            case 'hug':      case 'kiss':      case 'pat':
            case 'slap':     case 'bite':      case 'poke':
            case 'cuddle':   case 'lick':      case 'bonk':
            case 'bully':    case 'cry':       case 'dance':
            case 'feed':     case 'handhold':  case 'happy':
            case 'highfive': case 'kill':      case 'smug':
            case 'tickle':   case 'wave':      case 'wink':
            case 'yeet':     case 'blush':     case 'smile':
            case 'punch':    case 'nom':       case 'nod':
            case 'nope':
                await animeReact(sock, chatId, message, cmd); break;

            // ── ANIME IMAGES ──────────────────────────────────────────────
            case 'neko':     case 'waifu':     case 'kitsune':
            case 'husbando': case 'shinobu':   case 'megumin':
            case 'naruto':   case 'sasuke':    case 'itachi':
            case 'nezuko':   case 'miku':      case 'boruto':
            case 'erza':     case 'mikasa':    case 'madara':
            case 'pokemon':  case 'onepiece':  case 'hacker':
            case 'art':      case 'space':     case 'hinata':
            case 'kakashi':  case 'emilia':    case 'elaina':
                await animeImg(sock, chatId, message, cmd); break;

            // ── GAMES ─────────────────────────────────────────────────────
            case 'slot': case 'slotmachine':
                await slotCmd(sock, chatId, message); break;

            // ── SEARCH ────────────────────────────────────────────────────
            case 'google': case 'gsearch':
                await googleCmd(sock, chatId, message, args); break;
            case 'pinterest': case 'pin2':
                await pinterestNewCmd(sock, chatId, message, args); break;
            case 'spotifysearch':               await spotifyCmd(sock, chatId, message, args); break;

            // ── YOUTUBE DOWNLOAD ──────────────────────────────────────────
            case 'yta':
                await ytmp3Cmd(sock, chatId, message, args); break;
            case 'ytmp4': case 'ytv':
                await ytmp4Cmd(sock, chatId, message, args); break;

            // ── DOWNLOADERS ───────────────────────────────────────────────
            case 'mediafire': case 'mf':
                await mediafireCmd(sock,chatId,message,args); break;
            case 'terabox': case 'teraboxdl':
                await teraboxCmd(sock,chatId,message,args); break;
            case 'spdl':                        await spotifydlCmd(sock,chatId,message,args); break;
            case 'snackvideo': case 'snack':
                await snackvideoCmd(sock,chatId,message,args); break;

            // ── STALK ─────────────────────────────────────────────────────
            case 'tiktokstalk': case 'ttstalk':
                await tiktokstalkcmd(sock,chatId,message,args); break;
            case 'genshin': case 'genshinstalk':
                await genshinCmd(sock,chatId,message,args); break;

            // ── TOOLS ─────────────────────────────────────────────────────
            case 'removebg': case 'nobg':
                await removebgCmd(sock,chatId,message); break;
            case 'ocr': case 'readtext':
                await ocrCmd(sock,chatId,message); break;
            case 'myip': case 'serverip':
                await myipCmd(sock,chatId,message); break;
            case 'tempmail': case 'disposablemail':
                await tempmailCmd(sock,chatId,message); break;
            case 'stickermeme': case 'smeme':
                await stickermemeCmd(sock,chatId,message,args); break;

            // ── GAMES ─────────────────────────────────────────────────────
            case 'rps': case 'rockpaperscissors':
                await rpsCmd(sock,chatId,message,args); break;

            // ── ANIME ─────────────────────────────────────────────────────
            case 'anime': case 'animesearch':
                await animeSearch(sock,chatId,message,args); break;
            case 'animeinfo': case 'anime_detail':
                await animeInfo(sock,chatId,message,args); break;
            case 'animelatest': case 'anime_latest':
                await animeLatest(sock,chatId,message); break;
            case 'animequote': case 'quotesanime':
                await animequoteCmd(sock,chatId,message); break;
            case 'manga': case 'mangasearch':
                await mangaCmd(sock,chatId,message,args); break;

            // ── SEARCH ────────────────────────────────────────────────────
            case 'pixabay':
                await pixabayCmd(sock,chatId,message,args); break;
            case 'tenor': case 'gif':
                await tenorCmd(sock,chatId,message,args); break;

            // ── RANDOM IMAGES ─────────────────────────────────────────────
            case 'randomboy': case 'boy':
                await sendRandomPerson(sock,chatId,message,'male'); break;
            case 'randomgirl': case 'girl':
                await sendRandomPerson(sock,chatId,message,'female'); break;
            case 'cat': case 'randomcat':
                await sendCatOrDog(sock,chatId,message,'cat'); break;
            case 'dog': case 'randomdog':
                await sendCatOrDog(sock,chatId,message,'dog'); break;
            case 'nature': case 'naturepic':
                await sendUnsplash(sock,chatId,message,'nature'); break;
            case 'car': case 'carpic':
                await sendUnsplash(sock,chatId,message,'car'); break;
            case 'food': case 'foodpic':
                await sendUnsplash(sock,chatId,message,'food'); break;

            // ── TEXT EFFECTS ──────────────────────────────────────────────
            case 'textbold': case 'bold':
                await styletextCmd(sock,chatId,message,args,'bold'); break;
            case 'textitalic': case 'italic':
                await styletextCmd(sock,chatId,message,args,'italic'); break;
            case 'textscript': case 'script':
                await styletextCmd(sock,chatId,message,args,'script'); break;
            case 'textbubble': case 'bubbletext':
                await styletextCmd(sock,chatId,message,args,'bubble'); break;
            case 'glitch': case 'glitchtext':
                await styletextCmd(sock,chatId,message,args,'glitch'); break;
            case 'vaporwave': case 'aesthetic2':
                await styletextCmd(sock,chatId,message,args,'vaporwave'); break;

            // ── ROUND 2 COMMANDS ──────────────────────────────────────────
            // PROFILE
            case 'getpp': case 'profilepic':
                await getpp(sock,chatId,message); break;
            case 'getbio': case 'userbio':
                await getbio(sock,chatId,message); break;

            // AUTOSTICKER
            case 'autosticker': case 'autostickergc':
                await autostickerCommand(sock,chatId,message,args); break;

            // QURAN / BIBLE
            case 'alquran': case 'quranverse':
                await quranCmd(sock,chatId,message,args); break;
            case 'alkitab': case 'bible2':
                await alkitabCmd(sock,chatId,message,args); break;

            // GAMES
            case 'mathquiz': case 'mathgame':
                await mathquizCmd(sock,chatId,message,args); break;

            // ANONYMOUS CHAT
            case 'anonymouschat': case 'anonstart': case 'anonstop': case 'anonnext': case 'anonfind':
                await anonymouschatCmd(sock,chatId,message,args,cmd); break;

            // TOOLS
            case 'speedtest': case 'speed':
                await speedtestCmd(sock,chatId,message); break;
            case 'stickersearch': case 'stickerfind':
                await stickersearchCmd(sock,chatId,message,args); break;
            case 'shortquote': case 'qquote':
                await shortquoteCmd(sock,chatId,message); break;
            case 'lifefact': case 'funfacthidup':
                await lifefactCmd(sock,chatId,message); break;
            case 'quoteshacker': case 'xquote':
                await hackerquoteCmd(sock,chatId,message); break;
            case 'backup': case 'groupbackup':
                await backupCmd(sock,chatId,message); break;

            // ANTILINK PLATFORM VARIANTS
            case 'antilinkall':
            case 'antilinkch':
            case 'antilinkfacebook':
            case 'antilinkfb':
            case 'antilinkgc':
            case 'antilinkgc2':
            case 'antilinkig':
            case 'antilinkinsta':
            case 'antilinkinstagram':
            case 'antilinktelegram':
            case 'antilinktg':
            case 'antilinktiktok':
            case 'antilinktt':
            case 'antilinktwit':
            case 'antilinktwitter':
            case 'antilinktwt':
            case 'antilinkyoutubech':
            case 'antilinkyoutubechannel':
            case 'antilinkyoutubevid':
            case 'antilinkyoutubevideo':
            case 'antilinkytch':
            case 'antilinkytvid':
            case 'antipromosi':
            case 'antitoxic':
            case 'antibot':
            case 'antinsfw':
            case 'antitagsw':
            case 'antiwork':
            case 'antivirus':
            case 'antivirtex':
                await handleAntilinkPlus(sock,chatId,message,args,cmd); break;

            // ANIME REACTION ALIASES (.animehug etc)
            case 'animehug':
            case 'animekiss':
            case 'animepat':
            case 'animeslap':
            case 'animebite':
            case 'animepoke':
            case 'animecuddle':
            case 'animelick':
            case 'animebonk':
            case 'animebully':
            case 'animecry':
            case 'animedance':
            case 'animefeed':
            case 'animehandhold':
            case 'animehappy':
            case 'animehighfive':
            case 'animekill':
            case 'animesmug':
            case 'animetickle':
            case 'animewave':
            case 'animewink':
            case 'animeyeet':
            case 'animeblush':
            case 'animesmile':
            case 'animenom':
            case 'animespank':
            case 'animeglomp':
            case 'animeawoo':
            case 'animecringe':
            case 'animewlp':
                await animeReact(sock,chatId,message,cmd); break;

            // ANIME IMAGE ALIASES (.animeneko etc)
            case 'animeneko':
            case 'animewaifu':
            case 'animemegumin':
            case 'animeshinobu':
            case 'animeavatar':
            case 'animewallpaper':
            case 'animewallpaper2':
            case 'animewall':
            case 'animewall2':
            case 'animefoxgirl':
            case 'animegecg':
            case 'animedl':
            case 'animevideo':
            case 'akira':
            case 'akiyama':
            case 'ana':
            case 'ayuzawa':
            case 'bts':
            case 'chitoge':
            case 'cyber':
            case 'exo':
            case 'fox':
            case 'glasses':
            case 'gremory':
            case 'hestia':
            case 'husbu':
            case 'islamic':
            case 'japanese':
            case 'korean':
            case 'kpop':
            case 'mountain':
            case 'rize':
            case 'satanic':
            case 'technology':
            case 'cartoon':
            case 'hijab':
            case 'gifs':
            case 'amv':
            case 'randomnime':
            case 'randomnime2':
                await animeImg(sock,chatId,message,cmd); break;
            default: break;
        }
    } catch(e) { console.error('handleMessages error:', e.message); }
}

async function handleGroupParticipantUpdate(sock, update) {
    try {
        const { id, participants, action } = update;
        if (!id.endsWith('@g.us')) return;
        if (action==='add')    await handleJoin(sock, id, participants);
        if (action==='remove') await handleLeave(sock, id, participants);
    } catch(e) { console.error('group update error:', e.message); }
}

module.exports = { handleMessages, handleGroupParticipantUpdate };
