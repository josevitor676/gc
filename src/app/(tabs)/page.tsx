"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Play, X, Star, SearchX } from "lucide-react";
import { useStudies } from "@/hooks/useStudies";
import StudyCard from "@/components/StudyCard";
import EstadoVazio from "@/components/EstadoVazio";
import { useTheme } from "@/contexts/ThemeContext";
import { CATEGORIAS, getCategoria } from "@/data/estudos/categorias";
import { getFavoritos } from "@/lib/favoritos";
import { getUltimaLicao, getProgressoEstudo } from "@/lib/progresso-licao";
import { getLessonById, getStudyById } from "@/services/studies";

function normalizar(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

function ContinueCard() {
  const { colors } = useTheme();
  const ultima = getUltimaLicao();
  if (!ultima) return null;

  const study = getStudyById(ultima.studyId);
  const lesson = study ? getLessonById(ultima.studyId, ultima.lessonId) : null;
  if (!study || !lesson) return null;

  const cat = getCategoria(study.id);
  const total = study.lessons.length;
  const lidas = getProgressoEstudo(
    study.id,
    study.lessons.map((l) => l.id),
  );

  return (
    <Link
      href={`/study/${study.id}/lesson/${lesson.id}`}
      className="flex items-center gap-3 rounded-2xl border p-3 mb-5 active:scale-[0.99] transition-transform"
      style={{ backgroundColor: colors.card, borderColor: colors.border }}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: cat.tint, color: cat.ink }}
      >
        <Play size={20} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px]" style={{ color: colors.textMuted }}>
          Continue de onde parou
        </p>
        <p className="text-sm font-semibold truncate" style={{ color: colors.text }}>
          {study.title} · Estudo {lesson.order}
        </p>
        <div className="mt-1.5 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: colors.border }}>
          <div
            className="h-full rounded-full"
            style={{ width: `${Math.max(6, (lidas / total) * 100)}%`, backgroundColor: cat.cover }}
          />
        </div>
      </div>
    </Link>
  );
}

export default function EstudosPage() {
  const { studies, loading, error } = useStudies();
  const { colors } = useTheme();
  const [query, setQuery] = useState("");
  const [categoria, setCategoria] = useState<string | null>(null);
  const [soFavoritos, setSoFavoritos] = useState(false);

  const filtrados = useMemo(() => {
    const q = normalizar(query.trim());
    const favs = soFavoritos ? new Set(getFavoritos()) : null;
    return studies.filter((s) => {
      if (favs && !favs.has(s.id)) return false;
      if (categoria && getCategoria(s.id).key !== categoria) return false;
      if (!q) return true;
      const alvo = normalizar(
        `${s.title} ${s.subtitle} ${s.author} ${getCategoria(s.id).label}`,
      );
      return alvo.includes(q);
    });
  }, [studies, query, categoria, soFavoritos]);

  return (
    <div className="px-5 py-6 max-w-2xl mx-auto md:max-w-3xl">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: colors.textMuted }}>
          Bem-vindo ao
        </p>
        <h2 className="text-2xl font-extrabold mt-1 leading-tight" style={{ color: colors.text }}>
          Grupos de Crescimento IPVO
        </h2>
      </div>

      {/* Busca */}
      <div
        className="flex items-center gap-2 rounded-xl px-3 mb-4"
        style={{ backgroundColor: colors.surfaceAlt }}
      >
        <Search size={18} color={colors.textMuted} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar estudo, tema ou livro…"
          className="flex-1 bg-transparent py-2.5 text-sm outline-none"
          style={{ color: colors.text }}
          aria-label="Buscar estudo"
        />
        {query && (
          <button onClick={() => setQuery("")} aria-label="Limpar busca" className="p-1">
            <X size={16} color={colors.textMuted} />
          </button>
        )}
      </div>

      {!loading && !error && <ContinueCard />}

      {/* Categorias */}
      <div className="flex flex-wrap gap-2 mb-5">
        <button
          onClick={() => { setCategoria(null); setSoFavoritos(false); }}
          className="text-xs font-semibold rounded-full px-3 py-1.5 transition-colors"
          style={{
            backgroundColor: categoria === null && !soFavoritos ? colors.primary : colors.surfaceAlt,
            color: categoria === null && !soFavoritos ? "#fff" : colors.textSecondary,
          }}
        >
          Todos
        </button>
        <button
          onClick={() => setSoFavoritos((v) => !v)}
          className="inline-flex items-center gap-1 text-xs font-semibold rounded-full px-3 py-1.5 transition-colors"
          style={{
            backgroundColor: soFavoritos ? "#D4537E" : colors.surfaceAlt,
            color: soFavoritos ? "#fff" : colors.textSecondary,
          }}
        >
          <Star size={13} fill={soFavoritos ? "#fff" : "none"} />
          Favoritos
        </button>
        {CATEGORIAS.map((c) => {
          const ativo = categoria === c.key;
          return (
            <button
              key={c.key}
              onClick={() => setCategoria(ativo ? null : c.key)}
              className="text-xs font-semibold rounded-full px-3 py-1.5 transition-colors"
              style={{
                backgroundColor: ativo ? c.cover : colors.surfaceAlt,
                color: ativo ? "#fff" : colors.textSecondary,
              }}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex justify-center mt-12" role="status" aria-label="Carregando estudos...">
          <div
            className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: colors.primaryLight, borderTopColor: "transparent" }}
          />
        </div>
      ) : error ? (
        <div className="flex justify-center mt-12">
          <p className="text-sm text-center" style={{ color: colors.textMuted }}>
            {error}
          </p>
        </div>
      ) : filtrados.length === 0 ? (
        soFavoritos ? (
          <EstadoVazio
            icon={Star}
            titulo="Nenhum favorito ainda"
            descricao="Toque na estrela de um estudo para salvá-lo aqui e encontrá-lo rápido."
            acaoLabel="Ver todos os estudos"
            onAcao={() => setSoFavoritos(false)}
          />
        ) : (
          <EstadoVazio
            icon={SearchX}
            titulo="Nenhum estudo encontrado"
            descricao="Tente outro termo ou veja todos os estudos por categoria."
            acaoLabel={query || categoria ? "Limpar filtros" : undefined}
            onAcao={() => { setQuery(""); setCategoria(null); }}
          />
        )
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filtrados.map((study) => (
            <StudyCard key={study.id} study={study} />
          ))}
        </div>
      )}
    </div>
  );
}
