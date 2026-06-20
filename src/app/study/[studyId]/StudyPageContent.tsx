"use client";

import { useState, useEffect } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getStudyById } from "@/services/studies";
import { useTheme } from "@/contexts/ThemeContext";
import { getProgressoEstudo, isLicaoLida } from "@/lib/progresso-licao";
import { isFavorito, toggleFavorito } from "@/lib/favoritos";
import StudyCover from "@/components/StudyCover";
import { CheckCircle2, ChevronLeft, Star } from "lucide-react";

interface Props {
  studyId: string;
}

export default function StudyPageContent({ studyId }: Props) {
  const router = useRouter();
  const { colors } = useTheme();
  const study = getStudyById(studyId);

  const [lidasSet, setLidasSet] = useState<Set<string>>(new Set());
  const [fav, setFav] = useState(false);

  useEffect(() => {
    if (!study) return;
    const ids = study.lessons.map((l) => l.id);
    setLidasSet(new Set(ids.filter((id) => isLicaoLida(study.id, id))));
    setFav(isFavorito(study.id));
  }, [study]);

  if (!study) notFound();

  const totalLessons = study.lessons.length;
  const lidasCount = lidasSet.size;

  return (
    <div style={{ backgroundColor: colors.bg, minHeight: "100dvh" }}>
      {/* Hero com capa gerada */}
      <div style={{ position: "relative" }}>
        <StudyCover studyId={study.id} title={study.title} height={196} showTitle />
        <button
          onClick={() => router.push('/')}
          className="absolute top-3 left-3 flex items-center gap-1 rounded-full pl-2 pr-3 py-1.5 text-white transition-opacity hover:opacity-80"
          style={{ backgroundColor: "rgba(0,0,0,0.22)" }}
          aria-label="Voltar para lista de estudos"
        >
          <ChevronLeft size={18} />
          <span className="text-sm font-medium">Voltar</span>
        </button>
        <button
          onClick={() => study && setFav(toggleFavorito(study.id))}
          className="absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center text-white transition-opacity hover:opacity-80"
          style={{ backgroundColor: "rgba(0,0,0,0.22)" }}
          aria-label={fav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          aria-pressed={fav}
        >
          <Star size={20} fill={fav ? "#fff" : "none"} />
        </button>
      </div>

      {/* Subtítulo, autor e progresso */}
      <div className="px-6 pt-4">
        <p className="text-sm" style={{ color: colors.textSecondary }}>{study.subtitle}</p>
        <p className="text-xs mt-0.5" style={{ color: colors.textMuted }}>por {study.author}</p>

        {totalLessons > 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1.5" style={{ color: colors.textMuted }}>
              <span>Progresso</span>
              <span>{lidasCount}/{totalLessons} lições</span>
            </div>
            <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: colors.border }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${totalLessons > 0 ? (lidasCount / totalLessons) * 100 : 0}%`,
                  backgroundColor: lidasCount === totalLessons ? "#22c55e" : colors.primaryLight,
                }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="px-5 py-6 max-w-2xl mx-auto md:max-w-3xl md:px-8">
        {/* Introduction */}
        {study.introduction?.trim() && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">📋</span>
              <h2 className="text-lg font-bold" style={{ color: colors.text }}>Introdução</h2>
            </div>
            <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: colors.textSecondary }}>
              {study.introduction}
            </p>
          </div>
        )}

        {/* Lessons list */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">📚</span>
            <h2 className="text-lg font-bold" style={{ color: colors.text }}>
              Lições ({study.lessons.length})
            </h2>
          </div>

          {study.lessons.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: colors.textMuted }}>
              Nenhuma lição disponível ainda
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {study.lessons.map((lesson) => {
                const lida = lidasSet.has(lesson.id);
                return (
                  <Link
                    key={lesson.id}
                    href={`/study/${study.id}/lesson/${lesson.id}`}
                    className="flex items-center gap-4 rounded-xl p-4 hover:opacity-90 active:scale-[0.99] transition-all shadow-sm hover:shadow-md"
                    style={{ backgroundColor: colors.card }}
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-bold text-sm"
                      style={{ backgroundColor: colors.primaryBg, color: colors.badgeText }}
                    >
                      {lida ? (
                        <CheckCircle2 size={18} style={{ color: "#22c55e" }} />
                      ) : (
                        lesson.order
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-semibold leading-snug mb-0.5"
                        style={{ color: lida ? colors.textMuted : colors.text }}
                      >
                        {lesson.title}
                      </p>
                      <p className="text-xs" style={{ color: colors.textMuted }}>
                        {lesson.bibleReference}
                      </p>
                    </div>
                    <ChevronLeft size={18} className="rotate-180 shrink-0" style={{ color: colors.textMuted }} />
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
