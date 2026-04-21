"use client";

import { useState, useCallback, useEffect } from "react";
import { notFound } from "next/navigation";
import { useRouter } from "next/navigation";
import { getLessonById } from "@/services/studies";
import { parseBibleReferences } from "@/utils/bible-ref-parser";
import { getHighlightsByLesson } from "@/services/storage";
import LessonContent from "@/components/LessonContent";
import BiblePassageViewer from "@/components/BiblePassageViewer";
import { useTheme } from "@/contexts/ThemeContext";
import type { BibleReference, Highlight } from "@/types";
import { ChevronLeft, Minus, Plus } from "lucide-react";

interface Props {
  studyId: string;
  lessonId: string;
}

export default function LessonPageContent({ studyId, lessonId }: Props) {
  const router = useRouter();
  const { colors, fontSize, increaseFontSize, decreaseFontSize } = useTheme();

  const lesson = getLessonById(studyId, lessonId);

  // Bible passage modal
  const [selectedRef, setSelectedRef] = useState<BibleReference | null>(null);
  const [bibleModalVisible, setBibleModalVisible] = useState(false);
  const [highlights, setHighlights] = useState<Highlight[]>([]);

  const handleBibleRefPress = useCallback((ref: BibleReference) => {
    setSelectedRef(ref);
    setBibleModalVisible(true);
  }, []);

  const handleHeaderRefPress = useCallback(() => {
    if (!lesson) return;
    const segments = parseBibleReferences(lesson.bibleReference);
    const refSeg = segments.find((s) => s.type === "reference" && s.reference);
    if (refSeg?.reference) {
      setSelectedRef(refSeg.reference);
      setBibleModalVisible(true);
    }
  }, [lesson]);

  useEffect(() => {
    if (lesson) {
      getHighlightsByLesson(lesson.id).then(setHighlights);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson?.id]);

  if (!lesson) notFound();

  return (
    <div style={{ backgroundColor: colors.bg, minHeight: "100dvh" }}>
      {/* Sticky top bar */}
      <div
        className="sticky top-0 z-10 flex items-center justify-between px-4 py-3"
        style={{ backgroundColor: colors.headerBg }}
      >
        <button
          onClick={() => router.push(`/study/${studyId}`)}
          className="flex items-center gap-1 text-white/80 hover:text-white transition-colors"
          aria-label="Voltar para o estudo"
        >
          <ChevronLeft size={20} />
          <span className="text-sm font-medium">Voltar</span>
        </button>
        {/* Font size controls — always visible in header */}
        <div className="flex items-center gap-2">
          <button
            onClick={decreaseFontSize}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-opacity hover:opacity-70"
            style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
            aria-label="Diminuir fonte"
          >
            <Minus size={13} color="#fff" />
          </button>
          <span className="text-xs w-5 text-center text-white/70 tabular-nums">{fontSize}</span>
          <button
            onClick={increaseFontSize}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-opacity hover:opacity-70"
            style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
            aria-label="Aumentar fonte"
          >
            <Plus size={13} color="#fff" />
          </button>
        </div>
        <span className="text-white/70 text-xs font-semibold uppercase tracking-wider">
          Estudo {lesson.order}
        </span>
      </div>

      <div className="px-5 py-6 max-w-2xl mx-auto md:max-w-3xl md:px-8 pb-20">
        {/* Lesson header */}
        <div className="mb-6">
          <p
            className="text-xs font-bold uppercase tracking-widest mb-2"
            style={{ color: colors.primaryLight }}
          >
            Estudo {lesson.order}
          </p>
          <h1 className="text-2xl font-extrabold leading-tight mb-3" style={{ color: colors.text }}>
            {lesson.title}
          </h1>
          <button
            onClick={handleHeaderRefPress}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold hover:opacity-80 transition-opacity"
            style={{ backgroundColor: colors.primaryBg, color: colors.badgeText }}
          >
            📖 {lesson.bibleReference}
          </button>
        </div>

        {/* Content */}
        <LessonContent
          blocks={lesson.content}
          highlights={highlights}
          onBibleRefPress={handleBibleRefPress}
        />

        {/* Reflection questions */}
        {lesson.reflectionQuestions.length > 0 && (
          <div
            role="region"
            aria-labelledby="reflection-heading"
            className="rounded-2xl p-5 mt-6"
            style={{ backgroundColor: colors.reflectionBg }}
          >
            <h2 id="reflection-heading" className="text-lg font-bold mb-4" style={{ color: colors.primary }}>
              💬 Para Reflexão em Grupo
            </h2>
            <div className="flex flex-col gap-4">
              {lesson.reflectionQuestions.map((q, i) => (
                <div key={i} className="flex gap-2">
                  <span
                    className="font-bold shrink-0 mt-0.5"
                    style={{ color: colors.primaryLight, fontSize: fontSize - 1 }}
                  >
                    {i + 1}.
                  </span>
                  <p style={{ fontSize, color: colors.textSecondary, lineHeight: `${fontSize * 1.5}px` }}>
                    {q}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      <BiblePassageViewer
        reference={selectedRef}
        visible={bibleModalVisible}
        onClose={() => setBibleModalVisible(false)}
      />
    </div>
  );
}
