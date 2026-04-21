"use client";

import { notFound } from "next/navigation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getStudyById } from "@/services/studies";
import { useTheme } from "@/contexts/ThemeContext";
import { ChevronLeft } from "lucide-react";

interface Props {
  studyId: string;
}

export default function StudyPageContent({ studyId }: Props) {
  const router = useRouter();
  const { colors } = useTheme();
  const study = getStudyById(studyId);

  if (!study) notFound();

  return (
    <div style={{ backgroundColor: colors.bg, minHeight: "100dvh" }}>
      {/* Back */}
      <div
        className="sticky top-0 z-10 flex items-center px-4 py-3"
        style={{ backgroundColor: colors.headerBg }}
      >
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-1 text-white/80 hover:text-white transition-colors"
          aria-label="Voltar para lista de estudos"
        >
          <ChevronLeft size={20} />
          <span className="text-sm font-medium">Voltar</span>
        </button>
      </div>

      {/* Study header */}
      <div
        className="px-6 py-10 flex flex-col items-center text-center"
        style={{ backgroundColor: colors.headerBg }}
      >
        <span className="text-5xl mb-3">📖</span>
        <h1 className="text-white text-3xl font-extrabold tracking-tight">{study.title}</h1>
        <p className="text-white/70 text-sm mt-2">{study.subtitle}</p>
        <p className="text-white/50 text-xs mt-1">por {study.author}</p>
      </div>

      <div className="px-5 py-6 max-w-2xl mx-auto md:max-w-3xl md:px-8">
        {/* Introduction */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">📋</span>
            <h2 className="text-lg font-bold" style={{ color: colors.text }}>Introdução</h2>
          </div>
          <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: colors.textSecondary }}>
            {study.introduction}
          </p>
        </div>

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
              {study.lessons.map((lesson) => (
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
                    {lesson.order}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold leading-snug mb-0.5" style={{ color: colors.text }}>
                      {lesson.title}
                    </p>
                    <p className="text-xs" style={{ color: colors.textMuted }}>
                      {lesson.bibleReference}
                    </p>
                  </div>
                  <ChevronLeft size={18} className="rotate-180 shrink-0" style={{ color: colors.textMuted }} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
