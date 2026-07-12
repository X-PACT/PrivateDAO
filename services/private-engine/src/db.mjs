import { existsSync } from "node:fs";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const collections = ["workflows", "policies", "organizations", "departments", "teams", "users", "roles", "receipts", "events"];

const emptyDatabase = () => ({ schema: "privatedao.private-engine.db.v2", createdAt: new Date().toISOString(), ...Object.fromEntries(collections.map((name) => [name, []])) });

export class LocalDatabase {
  constructor(dataDir) {
    this.dataDir = dataDir;
    this.mode = (process.env.PRIVATEDAO_DATABASE_MODE || (process.env.PRIVATEDAO_DATABASE_URL ? "postgres" : process.env.NODE_ENV === "production" ? "sqlite" : "json")).toLowerCase();
    this.path = process.env.PRIVATEDAO_DATABASE_FILE?.trim() || join(dataDir, "private-engine.json");
    this.sqlitePath = process.env.PRIVATEDAO_SQLITE_FILE?.trim() || join(dataDir, "private-engine.sqlite");
    this.queue = Promise.resolve();
    this.db = null;
    this.pool = null;
    this.ready = this.initialize();
  }

  async initialize() {
    await mkdir(this.dataDir, { recursive: true });
    if (this.mode === "sqlite") {
      const { DatabaseSync } = await import("node:sqlite");
      this.db = new DatabaseSync(this.sqlitePath);
      this.db.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; CREATE TABLE IF NOT EXISTS engine_records (collection TEXT NOT NULL, record_id TEXT NOT NULL, value_json TEXT NOT NULL, created_at TEXT NOT NULL, PRIMARY KEY(collection, record_id)); CREATE TABLE IF NOT EXISTS engine_meta (key TEXT PRIMARY KEY, value TEXT NOT NULL); CREATE TABLE IF NOT EXISTS engine_migrations (version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL);");
      this.db.prepare("INSERT OR IGNORE INTO engine_migrations(version, applied_at) VALUES (?, ?)").run(2, new Date().toISOString());
      return;
    }
    if (this.mode === "postgres") {
      let pg;
      try { pg = await import("pg"); } catch { throw new Error("PostgreSQL mode requires the optional pg dependency. Install pg before starting the engine."); }
      this.pool = new pg.Pool({ connectionString: process.env.PRIVATEDAO_DATABASE_URL });
      await this.pool.query("CREATE TABLE IF NOT EXISTS private_engine_records (collection TEXT NOT NULL, record_id TEXT NOT NULL, value_json JSONB NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), PRIMARY KEY(collection, record_id)); CREATE TABLE IF NOT EXISTS private_engine_migrations (version INTEGER PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now()); INSERT INTO private_engine_migrations(version) VALUES (2) ON CONFLICT (version) DO NOTHING");
      return;
    }
  }

  async read() {
    await this.ready;
    if (this.mode === "sqlite") {
      const rows = this.db.prepare("SELECT collection, value_json FROM engine_records ORDER BY created_at ASC").all();
      const result = emptyDatabase();
      for (const row of rows) if (result[row.collection]) result[row.collection].push(JSON.parse(row.value_json));
      return result;
    }
    if (this.mode === "postgres") {
      const { rows } = await this.pool.query("SELECT collection, value_json FROM private_engine_records ORDER BY created_at ASC");
      const result = emptyDatabase();
      for (const row of rows) if (result[row.collection]) result[row.collection].push(row.value_json);
      return result;
    }
    if (!existsSync(this.path)) return emptyDatabase();
    try { return { ...emptyDatabase(), ...JSON.parse(await readFile(this.path, "utf8")) }; }
    catch { throw new Error("Local JSON database is unreadable. Refusing to overwrite it."); }
  }

  async replaceDatabase(next) {
    await this.ready;
    if (this.mode === "sqlite") {
      this.db.exec("BEGIN");
      try {
        for (const collection of collections) {
          this.db.prepare("DELETE FROM engine_records WHERE collection = ?").run(collection);
          for (const value of next[collection] || []) {
            const recordId = String(value.id || value.workflowId || value.policyId || value.organizationId || value.userId || value.proofId || `${collection}_${Math.random().toString(36).slice(2)}`);
            this.db.prepare("INSERT INTO engine_records(collection, record_id, value_json, created_at) VALUES (?, ?, ?, ?)").run(collection, recordId, JSON.stringify(value), String(value.createdAt || new Date().toISOString()));
          }
        }
        this.db.exec("COMMIT");
      } catch (error) { this.db.exec("ROLLBACK"); throw error; }
      return next;
    }
    if (this.mode === "postgres") {
      const client = await this.pool.connect();
      try {
        await client.query("BEGIN");
        for (const collection of collections) {
          await client.query("DELETE FROM private_engine_records WHERE collection = $1", [collection]);
          for (const value of next[collection] || []) {
            const recordId = String(value.id || value.workflowId || value.policyId || value.organizationId || value.userId || value.proofId || `${collection}_${Math.random().toString(36).slice(2)}`);
            await client.query("INSERT INTO private_engine_records(collection, record_id, value_json, created_at) VALUES ($1, $2, $3::jsonb, $4)", [collection, recordId, JSON.stringify(value), value.createdAt || new Date().toISOString()]);
          }
        }
        await client.query("COMMIT");
      } catch (error) { await client.query("ROLLBACK"); throw error; } finally { client.release(); }
      return next;
    }
    await mkdir(dirname(this.path), { recursive: true });
    const tempPath = `${this.path}.tmp`;
    await writeFile(tempPath, JSON.stringify(next, null, 2), { mode: 0o600 });
    await rename(tempPath, this.path);
    return next;
  }

  async mutate(mutator) {
    this.queue = this.queue.then(async () => this.replaceDatabase(await mutator(await this.read())));
    return this.queue;
  }

  async insert(collection, value) {
    await this.mutate((database) => ({ ...database, [collection]: [...(database[collection] || []), value] }));
    return value;
  }

  async update(collection, predicate, updater) {
    let updated = null;
    await this.mutate((database) => ({ ...database, [collection]: (database[collection] || []).map((item) => { if (!predicate(item)) return item; updated = updater(item); return updated; }) }));
    return updated;
  }

  async list(collection) { return (await this.read())[collection] || []; }
  async find(collection, predicate) { return (await this.list(collection)).find(predicate) || null; }
}
