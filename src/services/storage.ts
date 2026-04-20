import Dexie, { type Table } from "dexie";
import type { Highlight, Annotation } from "@/types";

interface BibleCacheRow {
  cacheKey: string;
  data: string;
  createdAt: string;
}

class GCDatabase extends Dexie {
  highlights!: Table<Highlight>;
  annotations!: Table<Annotation>;
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

// ── Highlights ────────────────────────────────────────────

export async function getHighlightsByLesson(lessonId: string): Promise<Highlight[]> {
  return getDb().highlights
    .where("lessonId")
    .equals(lessonId)
    .sortBy("blockIndex");
}

export async function insertHighlight(h: Highlight): Promise<void> {
  await getDb().highlights.put(h);
}

export async function deleteHighlight(id: string): Promise<void> {
  const db = getDb();
  await db.annotations.where("highlightId").equals(id).delete();
  await db.highlights.delete(id);
}

// ── Annotations ───────────────────────────────────────────

export async function getAnnotationByHighlight(highlightId: string): Promise<Annotation | null> {
  const result = await getDb().annotations
    .where("highlightId")
    .equals(highlightId)
    .first();
  return result ?? null;
}

export async function getAllAnnotations(): Promise<(Annotation & { lessonId: string; color: string })[]> {
  const db = getDb();
  const annotations = await db.annotations.orderBy("createdAt").reverse().toArray();
  const result: (Annotation & { lessonId: string; color: string })[] = [];
  for (const a of annotations) {
    const h = await db.highlights.get(a.highlightId);
    if (h) result.push({ ...a, lessonId: h.lessonId, color: h.color });
  }
  return result;
}

export async function upsertAnnotation(a: Annotation): Promise<void> {
  await getDb().annotations.put(a);
}

// ── Bible Cache ───────────────────────────────────────────

export async function getCachedBibleVerses(cacheKey: string): Promise<string | null> {
  const row = await getDb().bibleCache.get(cacheKey);
  return row?.data ?? null;
}

export async function cacheBibleVerses(cacheKey: string, data: string): Promise<void> {
  await getDb().bibleCache.put({ cacheKey, data, createdAt: new Date().toISOString() });
}
