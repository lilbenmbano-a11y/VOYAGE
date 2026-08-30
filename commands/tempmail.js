/**
 * Temporary Email Generator
 * Usage: .tempmail
 * Creates a disposable email and monitors inbox for 10 minutes
 */
const axios  = require('axios');
const { reply } = require('./_helper');

module.exports = async (sock, chatId, message) => {
    await reply(sock, chatId, '📧 Creating temporary email...', message);

    try {
        class TempMail {
            constructor() { this.cookie = null; this.base = 'https://tempmail.so'; }
            async _req(url) {
                const res = await axios.get(url, { headers: { accept: 'application/json', cookie: this.cookie || '', referer: this.base + '/', 'x-inbox-lifespan': '600' } });
                if (res.headers['set-cookie']) this.cookie = res.headers['set-cookie'].join('; ');
                return res.data;
            }
            async init() { const res = await axios.get(this.base); if (res.headers['set-cookie']) this.cookie = res.headers['set-cookie'].join('; '); return this; }
            async inbox() { return this._req(`${this.base}/us/api/inbox?requestTime=${Date.now()}&lang=us`); }
            async msg(id)  { return this._req(`${this.base}/us/api/inbox/messagehtmlbody/${id}?requestTime=${Date.now()}&lang=us`); }
        }

        const mail  = new TempMail();
        await mail.init();
        const data  = await mail.inbox();
        const email = data?.data?.name;
        if (!email) throw new Error('Failed to create email');

        await sock.sendMessage(chatId, {
            text: `📩 *Temporary Email Created*\n\n📧 *Email:* ${email}\n⏱️ *Expires in:* 10 minutes\n📥 *Inbox:* empty\n\n💡 I'll notify you when new emails arrive!\n\n_VOYAGE XD©_`,
        }, { quoted: message });

        const seen = new Set();
        const interval = setInterval(async () => {
            try {
                const updated = await mail.inbox();
                const msgs    = updated?.data?.inbox || [];
                for (const m of msgs) {
                    if (seen.has(m.id)) continue;
                    seen.add(m.id);
                    const detail  = await mail.msg(m.id);
                    const content = (detail?.data?.html || '').replace(/<[^>]*>/g, '').trim().slice(0, 800);
                    await sock.sendMessage(chatId, {
                        text: `📬 *New Email!*\n\n👤 From: ${m.from || 'Unknown'}\n📌 Subject: ${m.subject || 'No subject'}\n\n📝 *Content:*\n${content || 'No content'}\n\n_VOYAGE XD©_`,
                    });
                }
            } catch {}
        }, 15000);

        setTimeout(() => {
            clearInterval(interval);
            sock.sendMessage(chatId, { text: `⏰ *Temp email* ${email} *has expired.*\n\n_VOYAGE XD©_` });
        }, 10 * 60 * 1000);

    } catch (e) {
        await reply(sock, chatId, `❌ Failed to create temporary email.`, message);
    }
};
