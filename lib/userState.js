/**
 * VOYAGE XD — Per-User State Manager
 * ────────────────────────────────────────────────────────────────
 * Multi-user foundation: every connected WhatsApp account (session)
 * gets its own isolated, persisted key/value store, keyed by that
 * account's phone number/JID (sock._ownerPhone).
 *
 * Storage: one JSON file per user under data/users/<id>.json — so:
 *   - User A's settings can never overwrite User B's (separate files)
 *   - Restarting the server does not touch unrelated users' data
 *   - No global variables are used for per-user values
 *
 * This intentionally reuses the project's existing pattern (flat
 * JSON files under ./data) rather than introducing a database
 * dependency, just scoped per user instead of shared globally.
 *
 * Usage:
 *   const userState = require('./lib/userState');
 *   userState.getPrefix(sock._ownerPhone, settings.prefix);
 *   userState.setPrefix(sock._ownerPhone, '!');
 *   userState.get(sock._ownerPhone, 'someSetting', defaultValue);
 *   userState.set(sock._ownerPhone, 'someSetting', value);
 */
const fs = require('fs');
const path = require('path');

const USERS_DIR = path.join(process.cwd(), 'data', 'users');
if (!fs.existsSync(USERS_DIR)) fs.mkdirSync(USERS_DIR, { recursive: true });

// In-memory cache of users[userId] -> state object, lazily hydrated
// from disk and written back on every change. Never assign to a
// bare "global"/module-level singleton object keyed by nothing —
// every read/write below is scoped by userId.
const users = new Map();

function normalizeUserId(userId) {
    if (!userId) return '_default';
    // Keep it filesystem-safe; WhatsApp JIDs/phone numbers only use
    // digits, '@', '.', ':' — strip anything else defensively.
    return String(userId).replace(/[^0-9a-zA-Z_.:@-]/g, '_');
}

function filePathFor(id) {
    return path.join(USERS_DIR, `${id}.json`);
}

function load(userId) {
    const id = normalizeUserId(userId);
    if (users.has(id)) return users.get(id);

    let data = {};
    try {
        const fp = filePathFor(id);
        if (fs.existsSync(fp)) data = JSON.parse(fs.readFileSync(fp, 'utf8'));
    } catch (e) {
        console.warn(`[userState] failed to read state for "${id}", starting fresh:`, e.message);
        data = {};
    }
    users.set(id, data);
    return data;
}

function persist(userId) {
    const id = normalizeUserId(userId);
    const data = users.get(id) || {};
    try {
        fs.writeFileSync(filePathFor(id), JSON.stringify(data, null, 2));
    } catch (e) {
        console.error(`[userState] failed to save state for "${id}":`, e.message);
    }
}

/** Get a single value for a user, or defaultValue if unset. */
function get(userId, key, defaultValue) {
    const data = load(userId);
    return Object.prototype.hasOwnProperty.call(data, key) ? data[key] : defaultValue;
}

/** Set a single value for a user and persist it immediately. */
function set(userId, key, value) {
    const id = normalizeUserId(userId);
    const data = load(id);
    data[key] = value;
    users.set(id, data);
    persist(id);
    return value;
}

/** Get a shallow copy of everything stored for a user. */
function getAll(userId) {
    return { ...load(userId) };
}

/** Remove a single key for a user. */
function remove(userId, key) {
    const id = normalizeUserId(userId);
    const data = load(id);
    delete data[key];
    users.set(id, data);
    persist(id);
}

/** Wipe all stored state for a user (e.g. on logout/session delete). */
function clear(userId) {
    const id = normalizeUserId(userId);
    users.set(id, {});
    persist(id);
}

// ── Convenience helpers for the most common per-user setting ──────
function getPrefix(userId, fallback) {
    return get(userId, 'prefix', fallback);
}
function setPrefix(userId, prefix) {
    return set(userId, 'prefix', prefix);
}

module.exports = {
    get, set, getAll, remove, clear,
    getPrefix, setPrefix,
    normalizeUserId,
};
