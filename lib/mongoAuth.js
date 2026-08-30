/**
 * VOYAGE XD — MongoDB Auth State Adapter
 * Provides persistent Baileys auth state for Render Free (no persistent disk)
 * Falls back gracefully if MongoDB is unavailable
 */

const { MongoClient } = require('mongodb');
const { initAuthCreds, BufferJSON } = require('@crysnovax/baileys');

const MONGO_URI = process.env.MONGODB_URI;
const DB_NAME   = process.env.MONGODB_DB_NAME || 'voyage_xd';

let client = null;
let db = null;
let connecting = false;

// ── Buffer-aware serialize / deserialize ─────────────────────────────────
function serialize(data) {
    return JSON.parse(JSON.stringify(data, BufferJSON.replacer));
}

function deserialize(data) {
    return JSON.parse(JSON.stringify(data), BufferJSON.reviver);
}

// ── MongoDB connection (singleton) ───────────────────────────────────────
async function getDb() {
    if (db) return db;
    if (!MONGO_URI) throw new Error('MONGODB_URI not configured');
    if (connecting) {
        while (connecting) await new Promise(r => setTimeout(r, 100));
        return db;
    }
    connecting = true;
    try {
        client = new MongoClient(MONGO_URI, {
            maxPoolSize: 5,
            serverSelectionTimeoutMS: 10000
        });
        await client.connect();
        db = client.db(DB_NAME);
        console.log('[VOYAGE-XD] MongoDB connected');
        return db;
    } catch (e) {
        console.error('[VOYAGE-XD] MongoDB connection failed:', e.message);
        throw e;
    } finally {
        connecting = false;
    }
}

// ── Check if a session exists for this phone ─────────────────────────────
async function hasMongoSession(phone) {
    const database = await getDb();
    const doc = await database.collection('auth_creds').findOne({ phone });
    return !!(doc && doc.data);
}

// ── Get raw creds (for .session command) ─────────────────────────────────
async function getSessionCreds(phone) {
    const database = await getDb();
    const doc = await database.collection('auth_creds').findOne({ phone });
    if (doc && doc.data) return deserialize(doc.data);
    return null;
}

// ── Delete all auth data for a phone ─────────────────────────────────────
async function deleteSession(phone) {
    const database = await getDb();
    await database.collection('auth_creds').deleteOne({ phone });
    await database.collection('auth_keys').deleteMany({ phone });
}

// ── List all phones with stored sessions ─────────────────────────────────
async function listSessions() {
    const database = await getDb();
    const docs = await database.collection('auth_creds').find({}).toArray();
    return docs.map(d => d.phone).filter(Boolean);
}

// ── Main auth state provider (replaces useMultiFileAuthState) ────────────
async function useMongoAuthState(phone) {
    const database = await getDb();
    const credsColl = database.collection('auth_creds');
    const keysColl  = database.collection('auth_keys');

    // Load existing creds or initialize fresh
    let creds = {};
    const existing = await credsColl.findOne({ phone });
    if (existing && existing.data) {
        creds = deserialize(existing.data);
    } else {
        creds = initAuthCreds();
        await credsColl.insertOne({
            phone,
            data: serialize(creds),
            createdAt: new Date()
        });
    }

    // Creds update handler
    const saveCreds = async (data) => {
        const toSave = data || creds;
        await credsColl.updateOne(
            { phone },
            { $set: { data: serialize(toSave), updatedAt: new Date() } },
            { upsert: true }
        );
    };

    // Signal key store (preKey, session, senderKey, appStateSyncKey, etc.)
    const keys = {
        get: async (type, ids) => {
            if (!ids || ids.length === 0) return {};
            const docs = await keysColl
                .find({ phone, type, id: { $in: ids } })
                .toArray();
            const result = {};
            for (const doc of docs) {
                result[doc.id] = deserialize(doc.data);
            }
            return result;
        },
        set: async (data) => {
            const ops = [];
            for (const [type, ids] of Object.entries(data)) {
                for (const [id, value] of Object.entries(ids)) {
                    ops.push({
                        updateOne: {
                            filter: { phone, type, id },
                            update: { $set: { data: serialize(value), updatedAt: new Date() } },
                            upsert: true
                        }
                    });
                }
            }
            if (ops.length > 0) {
                await keysColl.bulkWrite(ops, { ordered: false });
            }
        },
        del: async (type, ids) => {
            if (!ids || ids.length === 0) return;
            await keysColl.deleteMany({ phone, type, id: { $in: ids } });
        },
        clear: async () => {
            await keysColl.deleteMany({ phone });
        }
    };

    return { state: { creds, keys }, saveCreds };
}

module.exports = {
    useMongoAuthState,
    hasMongoSession,
    getSessionCreds,
    deleteSession,
    listSessions,
    getDb
};
