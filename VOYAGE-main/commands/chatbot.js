/**
 * VOYAGE XD — Chatbot
 * Uses same API as Cypher MD: apis.davidcyril.name.ng/ai/gpt3
 * .chatbot on/off  → per-chat (group or DM)
 * .chatbot dm on/off → all DMs (owner only)
 * .chatbot status  → show current state
 */
const fs    = require('fs');
const https = require('https');
const { checkAdmin, reply, getSender, getIsOwner } = require('./_helper');

const FILE = './data/chatbot.json';
const SIG  = '\n\n_Voyage XD\u2664C\u00a9_';

function load() {
    try { return JSON.parse(fs.readFileSync(FILE, 'utf8')); }
    catch { return { groups: {}, dms: false }; }
}
function save(d) { fs.writeFileSync(FILE, JSON.stringify(d, null, 2)); }

// ── Same API Cypher uses ──────────────────────────────────────────────────
function askGPT(text) {
    return new Promise((resolve) => {
        const url = 'https://apis.davidcyril.name.ng/ai/gpt3?text=' + encodeURIComponent(text);
        https.get(url, { headers: { 'User-Agent': 'VOYAGEXD/4.0' } }, res => {
            let d = '';
            res.on('data', c => d += c);
            res.on('end', () => {
                try {
                    const j = JSON.parse(d);
                    resolve(j?.message || j?.reply || j?.result || j?.text || null);
                } catch { resolve(null); }
            });
        }).on('error', () => resolve(null));
    });
}

// ── .chatbot command ──────────────────────────────────────────────────────
async function chatbotCommand(sock, chatId, message, args) {
    const sender  = getSender(sock, message);
    const isOwner = getIsOwner(sock);
    const isGroup = chatId.endsWith('@g.us');
    const d       = load();
    const sub     = (args[0] || '').toLowerCase();

    // No args → show status
    if (!sub) {
        const here = isGroup ? (d.groups[chatId] ? '✅ ON' : '❌ OFF')
                             : (d.dms ? '✅ ON' : '❌ OFF');
        return reply(sock, chatId,
`*---🤖 CHATBOT---*
  Status here: *${here}*
  DM mode: *${d.dms ? '✅ ON' : '❌ OFF'}*

  .chatbot on      — enable in this chat
  .chatbot off     — disable in this chat
  .chatbot dm on   — enable for all DMs
  .chatbot dm off  — disable DMs
  .chatbot status  — show this menu` + SIG, message);
    }

    if (sub === 'status') {
        const active = Object.entries(d.groups).filter(([,v])=>v).map(([k])=>k.replace('@g.us','')).join(', ') || 'None';
        return reply(sock, chatId,
`*---🤖 CHATBOT STATUS---*
  DM mode: *${d.dms ? '✅ ON' : '❌ OFF'}*
  Active groups: ${active}` + SIG, message);
    }

    // DM toggle — owner only
    if (sub === 'dm') {
        if (!await isOwner(sender, sock, chatId))
            return reply(sock, chatId, '❌ *Owner only.*' + SIG, message);
        const act = (args[1] || '').toLowerCase();
        if (act === 'on')  { d.dms = true;  save(d); return reply(sock, chatId, '🤖 *Chatbot DM »* ON ✅\n  Auto-replying all DMs!' + SIG, message); }
        if (act === 'off') { d.dms = false; save(d); return reply(sock, chatId, '🤖 *Chatbot DM »* OFF ❌' + SIG, message); }
        return reply(sock, chatId, '❌ Usage: .chatbot dm on/off' + SIG, message);
    }

    // Group on/off — admin only
    if (sub === 'on') {
        if (isGroup) {
            if (!await checkAdmin(sock, chatId, message))
                return reply(sock, chatId, '❌ *Admins only.*' + SIG, message);
            d.groups[chatId] = true; save(d);
            return reply(sock, chatId,
`*---🤖 CHATBOT---*
  ✅ Enabled in *this group!*
  Bot will auto-reply every message using AI.
  Use .chatbot off to stop.` + SIG, message);
        } else {
            if (!await isOwner(sender, sock, chatId))
                return reply(sock, chatId, '❌ *Owner only for DMs.*' + SIG, message);
            d.dms = true; save(d);
            return reply(sock, chatId, '🤖 *Chatbot »* ON ✅' + SIG, message);
        }
    }

    if (sub === 'off') {
        if (isGroup) {
            if (!await checkAdmin(sock, chatId, message))
                return reply(sock, chatId, '❌ *Admins only.*' + SIG, message);
            d.groups[chatId] = false; save(d);
            return reply(sock, chatId, '🤖 *Chatbot »* OFF ❌ in this group.' + SIG, message);
        } else {
            if (!await isOwner(sender, sock, chatId))
                return reply(sock, chatId, '❌ *Owner only.*' + SIG, message);
            d.dms = false; save(d);
            return reply(sock, chatId, '🤖 *Chatbot »* OFF ❌' + SIG, message);
        }
    }

    reply(sock, chatId, '❌ Unknown option. Send .chatbot for help.' + SIG, message);
}

// ── handleChatbot — called on every incoming message from main.js ─────────
async function handleChatbot(sock, chatId, message, text) {
    try {
        if (!text || text.trim() === '') return;
        if (text.startsWith('.')) return;
        if (message.key.fromMe) return;
        if (chatId.endsWith('@newsletter') || chatId === 'status@broadcast') return;

        const isGroup = chatId.endsWith('@g.us');
        const d = load();

        if (isGroup  && !d.groups[chatId]) return;
        if (!isGroup && !d.dms) return;

        // Typing indicator
        try { await sock.sendPresenceUpdate('composing', chatId); } catch {}

        const answer = await askGPT(text);

        try { await sock.sendPresenceUpdate('paused', chatId); } catch {}

        if (!answer) return;

        await sock.sendMessage(chatId, { text: answer + SIG }, { quoted: message });

    } catch {}
}

module.exports = { chatbotCommand, handleChatbot };
