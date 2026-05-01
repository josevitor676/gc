"use client";

import { useState, useCallback, useEffect } from "react";
import { notFound } from "next/navigation";
import { useRouter } from "next/navigation";
import { getLessonById } from "@/services/studies";
import { parseBibleReferences } from "@/utils/bible-ref-parser";
import {
  getHighlightsByLesson,
  insertHighlight,
  deleteHighlight,
  getAnnotationByHighlight,
  upsertAnnotation,
} from "@/services/storage";
import LessonContent from "@/components/LessonContent";
import BiblePassageViewer from "@/components/BiblePassageViewer";
import HighlightToolbar from "@/components/HighlightToolbar";
import AnnotationModal from "@/components/AnnotationModal";
import { useTheme } from "@/contexts/ThemeContext";
import { isLicaoLida, marcarLicaoLida, desmarcarLicaoLida } from "@/lib/progresso-licao";
import type { BibleReference, Highlight, Annotation } from "@/types";
import { CheckCircle2, ChevronLeft, Minus, Plus } from "lucide-react";

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

  // Highlight toolbar
  const [toolbarState, setToolbarState] = useState<{
    blockIndex: number;
    startOffset: number;
    endOffset: number;
    x: number;
    y: number;
  } | null>(null);

  // Annotation modal
  const [annotationState, setAnnotationState] = useState<{
    highlight: Highlight;
    annotation: Annotation | null;
    snippetText: string;
  } | null>(null);

  // Lesson progress
  const [lida, setLida] = useState(false);
  useEffect(() => {
    if (lesson) setLida(isLicaoLida(studyId, lesson.id));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson?.id]);

  const toggleLida = useCallback(() => {
    if (!lesson) return;
    if (lida) {
      desmarcarLicaoLida(studyId, lesson.id);
    } else {
      marcarLicaoLida(studyId, lesson.id);
    }
    setLida(!lida);
  }, [lida, lesson, studyId]);

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

  const handleTextSelect = useCallback(
    (blockIndex: number, startOffset: number, endOffset: number, x: number, y: number) => {
      setToolbarState({ blockIndex, startOffset, endOffset, x, y });
    },
    [],
  );

  const handleColorSelect = useCallback(
    async (color: string) => {
      if (!toolbarState || !lesson) return;
      const newHighlight: Highlight = {
        id: `h-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        lessonId: lesson.id,
        blockIndex: toolbarState.blockIndex,
        startOffset: toolbarState.startOffset,
        endOffset: toolbarState.endOffset,
        color,
        createdAt: new Date().toISOString(),
      };
      await insertHighlight(newHighlight);
      setHighlights(await getHighlightsByLesson(lesson.id));
      window.getSelection()?.removeAllRanges();
      setToolbarState(null);
    },
    [toolbarState, lesson],
  );

  const handleDismissToolbar = useCallback(() => {
    window.getSelection()?.removeAllRanges();
    setToolbarState(null);
  }, []);

  const handleHighlightClick = useCallback(
    async (highlight: Highlight) => {
      if (!lesson) return;
      const annotation = await getAnnotationByHighlight(highlight.id);
      const blockText = lesson.content[highlight.blockIndex]?.text ?? "";
      const snippetText = blockText.slice(highlight.startOffset, highlight.endOffset);
      setAnnotationState({ highlight, annotation, snippetText });
    },
    [lesson],
  );

  const handleSaveAnnotation = useCallback(
    async (text: string) => {
      if (!annotationState || !lesson) return;
      const existing = annotationState.annotation;
      const annotation: Annotation = {
        id: existing?.id ?? `a-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        highlightId: annotationState.highlight.id,
        text,
        createdAt: existing?.createdAt ?? new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await upsertAnnotation(annotation);
      setAnnotationState(null);
    },
    [annotationState, lesson],
  );

  const handleDeleteHighlight = useCallback(async () => {
    if (!annotationState || !lesson) return;
    await deleteHighlight(annotationState.highlight.id);
    setHighlights(await getHighlightsByLesson(lesson.id));
    setAnnotationState(null);
  }, [annotationState, lesson]);

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
          onTextSelect={handleTextSelect}
          onHighlightClick={handleHighlightClick}
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

        {/* Mark as read */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={toggleLida}
            className="flex items-center gap-2 px-5 py-3 rounded-full font-semibold text-sm transition-all active:scale-95"
            style={{
              backgroundColor: lida ? "#22c55e" : colors.primaryBg,
              color: lida ? "#fff" : colors.badgeText,
            }}
          >
            <CheckCircle2 size={18} />
            {lida ? "Lição concluída" : "Marcar como lida"}
          </button>
        </div>

      </div>

      <BiblePassageViewer
        reference={selectedRef}
        visible={bibleModalVisible}
        onClose={() => setBibleModalVisible(false)}
      />

      {toolbarState && (
        <HighlightToolbar
          position={{ x: toolbarState.x, y: toolbarState.y }}
          onColorSelect={handleColorSelect}
          onDismiss={handleDismissToolbar}
        />
      )}

      {annotationState && (
        <AnnotationModal
          highlight={annotationState.highlight}
          snippetText={annotationState.snippetText}
          annotation={annotationState.annotation}
          onSave={handleSaveAnnotation}
          onDeleteHighlight={handleDeleteHighlight}
          onClose={() => setAnnotationState(null)}
        />
      )}
    </div>
  );
}
