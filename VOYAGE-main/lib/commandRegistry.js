/**
 * VOYAGE XD — Command Registry
 * ────────────────────────────────────────────────────────────────
 * Loads the command metadata from lib/commandData.js and exposes a
 * single, queryable source of truth for:
 *   - the menu (grouped by department)
 *   - command lookup by name/alias
 *   - duplicate detection
 *
 * This module is metadata-only — it does NOT change how commands
 * are actually dispatched in main.js. main.js keeps its existing,
 * battle-tested switch/require setup (see Update 1 report for why),
 * this registry just describes that same set of commands in one
 * place so the menu no longer has to be hand-maintained.
 */
const { CATEGORIES, CATEGORY_ORDER, COMMANDS } = require('./commandData');

class CommandRegistry {
    constructor() {
        this.byName = new Map();   // canonical name -> entry
        this.aliasMap = new Map(); // any alias/name -> canonical name
        this.duplicates = [];      // { token, keptFor, ignoredFrom }
        this._load();
    }

    _load() {
        for (const raw of COMMANDS) {
            this.register(raw);
        }
    }

    /**
     * Register a command entry. Safe to call at runtime too (e.g. a
     * future update loading commands dynamically) — duplicate names
     * or aliases are rejected rather than silently overwriting an
     * existing command.
     */
    register(entry) {
        const { name, aliases = [], category } = entry;

        if (!name) return false;
        if (!CATEGORIES[category]) {
            console.warn(`[commandRegistry] "${name}" has unknown category "${category}", skipping`);
            return false;
        }
        if (this.aliasMap.has(name)) {
            this.duplicates.push({ token: name, keptFor: this.aliasMap.get(name), ignoredFrom: name });
            console.warn(`[commandRegistry] duplicate command name "${name}" — keeping the first registration`);
            return false;
        }

        const finalAliases = [];
        for (const alias of aliases) {
            if (this.aliasMap.has(alias)) {
                this.duplicates.push({ token: alias, keptFor: this.aliasMap.get(alias), ignoredFrom: name });
                console.warn(`[commandRegistry] duplicate alias "${alias}" (wanted by "${name}", already used by "${this.aliasMap.get(alias)}") — skipping alias`);
                continue;
            }
            finalAliases.push(alias);
            this.aliasMap.set(alias, name);
        }

        this.aliasMap.set(name, name);
        this.byName.set(name, { ...entry, aliases: finalAliases });
        return true;
    }

    /** Resolve a typed command/alias (without prefix) to its registry entry, or null. */
    resolve(token) {
        if (!token) return null;
        const canonical = this.aliasMap.get(token.toLowerCase());
        return canonical ? this.byName.get(canonical) : null;
    }

    getAll() {
        return [...this.byName.values()];
    }

    getEnabled() {
        return this.getAll().filter(c => c.enabled !== false);
    }

    getByCategory(category) {
        return this.getEnabled().filter(c => c.category === category);
    }

    getCategories() {
        return CATEGORY_ORDER.map(key => ({ key, label: CATEGORIES[key] }));
    }

    getDuplicates() {
        return this.duplicates;
    }

    count() {
        return this.byName.size;
    }
}

// Singleton — the whole app shares one registry instance.
module.exports = new CommandRegistry();
