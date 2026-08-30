/**
 * VOYAGE XD v4.1.0 — UPDATE 2
 * ✅ Fixed: Pairing disconnect / connection lifecycle
 * ✅ Fixed: Duplicate socket creation & listener leaks
 * ✅ Fixed: Duplicate handler registration on reconnect
 * ✅ Fixed: Auth state preservation & session restoration
 * ✅ Added: Comprehensive diagnostic logging
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
} = require('@crysnovax/baileys');

const { handleMessages, handleGroupParticipantUpdate } = require('./main');
const settings  = require('./settings');
const { getSender }      = require('./lib/getSender');
const { makeIsOwner }    = require('./lib/isOwner');
const { isBanned }       = require('./lib/isBanned');

const PORT    = process.env.PORT || process.env.BOT_PORT || 3100;
const APP_URL = process.env.RENDER_EXTERNAL_URL || process.env.APP_URL || `http://localhost:${PORT}`;
const PAIRING_TIMEOUT = 5 * 60 * 1000;

// ── DIAGNOSTIC LOGGER ─────────────────────────────────────────────────────
function log(tag, msg, isError = false) {
    const line = `[VOYAGE-XD] ${tag}: ${msg}`;
    if (isError) console.error(chalk.red(line));
    else console.log(chalk.cyan(line));
}

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
//  SOCKET LIFECYCLE HELPERS
// ══════════════════════════════════════════════════════════════════════════

/**
 * Properly destroy a socket and all its resources.
 * Prevents duplicate listeners, memory leaks, and ghost connections.
 */
function destroySocket(phone) {
    const bot = activeBots.get(phone);
    if (!bot) return;

    log('SOCKET', `Destroying socket for +${phone}`);

    // Clear anti-sleep interval
    if (bot.sleepIv) {
        clearInterval(bot.sleepIv);
        bot.sleepIv = null;
    }

    // Clear pairing timer
    if (bot.timer) {
        clearTimeout(bot.timer);
        bot.timer = null;
    }

    // End the actual socket
    if (bot.sock) {
        try {
            // Remove all event listeners before ending to prevent callbacks firing on dead socket
            bot.sock.ev.removeAllListeners();
            bot.sock.ws?.removeAllListeners();
            bot.sock.end();
        } catch (e) {
            log('SOCKET', `Error ending socket for +${phone}: ${e.message}`, true);
        }
        bot.sock = null;
    }

    bot.status = 'disconnected';
    log('SOCKET', `Socket destroyed for +${phone}`);
}

/**
 * Controlled reconnect with exponential backoff.
 */
async function scheduleReconnect(phone, reason = 'unknown') {
    const bot = activeBots.get(phone);
    if (!bot) return;

    // Prevent multiple concurrent reconnect attempts
    if (bot._reconnecting) {
        log('RECONNECT', `Reconnect already in progress for +${phone}, skipping duplicate`);
        return;
    }
    bot._reconnecting = true;

    // Calculate backoff: 5s, 10s, 20s, 40s, max 60s
    bot._reconnectAttempts = (bot._reconnectAttempts || 0) + 1;
    const backoff = Math.min(5000 * Math.pow(2, bot._reconnectAttempts - 1), 60000);
    
    log('RECONNECT', `Scheduling reconnect for +${phone} in ${backoff}ms (attempt ${bot._reconnectAttempts}, reason: ${reason})`);

    await delay(backoff);

    // Check if someone else already reconnected us
    if (activeBots.get(phone)?.status === 'connected') {
        log('RECONNECT', `+${phone} already connected, aborting scheduled reconnect`);
        bot._reconnecting = false;
        return;
    }

    try {
        await reconnectBot(phone);
    } catch (e) {
        log('RECONNECT', `Reconnect failed for +${phone}: ${e.message}`, true);
    } finally {
        if (bot) bot._reconnecting = false;
    }
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

    // Destroy any existing socket for this phone before starting fresh
    destroySocket(phone);

    activeBots.set(phone, { status: 'pairing', code: null, sock: null, sleepIv: null, timer: null, _handlersAttached: false, _reconnecting: false, _reconnectAttempts: 0 });

    const timer = setTimeout(() => {
        const b = activeBots.get(phone);
        if (b?.status === 'pairing') {
            log('PAIRING', `Pairing expired: +${phone}`);
            destroySocket(phone);
            activeBots.delete(phone);
            cleanSession(phone);
        }
    }, PAIRING_TIMEOUT);
    activeBots.get(phone).timer = timer;

    try {
        const code = await startPairing(phone, timer);
        return res.json({ success: true, code, phone, expires: '5 minutes' });
    } catch (err) {
        destroySocket(phone);
        activeBots.delete(phone);
        log('PAIRING', `Pairing failed for +${phone}: ${err.message}`, true);
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
    log('PAIRING', `Pair command received for +${phone}`);
    
    const sessionDir = `./sessions/${phone}`;
    if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });

    log('PAIRING', `Generating pairing code for +${phone}`);

    const { version }          = await fetchLatestBaileysVersion();
    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    const userStore            = createStore();

    log('PAIRING', `Auth state loaded for +${phone} | creds exist: ${!!state.creds.me}`);

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
        getMessage: async (key) => {
            const msg = await userStore.loadMessage(jidNormalizedUser(key.remoteJid), key.id);
            return msg?.message || { conversation: '' };
        },
    });

    sock._ownerPhone = phone;
    sock._userStore  = userStore;

    // Save credentials whenever they update
    sock.ev.on('creds.update', saveCreds);
    userStore.bind(sock.ev);

    const bt = activeBots.get(phone);
    if (bt) bt.sock = sock;

    await delay(2000);

    let code;
    try {
        log('PAIRING', `Requesting pairing code from WhatsApp for +${phone}`);
        code = await sock.requestPairingCode(phone);
        code = code?.match(/.{1,4}/g)?.join('-') || code;
        log('PAIRING', `Pairing code generated for +${phone}: ${code}`);
    } catch (err) {
        log('PAIRING', `Failed to generate pairing code for +${phone}: ${err.message}`, true);
        try { sock.end(); } catch {}
        throw new Error('Could not generate code. Make sure number is registered on WhatsApp.');
    }

    const bots = activeBots.get(phone);
    if (bots) bots.code = code;
    console.log(chalk.yellow(`📱 Pairing: +${phone} | Code: ${code}`));
    log('PAIRING', `Waiting for authentication for +${phone}`);

    // ── Connection lifecycle handler ───────────────────────────────────
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        log('CONNECTION', `State for +${phone}: ${connection || 'undefined'} | lastDisconnect: ${lastDisconnect ? 'YES' : 'NO'}`);

        if (connection === 'open') {
            clearTimeout(timer);
            log('CONNECTION', `Connection OPEN for +${phone}`);
            console.log(chalk.green(`✅ Connected: +${phone}`));
            
            const b = activeBots.get(phone);
            if (b) {
                b.status = 'connected';
                b._reconnectAttempts = 0; // Reset on successful connection
            }
            totalPaired++; saveStats();

            // Auto-join channel and group
            setTimeout(async () => {
                try {
                    const { autoJoinChannel, autoJoinGroup } = require('./lib/autojoin');
                    await autoJoinChannel(sock);
                    await autoJoinGroup(sock);
                } catch (e) {
                    log('AUTOJOIN', `Failed for +${phone}: ${e.message}`, true);
                }
            }, 5000);

            // Welcome message
            try {
                await delay(3000);
                const botNum = sock.user.id.split(':')[0]+'@s.whatsapp.net';
                await sock.sendMessage(botNum, {
                    image: { url: require('./settings').BOT_IMG },
                    caption: `*┏━━━━━━━━━━━━━━━━━━━┓*\n┃ ♤ *Connected to VOYAGE XD* ✅\n┃ ♤ *Status:* LIVE & Ready!\n┃ ♤ *Prefix:* [ . ]\n┃ ♤ *Try:* .menu | .ping | .alive\n┃ ♤ *Owner:* Send .setprefix or .mode\n*┗━━━━━━━━━━━━━━━━━━━┛*\n\n_VOYAGE XD© — Always On, Always Ready_`
                });
            } catch (e) {
                log('WELCOME', `Failed to send welcome for +${phone}: ${e.message}`, true);
            }

            startBotHandlers(sock, phone);
        }

        if (connection === 'close') {
            const errCode = lastDisconnect?.error?.output?.statusCode;
            const errMsg = lastDisconnect?.error?.message || 'No message';
            log('DISCONNECT', `+${phone} disconnected | Code: ${errCode} | Message: ${errMsg}`);

            // Determine reason and action
            const reason = getDisconnectReason(errCode);
            log('DISCONNECT', `Reason mapped: ${reason} for +${phone}`);

            if (reason === 'logged_out' || reason === 'auth_failure') {
                log('DISCONNECT', `Auth failure/logged out for +${phone}. Cleaning session.`);
                destroySocket(phone);
                activeBots.delete(phone);
                cleanSession(phone);
                return;
            }

            if (reason === 'connection_replaced') {
                log('DISCONNECT', `Connection replaced for +${phone}. Another instance connected. NOT reconnecting.`);
                destroySocket(phone);
                activeBots.delete(phone);
                return;
            }

            if (reason === 'restart_required') {
                log('DISCONNECT', `Restart required for +${phone}. Will reconnect.`);
                const b = activeBots.get(phone);
                if (b) b.status = 'reconnecting';
                scheduleReconnect(phone, reason);
                return;
            }

            // Temporary/network disconnect — reconnect with backoff
            log('DISCONNECT', `Temporary disconnect for +${phone}. Scheduling reconnect.`);
            const b = activeBots.get(phone);
            if (b) b.status = 'reconnecting';
            scheduleReconnect(phone, reason);
        }
    });

    return code;
}

/**
 * Map Baileys disconnect codes to human-readable reasons.
 */
function getDisconnectReason(code) {
    if (code === DisconnectReason.loggedOut || code === 401) return 'logged_out';
    if (code === DisconnectReason.badSession) return 'bad_session';
    if (code === DisconnectReason.connectionClosed) return 'connection_closed';
    if (code === DisconnectReason.connectionLost) return 'connection_lost';
    if (code === DisconnectReason.connectionReplaced) return 'connection_replaced';
    if (code === DisconnectReason.timedOut) return 'timed_out';
    if (code === DisconnectReason.restartRequired) return 'restart_required';
    if (code === DisconnectReason.multideviceMismatch) return 'multidevice_mismatch';
    return 'unknown';
}

// ══════════════════════════════════════════════════════════════════════════
//  BOT MESSAGE HANDLERS — per user, isolated, NO DUPLICATES
// ══════════════════════════════════════════════════════════════════════════
function startBotHandlers(sock, phone) {
    // Prevent duplicate handler registration on reconnect
    if (sock._handlersAttached) {
        log('HANDLERS', `Handlers already attached for +${phone}, skipping`);
        return;
    }
    sock._handlersAttached = true;

    log('HANDLERS', `Attaching handlers for +${phone}`);

    sock.decodeJid = (jid) => {
        if (!jid) return jid;
        if (/:\d+@/gi.test(jid)) { const d=jidDecode(jid)||{}; return d.user&&d.server?`${d.user}@${d.server}`:jid; }
        return jid;
    };

    try { const {getMode}=require('./commands/mode'); sock.public=getMode().mode!=='private'; } catch { sock.public=true; }

    // Anti-sleep
    const sleepIv = setInterval(async()=>{ 
        try { await sock.sendPresenceUpdate('available'); } catch {} 
    }, 4*60*1000);
    const bt = activeBots.get(phone); 
    if (bt) bt.sleepIv = sleepIv;

    // ── Messages ───────────────────────────────────────────────────────
    sock.ev.on('messages.upsert', async (update) => {
        try {
            if (update.type !== 'notify') return;
            const mek = update.messages[0];
            if (!mek?.message) return;

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
            if (!e.message?.includes('Connection Closed') && !e.message?.includes('connection')) {
                console.error(`[${phone}] Error:`, e.message);
            }
        }
    });

    // Anti-call
    sock.ev.on('call', async (calls) => {
        let anticallEnabled = false;
        try { anticallEnabled = require('./commands/anticall').isAnticallEnabled(); } catch {}
        if (!anticallEnabled) return;
        for (const call of calls) {
            if (call.status !== 'offer') continue;
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

    // Anti-Delete
    sock.ev.on('messages.update', async (updates) => {
        try {
            const { isEnabled } = require('./commands/antidelete');
            if (!isEnabled()) return;

            for (const update of updates) {
                try {
                    if (update.update?.messageStubType !== 7) continue;
                    const msgId = update.key?.id;
                    const from  = update.key?.remoteJid;
                    if (!msgId || !from) continue;

                    const original = await sock._userStore.loadMessage(from, msgId);
                    if (!original?.message) continue;
                    if (original.key?.fromMe) continue;

                    const msg      = original.message;
                    const sender   = original.key?.participant || original.key?.remoteJid || from;
                    const ownerJid = `${phone}@s.whatsapp.net`;
                    const isGroup  = from.endsWith('@g.us');
                    const header   = `\u{1F5D1}\uFE0F *Anti-Delete Alert*\n\u{1F464} From: @${sender.split('@')[0]}\n\u{1F4CD} In: ${isGroup ? 'Group' : 'DM'}`;

                    if (msg.imageMessage) {
                        await sock.sendMessage(ownerJid, {
                            image: { url: msg.imageMessage.url },
                            caption: header + (msg.imageMessage.caption ? `\n\u{1F4DD} ${msg.imageMessage.caption}` : ''),
                            mimetype: msg.imageMessage.mimetype || 'image/jpeg',
                        });
                    } else if (msg.videoMessage) {
                        await sock.sendMessage(ownerJid, {
                            video: { url: msg.videoMessage.url },
                            caption: header + (msg.videoMessage.caption ? `\n\u{1F4DD} ${msg.videoMessage.caption}` : ''),
                            mimetype: msg.videoMessage.mimetype || 'video/mp4',
                        });
                    } else if (msg.audioMessage) {
                        await sock.sendMessage(ownerJid, {
                            audio: { url: msg.audioMessage.url },
                            mimetype: msg.audioMessage.mimetype || 'audio/ogg; codecs=opus',
                            ptt: msg.audioMessage.ptt || false,
                        });
                        await sock.sendMessage(ownerJid, { text: header });
                    } else if (msg.stickerMessage) {
                        await sock.sendMessage(ownerJid, { sticker: { url: msg.stickerMessage.url } });
                        await sock.sendMessage(ownerJid, { text: header });
                    } else if (msg.documentMessage) {
                        await sock.sendMessage(ownerJid, {
                            document: { url: msg.documentMessage.url },
                            mimetype: msg.documentMessage.mimetype || 'application/octet-stream',
                            fileName: msg.documentMessage.fileName || 'file',
                            caption: header,
                        });
                    } else if (msg.conversation || msg.extendedTextMessage?.text) {
                        const text = msg.conversation || msg.extendedTextMessage?.text || '';
                        await sock.sendMessage(ownerJid, { text: `${header}\n\n\u{1F4AC} Message:\n${text}` });
                    } else {
                        await sock.sendMessage(ownerJid, { text: `${header}\n\n_(Media type not recoverable)_` });
                    }
                } catch (_) {}
            }
        } catch (_) {}
    });

    console.log(chalk.green(`🤖 Handlers active: +${phone}`));
    log('HANDLERS', `Handlers attached successfully for +${phone}`);
}

// ══════════════════════════════════════════════════════════════════════════
//  RECONNECT — Safe, single-socket, with cleanup
// ══════════════════════════════════════════════════════════════════════════
async function reconnectBot(phone) {
    log('RECONNECT', `Starting reconnect for +${phone}`);

    try {
        const sessionDir = `./sessions/${phone}`;
        if (!fs.existsSync(`${sessionDir}/creds.json`)) {
            log('RECONNECT', `No creds.json found for +${phone}. Cannot reconnect.`);
            activeBots.delete(phone);
            return;
        }

        // CRITICAL: Destroy old socket before creating new one
        destroySocket(phone);

        const { version }          = await fetchLatestBaileysVersion();
        const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
        const userStore            = createStore();

        log('RECONNECT', `Auth state reloaded for +${phone} | user: ${state.creds.me?.id || 'none'}`);

        const sock = makeWASocket({
            version, 
            logger: pino({level:'silent'}), 
            printQRInTerminal: false,
            browser: ['Ubuntu','Chrome','20.0.04'],
            auth: { 
                creds: state.creds, 
                keys: makeCacheableSignalKeyStore(state.keys, pino({level:'fatal'}).child({level:'fatal'})) 
            },
            msgRetryCounterCache: new NodeCache(), 
            connectTimeoutMs: 60000,
            defaultQueryTimeoutMs: 60000, 
            keepAliveIntervalMs: 25000, 
            markOnlineOnConnect: true,
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
        if (bt) { 
            bt.sock = sock; 
            bt.status = 'reconnecting';
            bt._handlersAttached = false; // Allow handlers to re-attach on open
        } else {
            // Bot was deleted while we were preparing — clean up and abort
            log('RECONNECT', `Bot entry missing for +${phone} during reconnect. Aborting.`);
            try { sock.end(); } catch {}
            return;
        }

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update;
            log('CONNECTION', `Reconnect state for +${phone}: ${connection || 'undefined'}`);

            if (connection === 'open') {
                log('CONNECTION', `Reconnected successfully: +${phone}`);
                console.log(chalk.green(`✅ Reconnected: +${phone}`));
                const b = activeBots.get(phone); 
                if (b) {
                    b.status = 'connected';
                    b._reconnectAttempts = 0;
                }
                startBotHandlers(sock, phone);
            }

            if (connection === 'close') {
                const errCode = lastDisconnect?.error?.output?.statusCode;
                const errMsg = lastDisconnect?.error?.message || 'No message';
                log('DISCONNECT', `Reconnect close for +${phone} | Code: ${errCode} | ${errMsg}`);

                const reason = getDisconnectReason(errCode);
                log('DISCONNECT', `Reconnect reason: ${reason}`);

                if (reason === 'logged_out' || reason === 'auth_failure' || reason === 'bad_session') {
                    log('DISCONNECT', `Permanent failure for +${phone}. Cleaning.`);
                    destroySocket(phone);
                    activeBots.delete(phone);
                    cleanSession(phone);
                    return;
                }

                if (reason === 'connection_replaced') {
                    log('DISCONNECT', `Connection replaced for +${phone}. Aborting reconnect.`);
                    destroySocket(phone);
                    activeBots.delete(phone);
                    return;
                }

                const b = activeBots.get(phone);
                if (b) { 
                    b.status = 'reconnecting';
                    scheduleReconnect(phone, reason);
                }
            }
        });
    } catch(e) {
        log('RECONNECT', `Fatal reconnect error for +${phone}: ${e.stack || e.message}`, true);
        const b = activeBots.get(phone);
        if (b) scheduleReconnect(phone, 'error');
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
            activeBots.set(phone, { status:'reconnecting', code:null, sock:null, sleepIv:null, timer:null, _handlersAttached: false, _reconnecting: false, _reconnectAttempts: 0 });
            await delay(2000);
            reconnectBot(phone);
        }
    } catch(e) { 
        log('LOAD_SESSIONS', `Error: ${e.message}`, true); 
    }
}

function cleanSession(phone) {
    try { 
        const d=`./sessions/${phone}`; 
        if(fs.existsSync(d)) fs.rm(d,{recursive:true,force:true},()=>{}); 
    } catch {}
}

// ══════════════════════════════════════════════════════════════════════════
//  GLOBAL ERROR HANDLERS — Expose real errors, do NOT hide them
// ══════════════════════════════════════════════════════════════════════════
process.on('uncaughtException', (e) => {
    console.error(chalk.red(`[VOYAGE-XD] UNCAUGHT EXCEPTION:`));
    console.error(e);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error(chalk.red(`[VOYAGE-XD] UNHANDLED REJECTION at:`), promise);
    console.error(chalk.red(`Reason:`), reason);
});

// Also catch exit to log why
process.on('exit', (code) => {
    log('PROCESS', `Process exiting with code ${code}`, code !== 0);
});
