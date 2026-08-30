# VOYAGE XD v4.1.0

> 🤖 **Multi-User WhatsApp Bot** — 150+ commands, AI-powered, group admin tools, media downloads, and more.

[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20.0.0-339933?logo=node.js)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## ✨ Features

- **Multi-User** — Each WhatsApp number gets its own isolated session
- **150+ Commands** — AI, downloads, group admin, fun, media tools, anime, religion, and more
- **Auto-Reconnect** — Sessions survive server restarts with controlled backoff
- **Web Dashboard** — Pair your number via a clean web interface
- **Group Administration** — Kick, promote, demote, mute, antilink, welcome/goodbye, warnings
- **Media Downloads** — YouTube, TikTok, Instagram, Twitter, Facebook, Spotify
- **AI Powered** — Chat with AI, DeepSeek, translations
- **Anti-Features** — Anti-delete, anti-viewonce, anti-call, anti-spam, anti-badword
- **Always Online** — Keep your presence active
- **Secure** — No hard-coded API keys; all secrets via environment variables

---

## 🚀 Quick Deploy

### Render (Recommended)

1. Fork this repo to your GitHub
2. Create a new **Web Service** on [render.com](https://render.com)
3. Connect your forked repo
4. Set environment variables (see below)
5. Build: `npm install` | Start: `npm start`

### Railway

1. Fork this repo
2. Create a new project on [railway.app](https://railway.app)
3. Deploy from GitHub
4. Set environment variables

### Local / Termux

```bash
# Clone
git clone https://github.com/yourusername/VOYAGE.git
cd VOYAGE

# Install
npm install

# Create .env (see .env.example)
cp .env.example .env
# Edit .env with your values

# Start
npm start
