/**
 * VOYAGE XD — Extra Commands from Cypher
 * ping2 / info / id / runtime2 / repeat / copyMsg / setmenuimg
 * trivia / triviaanswer / 8ball / joke2 / quote2 / fact2
 * translate2 / weather2 / define3 / qrcode2 / tinyurl2
 * alwaysonline / chatbot / autoreactstatus / getsettings / setfonts
 */
const os = require('os');
const https = require('https');
const http  = require('http');
const settings = require('../settings');
const userState = require('../lib/userState');
const { reply, getSender, getIsOwner } = require('./_helper');

function httpsGet(url) {
    return new Promise((resolve, reject) => {
        const mod = url.startsWith('https') ? https : http;
        mod.get(url, { headers:{ 'User-Agent':'VOYAGEXD/4.0' } }, res => {
            if ([301,302,303,307,308].includes(res.statusCode) && res.headers.location)
                return httpsGet(res.headers.location).then(resolve).catch(reject);
            let d = '';
            res.on('data', c => d += c);
            res.on('end', () => { try { resolve(JSON.parse(d)); } catch { resolve(d); } });
        }).on('error', reject);
    });
}

const SIG = '\n\n_VOYAGE XD©_';
function B(title, lines) { return `*---${title}---*\n${lines.map(l=>`  ${l}`).join('\n')}` + SIG; }

// ── info ──────────────────────────────────────────────────────────────────
async function infoCmd(sock, chatId, message) {
    const total = os.totalmem(), free = os.freemem();
    const pct = Math.round(((total-free)/total)*100);
    const filled = Math.round(pct/10);
    const bar = '█'.repeat(filled)+'░'.repeat(10-filled);
    await sock.sendMessage(chatId, { text: B('🤖 BOT INFO',[
        `📛 *Name    »* ${settings.botName}`,
        `🔑 *Prefix  »* [ ${userState.getPrefix(sock._ownerPhone, settings.prefix)} ]`,
        `🌐 *Mode    »* PUBLIC`,
        `🏷️ *Version »* v${settings.version}`,
        `💾 *RAM     »* [${bar}] ${pct}%`,
        `🟢 *Node    »* ${process.version}`,
        `🖥️ *Platform»* ${os.platform()}`,
    ]) }, { quoted: message });
}

// ── repeat ────────────────────────────────────────────────────────────────
async function repeatCmd(sock, chatId, message, args) {
    const times = parseInt(args[0]);
    const text  = args.slice(1).join(' ');
    if (!times || !text || times > 10 || times < 1)
        return reply(sock, chatId, `❌ Usage: .repeat <1-10> <text>` + SIG, message);
    for (let i = 0; i < times; i++) {
        await sock.sendMessage(chatId, { text }, { quoted: message });
        await new Promise(r => setTimeout(r, 600));
    }
}

// ── setmenuimg ────────────────────────────────────────────────────────────
async function setmenuimgCmd(sock, chatId, message, args) {
    const sender = getSender(sock, message);
    if (!await getIsOwner(sock)(sender, sock, chatId))
        return reply(sock, chatId, '❌ *Owner only.*' + SIG, message);
    if (!args[0]) return reply(sock, chatId, `❌ Usage: .setmenuimg <url>` + SIG, message);
    settings.BOT_IMG = args[0];
    await reply(sock, chatId, `✅ *Menu image updated!*` + SIG, message);
}

// ── trivia ────────────────────────────────────────────────────────────────
const TRIVIA = [
    { q:'What does CPU stand for?', a:'Central Processing Unit' },
    { q:'What year was the first iPhone released?', a:'2007' },
    { q:'What language is the Linux kernel written in?', a:'C' },
    { q:'What does HTML stand for?', a:'HyperText Markup Language' },
    { q:'Who founded Microsoft?', a:'Bill Gates and Paul Allen' },
    { q:'What does RAM stand for?', a:'Random Access Memory' },
    { q:'What is the binary of 8?', a:'1000' },
    { q:'What does GPS stand for?', a:'Global Positioning System' },
    { q:'What was the first programming language?', a:'FORTRAN' },
    { q:'How many bytes are in a kilobyte?', a:'1024' },
];
if (!global._triviaStore) global._triviaStore = new Map();

async function triviaCmd(sock, chatId, message, args) {
    const t = TRIVIA[Math.floor(Math.random()*TRIVIA.length)];
    global._triviaStore.set(chatId, { answer: t.a, time: Date.now() });
    await reply(sock, chatId, B('🧠 TRIVIA',[
        `❓ ${t.q}`,
        ``,
        `_Reply with your answer!_`,
        `Use .triviaanswer to reveal.`,
    ]), message);
}

async function triviaanswerCmd(sock, chatId, message) {
    const entry = global._triviaStore.get(chatId);
    if (!entry) return reply(sock, chatId, '❌ No active trivia. Use .trivia first.' + SIG, message);
    global._triviaStore.delete(chatId);
    await reply(sock, chatId, B('🧠 TRIVIA ANSWER',[`✅ *${entry.answer}*`]), message);
}

// ── alwaysonline ──────────────────────────────────────────────────────────
async function alwaysonlineCmd(sock, chatId, message, args) {
    const sender = getSender(sock, message);
    if (!await getIsOwner(sock)(sender, sock, chatId))
        return reply(sock, chatId, '❌ *Owner only.*' + SIG, message);
    const FILE = './data/alwaysonline.json';
    const fs = require('fs');
    let d; try { d = JSON.parse(fs.readFileSync(FILE,'utf8')); } catch { d = {enabled:false}; }
    const sub = args[0]?.toLowerCase();
    if (!sub) return reply(sock, chatId, `🟢 *Always Online*\nStatus: ${d.enabled?'✅ ON':'❌ OFF'}\n\n.alwaysonline on\n.alwaysonline off` + SIG, message);
    if (sub==='on') {
        d.enabled = true; fs.writeFileSync(FILE, JSON.stringify(d,null,2));
        if (!global._onlineIntervals) global._onlineIntervals = {};
        if (global._onlineIntervals[sock._ownerPhone]) clearInterval(global._onlineIntervals[sock._ownerPhone]);
        global._onlineIntervals[sock._ownerPhone] = setInterval(async()=>{
            try { await sock.sendPresenceUpdate('available'); } catch {}
        }, 10000);
        try { await sock.sendPresenceUpdate('available'); } catch {}
        return reply(sock, chatId, '🟢 *Always Online »* ON ✅\n_Always showing online!_' + SIG, message);
    }
    if (sub==='off') {
        d.enabled = false; fs.writeFileSync(FILE, JSON.stringify(d,null,2));
        if (global._onlineIntervals?.[sock._ownerPhone]) {
            clearInterval(global._onlineIntervals[sock._ownerPhone]);
            delete global._onlineIntervals[sock._ownerPhone];
        }
        try { await sock.sendPresenceUpdate('unavailable'); } catch {}
        return reply(sock, chatId, '🟢 *Always Online »* OFF ❌' + SIG, message);
    }
}

// ── chatbot ───────────────────────────────────────────────────────────────
async function chatbotToggleCmd(sock, chatId, message, args) {
    const sender = getSender(sock, message);
    if (!await getIsOwner(sock)(sender, sock, chatId))
        return reply(sock, chatId, '❌ *Owner only.*' + SIG, message);
    const FILE = './data/chatbot.json';
    const fs = require('fs');
    let d; try { d = JSON.parse(fs.readFileSync(FILE,'utf8')); } catch { d = {}; }
    const sub = args[0]?.toLowerCase();
    if (!sub) return reply(sock, chatId, `🤖 *Chatbot*\nStatus: ${d[chatId]?.enabled?'✅ ON':'❌ OFF'}\n\n.chatbot on\n.chatbot off` + SIG, message);
    if (!d[chatId]) d[chatId] = {};
    if (sub==='on') { d[chatId].enabled=true; fs.writeFileSync(FILE,JSON.stringify(d,null,2)); return reply(sock,chatId,'🤖 *Chatbot »* ON ✅'+SIG,message); }
    if (sub==='off') { d[chatId].enabled=false; fs.writeFileSync(FILE,JSON.stringify(d,null,2)); return reply(sock,chatId,'🤖 *Chatbot »* OFF ❌'+SIG,message); }
}

// ── weather2 — wttr.in ────────────────────────────────────────────────────
async function weather2Cmd(sock, chatId, message, args) {
    const city = args.join(' ').trim();
    if (!city) return reply(sock, chatId, `❌ Usage: .weather2 <city>` + SIG, message);
    try {
        const data = await httpsGet(`https://wttr.in/${encodeURIComponent(city)}?format=j1`);
        if (typeof data === 'string') return reply(sock, chatId, `❌ City not found: *${city}*` + SIG, message);
        const cur = data.current_condition?.[0];
        const area = data.nearest_area?.[0];
        if (!cur) return reply(sock, chatId, `❌ No weather data.` + SIG, message);
        await reply(sock, chatId, B('🌦️ WEATHER',[
            `📍 *Location »* ${area?.areaName?.[0]?.value||city}, ${area?.country?.[0]?.value||''}`,
            `🌡️ *Temp     »* ${cur.temp_C}°C / ${cur.temp_F}°F`,
            `💧 *Humidity »* ${cur.humidity}%`,
            `🌬️ *Wind     »* ${cur.windspeedKmph} km/h`,
            `🌤️ *Sky      »* ${cur.weatherDesc?.[0]?.value||'N/A'}`,
        ]), message);
    } catch(e) { reply(sock, chatId, `❌ Failed: ${e.message}` + SIG, message); }
}

// ── translate3 — google translate ────────────────────────────────────────
async function translate3Cmd(sock, chatId, message, args) {
    const lang = args[0];
    const text = args.slice(1).join(' ').trim();
    if (!lang || !text) return reply(sock, chatId, `❌ Usage: .tr3 <lang> <text>\nEx: .tr3 fr Hello` + SIG, message);
    try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(lang)}&dt=t&q=${encodeURIComponent(text)}`;
        const data = await httpsGet(url);
        if (!Array.isArray(data) || !Array.isArray(data[0])) return reply(sock, chatId, '❌ Translation failed.' + SIG, message);
        const result = data[0].map(t=>t?.[0]).filter(Boolean).join('');
        await reply(sock, chatId, B('🌐 TRANSLATE',[
            `*Lang   »* ${lang.toUpperCase()}`,
            `*Input  »* ${text}`,
            `*Output »* ${result}`,
        ]), message);
    } catch(e) { reply(sock, chatId, `❌ Failed: ${e.message}` + SIG, message); }
}

// ── qrcode2 ───────────────────────────────────────────────────────────────
async function qrcode2Cmd(sock, chatId, message, args) {
    const text = args.join(' ').trim();
    if (!text) return reply(sock, chatId, `❌ Usage: .qrcode2 <text>` + SIG, message);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(text)}`;
    try {
        await sock.sendMessage(chatId, {
            image: { url: qrUrl },
            caption: B('📱 QR CODE',[`*Data »* ${text.substring(0,50)}`])
        }, { quoted: message });
    } catch(e) { reply(sock, chatId, `❌ Failed: ${e.message}` + SIG, message); }
}

// ── tinyurl2 ──────────────────────────────────────────────────────────────
async function tinyurl2Cmd(sock, chatId, message, args) {
    const url = args[0];
    if (!url) return reply(sock, chatId, `❌ Usage: .tinyurl2 <url>` + SIG, message);
    try {
        const data = await httpsGet(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
        const short = typeof data === 'string' ? data.trim() : String(data);
        await reply(sock, chatId, B('🔗 TINYURL',[
            `*Original »* ${url.substring(0,40)}...`,
            `*Short    »* ${short}`,
        ]), message);
    } catch(e) { reply(sock, chatId, `❌ Failed: ${e.message}` + SIG, message); }
}

// ── speedtest — simple latency measure ───────────────────────────────────
async function speedtestCmd(sock, chatId, message) {
    const start = Date.now();
    await sock.sendMessage(chatId, { react: { text: '⚡', key: message.key } });
    const ms = Date.now() - start;
    const t = Date.now(); let x = 0;
    for (let i=0;i<1e6;i++) x+=i;
    const cpu = Date.now()-t;
    await reply(sock, chatId, B('⚡ SPEEDTEST',[
        `📶 *Latency »* ${ms}ms`,
        `🖥️ *CPU     »* ${cpu}ms (1M loops)`,
        `✅ *Status  »* Online`,
    ]), message);
}

// ── myip2 ─────────────────────────────────────────────────────────────────
async function myip2Cmd(sock, chatId, message) {
    try {
        const data = await httpsGet('https://api.ipify.org?format=json');
        await reply(sock, chatId, B('🌐 SERVER IP',[`*IP »* ${data.ip || 'Unknown'}`]), message);
    } catch(e) { reply(sock, chatId, `❌ Failed: ${e.message}` + SIG, message); }
}

module.exports = {
    infoCmd, repeatCmd, setmenuimgCmd,
    triviaCmd, triviaanswerCmd,
    alwaysonlineCmd, chatbotToggleCmd,
    weather2Cmd, translate3Cmd, qrcode2Cmd, tinyurl2Cmd,
    speedtestCmd, myip2Cmd,
};
