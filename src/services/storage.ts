import Dexie, { type Table } from "dexie";

interface BibleCacheRow {
  cacheKey: string;
  data: string;
  createdAt: string;
}

class GCDatabase extends Dexie {
  bibleCache!: Table<BibleCacheRow>;

  constructor() {
    super("gc-pwa-v1");
    this.version(1).stores({
      highlights: "id, lessonId, blockIndex",
      annotations: "id, highlightId",
      bibleCache: "cacheKey",
    });
  }
}

let _db: GCDatabase | null = null;

function getDb(): GCDatabase {
  if (!_db) _db = new GCDatabase();
  return _db;
}

// ── Bible Cache ───────────────────────────────────────────

const BIBLE_CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1_000; // 30 dias

export async function getCachedBibleVerses(cacheKey: string): Promise<string | null> {
  const row = await getDb().bibleCache.get(cacheKey);
  if (!row) return null;

  const age = Date.now() - new Date(row.createdAt).getTime();
  if (age > BIBLE_CACHE_TTL_MS) {
    await getDb().bibleCache.delete(cacheKey);
    return null;
  }

  return row.data;
}

export async function cacheBibleVerses(cacheKey: string, data: string): Promise<void> {
  await getDb().bibleCache.put({ cacheKey, data, createdAt: new Date().toISOString() });
}
