/**
 * VOYAGE XD v3.0 — All-in-One Multi-User Bot
 * ✅ Fixed: Connection Closed error on messages
 * ✅ Per-user isolated store — no conflicts
 * ✅ Port 3000
 */
require('dotenv').config();


const fs        = require('fs');
const path      = require('path');
const chalk     = require('chalk');
const express   = require('express');
const cors      = require('cors');
const NodeCache = require('node-cache');
const pino      = require('pino');

const {
    makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    jidNormalizedUser,
    jidDecode,
    makeCacheableSignalKeyStore,
    delay,
    makeCacheableSignalKeyStore: makeCache
} = require('@crysnovax/baileys');

const { handleMessages, handleGroupParticipantUpdate } = require('./main');
const settings  = require('./settings');
const { getSender }      = require('./lib/getSender');
const { makeIsOwner }    = require('./lib/isOwner');
const { isBanned }       = require('./lib/isBanned');

const PORT    = process.env.PORT || process.env.BOT_PORT || 3100;
const APP_URL = process.env.RENDER_EXTERNAL_URL || process.env.APP_URL || `http://localhost:${PORT}`;
const PAIRING_TIMEOUT = 5 * 60 * 1000;


// ── Ensure folders ─────────────────────────────────────────────────────────
['sessions','temp','data','public'].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

const tempDir = path.join(process.cwd(), 'temp');
process.env.TMPDIR = tempDir; process.env.TEMP = tempDir; process.env.TMP = tempDir;

setInterval(() => {
    fs.readdir(tempDir, (err, files) => {
        if (err) return;
        files.forEach(f => {
            const fp = path.join(tempDir, f);
            fs.stat(fp, (e, s) => { if (!e && Date.now()-s.mtimeMs > 3*60*60*1000) fs.unlink(fp,()=>{}); });
        });
    });
}, 3*60*60*1000);

setInterval(() => { if (global.gc) global.gc(); }, 60_000);
setInterval(() => {
    const mb = process.memoryUsage().rss/1024/1024;
    if (mb > 450) { console.log('⚠️ RAM high — restarting'); process.exit(1); }
}, 30_000);

// ── Stats ──────────────────────────────────────────────────────────────────
const STATS_FILE = './sessions/stats.json';
let totalPaired = 0;
try { if(fs.existsSync(STATS_FILE)) totalPaired=JSON.parse(fs.readFileSync(STATS_FILE,'utf8')).total||0; } catch {}
function saveStats() { try { fs.writeFileSync(STATS_FILE, JSON.stringify({total:totalPaired})); } catch {} }

// ── Per-user in-memory message store ─────────────────────────────────────
// Each bot gets its own store — no conflicts
function createStore() {
    const messages = {};
    const MAX = 20;
    function bind(ev) {
        ev.on('messages.upsert', ({ messages: msgs }) => {
            msgs.forEach(msg => {
                const jid = msg.key?.remoteJid; if (!jid) return;
                if (!messages[jid]) messages[jid] = [];
                messages[jid].push(msg);
                if (messages[jid].length > MAX) messages[jid] = messages[jid].slice(-MAX);
            });
        });
    }
    async function loadMessage(jid, id) {
        return (messages[jid] || []).find(m => m.key?.id === id) || undefined;
    }
    return { bind, loadMessage };
}

// ── Active bots map ────────────────────────────────────────────────────────
const activeBots = new Map();

// ── Keep-alive ─────────────────────────────────────────────────────────────
function startKeepAlive() {
    const url = APP_URL.startsWith('http') ? APP_URL : `https://${APP_URL}`;
    setInterval(async () => {
        try { const fetch = require('node-fetch'); await fetch(`${url}/ping`); } catch {}
    }, 10*60*1000);
}

// ══════════════════════════════════════════════════════════════════════════
//  WEB SERVER
// ══════════════════════════════════════════════════════════════════════════
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/ping',  (req, res) => res.json({ status:'alive', bots:[...activeBots.values()].filter(b=>b.status==='connected').length, paired:totalPaired, uptime:Math.floor(process.uptime()) }));
app.get('/',      (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/stats', (req, res) => res.json({ total:totalPaired, active:[...activeBots.values()].filter(b=>b.status==='connected').length }));

// ── POST /pair ─────────────────────────────────────────────────────────────
app.post('/pair', async (req, res) => {
    let { phone } = req.body;
    if (!phone) return res.status(400).json({ error: 'Phone number is required.' });
    phone = phone.replace(/[^0-9]/g, '');
    if (phone.length < 7 || phone.length > 15)
        return res.status(400).json({ error: 'Invalid number. Use international format e.g. 263788114185' });

    const existing = activeBots.get(phone);
    if (existing?.status === 'connected')
        return res.json({ success: true, status: 'already_connected', message: 'Your bot is already running!' });
    if (existing?.status === 'pairing')
        return res.status(429).json({ error: 'Pairing in progress. Enter the code in WhatsApp within 5 minutes.' });

    activeBots.set(phone, { status: 'pairing', code: null, sock: null });

    const timer = setTimeout(() => {
        const b = activeBots.get(phone);
        if (b?.status === 'pairing') {
            console.log(chalk.yellow(`⏰ Pairing expired: +${phone}`));
            try { if(b.sock) b.sock.end(); } catch {}
            activeBots.delete(phone);
            cleanSession(phone);
        }
    }, PAIRING_TIMEOUT);
    activeBots.get(phone).timer = timer;

    try {
        const code = await startPairing(phone, timer);
        return res.json({ success: true, code, phone, expires: '5 minutes' });
    } catch (err) {
        activeBots.delete(phone);
        clearTimeout(timer);
        return res.status(500).json({ error: err.message || 'Something went wrong. Please try again.' });
    }
});

app.get('/status/:phone', (req, res) => {
    const phone = req.params.phone.replace(/[^0-9]/g,'');
    const b = activeBots.get(phone);
    if (!b) return res.json({ status: 'not_found' });
    return res.json({ status: b.status, code: b.code });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(chalk.cyan(`\n╔══════════════════════════════════════╗`));
    console.log(chalk.cyan(`║  ♤  VOYAGE XD v4.0 Multi-User Bot     ║`));
    console.log(chalk.cyan(`║  🌐  Port: ${PORT}                        ║`));
    console.log(chalk.cyan(`║  📊  ${totalPaired} users paired so far      ║`));
    console.log(chalk.cyan(`╚══════════════════════════════════════╝\n`));
    console.log(chalk.green(`🔗 ${APP_URL}\n`));
    startKeepAlive();
    loadExistingSessions();
});

// ══════════════════════════════════════════════════════════════════════════
//  START PAIRING
// ══════════════════════════════════════════════════════════════════════════
async function startPairing(phone, timer) {
    const sessionDir = `./sessions/${phone}`;
    if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });

    const { version }          = await fetchLatestBaileysVersion();
    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    const userStore            = createStore(); // ✅ per-user store

    const sock = makeWASocket({
        version,
        logger:            pino({ level: 'silent' }),
        printQRInTerminal: false,
        browser:           ['Ubuntu', 'Chrome', '20.0.04'],
        auth: {
            creds: state.creds,
            keys:  makeCacheableSignalKeyStore(state.keys, pino({level:'fatal'}).child({level:'fatal'}))
        },
        msgRetryCounterCache:  new NodeCache(),
        connectTimeoutMs:      60000,
        defaultQueryTimeoutMs: 60000,
        keepAliveIntervalMs:   25000,
        markOnlineOnConnect:   true,
        // ✅ per-user getMessage — no shared state
        getMessage: async (key) => {
            const msg = await userStore.loadMessage(jidNormalizedUser(key.remoteJid), key.id);
            return msg?.message || { conversation: '' };
        },
    });

    // ✅ tag the sock with owner phone and user store
    sock._ownerPhone = phone;
    sock._userStore  = userStore;

    sock.ev.on('creds.update', saveCreds);
    userStore.bind(sock.ev); // ✅ bind per-user store

    const bt = activeBots.get(phone);
    if (bt) bt.sock = sock;

    await delay(2000);

    let code;
    try {
        code = await sock.requestPairingCode(phone);
        code = code?.match(/.{1,4}/g)?.join('-') || code;
    } catch (err) {
        try { sock.end(); } catch {}
        throw new Error('Could not generate code. Make sure number is registered on WhatsApp.');
    }

    const bots = activeBots.get(phone);
    if (bots) bots.code = code;
    console.log(chalk.yellow(`📱 Pairing: +${phone} | Code: ${code}`));

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'open') {
            clearTimeout(timer);
            console.log(chalk.green(`✅ Connected: +${phone}`));
            const b = activeBots.get(phone); if (b) b.status = 'connected';
            totalPaired++; saveStats();

            // Auto-join channel and group
            setTimeout(async () => {
                const { autoJoinChannel, autoJoinGroup } = require('./lib/autojoin');
                await autoJoinChannel(sock);
                await autoJoinGroup(sock);
            }, 5000);

            // Welcome message
            try {
                await delay(3000);
                const botNum = sock.user.id.split(':')[0]+'@s.whatsapp.net';
                await sock.sendMessage(botNum, {
                    image: { url: require('./settings').BOT_IMG },
                    caption: `*┏━━━━━━━━━━━━━━━━━━━┓*\n┃ ♤ *Connected to VOYAGE XD* ✅\n┃ ♤ *Status:* LIVE & Ready!\n┃ ♤ *Prefix:* [ . ]\n┃ ♤ *Try:* .menu | .ping | .alive\n┃ ♤ *Owner:* Send .setprefix or .mode\n*┗━━━━━━━━━━━━━━━━━━━┛*\n\n_VOYAGE XD© — Always On, Always Ready_`
                });
            } catch {}

            startBotHandlers(sock, phone);
        }

        if (connection === 'close') {
            const errCode = lastDisconnect?.error?.output?.statusCode;
            console.log(chalk.red(`⛔ Disconnected: +${phone} | Code: ${errCode}`));
            if (errCode === DisconnectReason.loggedOut || errCode === 401) {
                activeBots.delete(phone); cleanSession(phone); return;
            }
            const b = activeBots.get(phone);
            if (b) { b.status = 'reconnecting'; setTimeout(()=>reconnectBot(phone), 5000); }
        }
    });

    return code;
}

// ══════════════════════════════════════════════════════════════════════════
//  BOT MESSAGE HANDLERS — per user, isolated
// ══════════════════════════════════════════════════════════════════════════
function startBotHandlers(sock, phone) {
    sock.decodeJid = (jid) => {
        if (!jid) return jid;
        if (/:\d+@/gi.test(jid)) { const d=jidDecode(jid)||{}; return d.user&&d.server?`${d.user}@${d.server}`:jid; }
        return jid;
    };

    try { const {getMode}=require('./commands/mode'); sock.public=getMode().mode!=='private'; } catch { sock.public=true; }

    // Anti-sleep
    const sleepIv = setInterval(async()=>{ try { await sock.sendPresenceUpdate('available'); } catch {} }, 4*60*1000);
    const bt = activeBots.get(phone); if (bt) bt.sleepIv = sleepIv;

    // ── Messages ───────────────────────────────────────────────────────
    sock.ev.on('messages.upsert', async (update) => {
        try {
            if (update.type !== 'notify') return;
            const mek = update.messages[0];
            if (!mek?.message) return;

            // Unwrap ephemeral
            if (Object.keys(mek.message)[0] === 'ephemeralMessage')
                mek.message = mek.message.ephemeralMessage.message;

            const chatId = mek.key.remoteJid;
            if (!chatId) return;
            if (chatId === 'status@broadcast') return;
            if (mek.key.id?.startsWith('BAE5') && mek.key.id.length === 16) return;

            const sender    = getSender(sock, mek);
            const isOwnerFn = makeIsOwner(phone);

            if (!sender) return;
            if (isBanned(sender)) return;

            // Private mode check
            if (!sock.public && !mek.key.fromMe && !await isOwnerFn(sender, sock, chatId)) return;

            // .session command
            const rawText = mek.message?.conversation || mek.message?.extendedTextMessage?.text || '';
            if (rawText.trim().toLowerCase() === '.session') {
                if (await isOwnerFn(sender, sock, chatId)) {
                    const credsFile = `./sessions/${phone}/creds.json`;
                    if (fs.existsSync(credsFile)) {
                        const sessionId = Buffer.from(fs.readFileSync(credsFile,'utf8')).toString('base64');
                        await sock.sendMessage(chatId, {
                            document: Buffer.from(sessionId),
                            fileName: `VOYAGE_XD_SESSION_${phone}.txt`,
                            mimetype: 'text/plain',
                            caption: '🔐 Your SESSION_ID\n\n_VOYAGE XD©_'
                        }, { quoted: mek });
                    } else {
                        await sock.sendMessage(chatId, { text: '❌ No session file.\n\n_VOYAGE XD©_' }, { quoted: mek });
                    }
                    return;
                }
            }

            // Route to main handler
            await handleMessages(sock, update);

        } catch(e) {
            // Only log real errors, not Connection Closed noise
            if (!e.message?.includes('Connection Closed') && !e.message?.includes('connection')) {
                console.error(`[${phone}] Error:`, e.message);
            }
        }
    });

    // Anti-call (respects .anticall on/off setting)
    sock.ev.on('call', async (calls) => {
        let anticallEnabled = false;
        try { anticallEnabled = require('./commands/anticall').isAnticallEnabled(); } catch {}
        if (!anticallEnabled) return; // OFF = allow calls
        for (const call of calls) {
            if (call.status !== 'offer') continue; // only reject incoming offers
            const jid = call.from||call.peerJid||call.chatId;
            if (!jid) continue;
            try {
                if (typeof sock.rejectCall === 'function' && call.id) {
                    await sock.rejectCall(call.id, jid);
                    await sock.sendMessage(jid, {
                        text: '📵 Anti-Call ON - calls blocked. Send a message instead. (VOYAGE XD)'
                    });
                }
            } catch {}
        }
    });

    // Group events
    sock.ev.on('group-participants.update', async (u) => {
        try { await handleGroupParticipantUpdate(sock, u); } catch {}
    });


    // ── Anti-Delete ────────────────────────────────────────────────────
    sock.ev.on('messages.update', async (updates) => {
        try {
            const { isEnabled } = require('./commands/antidelete');
            if (!isEnabled()) return;

            for (const update of updates) {
                try {
                    // stubType 7 = REVOKE (deleted for everyone)
                    if (update.update?.messageStubType !== 7) continue;

                    const msgId = update.key?.id;
                    const from  = update.key?.remoteJid;
                    if (!msgId || !from) continue;

                    // Look up original from per-user store
                    const original = await sock._userStore.loadMessage(from, msgId);
                    if (!original?.message) continue;

                    // Don't forward bot's own deletions
                    if (original.key?.fromMe) continue;

                    const msg      = original.message;
                    const sender   = original.key?.participant || original.key?.remoteJid || from;
                    const ownerJid = `${phone}@s.whatsapp.net`;
                    const isGroup  = from.endsWith('@g.us');
                    const header   = `\u{1F5D1}\uFE0F *Anti-Delete Alert*\n\u{1F464} From: @${sender.split('@')[0]}\n\u{1F4CD} In: ${isGroup ? 'Group' : 'DM'}`;

                    // ── Image ──
                    if (msg.imageMessage) {
                        await sock.sendMessage(ownerJid, {
                            image: { url: msg.imageMessage.url },
                            caption: header + (msg.imageMessage.caption ? `\n\u{1F4DD} ${msg.imageMessage.caption}` : ''),
                            mimetype: msg.imageMessage.mimetype || 'image/jpeg',
                        });
                    }
                    // ── Video ──
                    else if (msg.videoMessage) {
                        await sock.sendMessage(ownerJid, {
                            video: { url: msg.videoMessage.url },
                            caption: header + (msg.videoMessage.caption ? `\n\u{1F4DD} ${msg.videoMessage.caption}` : ''),
                            mimetype: msg.videoMessage.mimetype || 'video/mp4',
                        });
                    }
                    // ── Audio / PTT ──
                    else if (msg.audioMessage) {
                        await sock.sendMessage(ownerJid, {
                            audio: { url: msg.audioMessage.url },
                            mimetype: msg.audioMessage.mimetype || 'audio/ogg; codecs=opus',
                            ptt: msg.audioMessage.ptt || false,
                        });
                        await sock.sendMessage(ownerJid, { text: header });
                    }
                    // ── Sticker ──
                    else if (msg.stickerMessage) {
                        await sock.sendMessage(ownerJid, { sticker: { url: msg.stickerMessage.url } });
                        await sock.sendMessage(ownerJid, { text: header });
                    }
                    // ── Document ──
                    else if (msg.documentMessage) {
                        await sock.sendMessage(ownerJid, {
                            document: { url: msg.documentMessage.url },
                            mimetype: msg.documentMessage.mimetype || 'application/octet-stream',
                            fileName: msg.documentMessage.fileName || 'file',
                            caption: header,
                        });
                    }
                    // ── Text / Extended text ──
                    else if (msg.conversation || msg.extendedTextMessage?.text) {
                        const text = msg.conversation || msg.extendedTextMessage?.text || '';
                        await sock.sendMessage(ownerJid, { text: `${header}\n\n\u{1F4AC} Message:\n${text}` });
                    }
                    // ── Anything else — just notify ──
                    else {
                        await sock.sendMessage(ownerJid, { text: `${header}\n\n_(Media type not recoverable)_` });
                    }

                } catch (_) { /* silent — never crash bot */ }
            }
        } catch (_) { /* silent */ }
    });

    console.log(chalk.green(`🤖 Handlers active: +${phone}`));
}

// ══════════════════════════════════════════════════════════════════════════
//  RECONNECT
// ══════════════════════════════════════════════════════════════════════════
async function reconnectBot(phone) {
    try {
        const sessionDir = `./sessions/${phone}`;
        if (!fs.existsSync(`${sessionDir}/creds.json`)) { activeBots.delete(phone); return; }

        const { version }          = await fetchLatestBaileysVersion();
        const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
        const userStore            = createStore();

        const sock = makeWASocket({
            version, logger: pino({level:'silent'}), printQRInTerminal: false,
            browser: ['Ubuntu','Chrome','20.0.04'],
            auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({level:'fatal'}).child({level:'fatal'})) },
            msgRetryCounterCache: new NodeCache(), connectTimeoutMs: 60000,
            defaultQueryTimeoutMs: 60000, keepAliveIntervalMs: 25000, markOnlineOnConnect: true,
            getMessage: async (key) => {
                const msg = await userStore.loadMessage(jidNormalizedUser(key.remoteJid), key.id);
                return msg?.message || { conversation: '' };
            },
        });

        sock._ownerPhone = phone;
        sock._userStore  = userStore;
        sock.ev.on('creds.update', saveCreds);
        userStore.bind(sock.ev);

        const bt = activeBots.get(phone);
        if (bt) { bt.sock = sock; bt.status = 'reconnecting'; }

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update;
            if (connection === 'open') {
                console.log(chalk.green(`✅ Reconnected: +${phone}`));
                const b = activeBots.get(phone); if (b) b.status = 'connected';
                startBotHandlers(sock, phone);
            }
            if (connection === 'close') {
                const errCode = lastDisconnect?.error?.output?.statusCode;
                if (errCode === DisconnectReason.loggedOut || errCode === 401) {
                    activeBots.delete(phone); cleanSession(phone); return;
                }
                const b = activeBots.get(phone);
                if (b) { b.status='reconnecting'; setTimeout(()=>reconnectBot(phone), 10000); }
            }
        });
    } catch(e) {
        console.error(`Reconnect error +${phone}:`, e.message);
        setTimeout(()=>reconnectBot(phone), 15000);
    }
}

// ══════════════════════════════════════════════════════════════════════════
//  LOAD EXISTING SESSIONS on restart
// ══════════════════════════════════════════════════════════════════════════
async function loadExistingSessions() {
    try {
        const dirs = fs.readdirSync('./sessions').filter(d => {
            if (d === 'stats.json') return false;
            const dp = path.join('./sessions', d);
            try { return fs.statSync(dp).isDirectory() && fs.existsSync(path.join(dp,'creds.json')); } catch { return false; }
        });
        if (!dirs.length) { console.log(chalk.yellow('📭 No existing sessions')); return; }
        console.log(chalk.cyan(`♻️ Restoring ${dirs.length} session(s)...`));
        for (const phone of dirs) {
            if (activeBots.has(phone)) continue;
            activeBots.set(phone, { status:'reconnecting', code:null, sock:null });
            await delay(2000);
            reconnectBot(phone);
        }
    } catch(e) { console.error('Load sessions error:', e.message); }
}

function cleanSession(phone) {
    try { const d=`./sessions/${phone}`; if(fs.existsSync(d)) fs.rm(d,{recursive:true,force:true},()=>{}); } catch {}
}

process.on('uncaughtException',  e => { if(!e.message?.includes('Connection')) console.error('Uncaught:', e.message); });
process.on('unhandledRejection', e => { if(!String(e)?.includes('Connection')) console.error('Rejection:', e); });
