"use client";

import { useState, useCallback, useEffect } from "react";
import { notFound } from "next/navigation";
import { useRouter } from "next/navigation";
import { getLessonById } from "@/services/studies";
import { parseBibleReferences } from "@/utils/bible-ref-parser";
import LessonContent from "@/components/LessonContent";
import BibleReferenceLink from "@/components/BibleReferenceLink";
import BiblePassageViewer from "@/components/BiblePassageViewer";
import { useTheme } from "@/contexts/ThemeContext";
import { isLicaoLida, marcarLicaoLida, desmarcarLicaoLida, registrarUltimaLicao } from "@/lib/progresso-licao";
import { isFavorito, toggleFavorito } from "@/lib/favoritos";
import { getNota, setNota } from "@/lib/anotacoes";
import ReadingSettings from "@/components/ReadingSettings";
import type { BibleReference } from "@/types";
import { CheckCircle2, ChevronLeft, ALargeSmall, Star, Share2, NotebookPen } from "lucide-react";

interface Props {
  studyId: string;
  lessonId: string;
}

export default function LessonPageContent({ studyId, lessonId }: Props) {
  const router = useRouter();
  const { colors, fontSize } = useTheme();

  const lesson = getLessonById(studyId, lessonId);

  // Bible passage modal
  const [selectedRefs, setSelectedRefs] = useState<BibleReference[]>([]);
  const [selectedTitle, setSelectedTitle] = useState("");
  const [bibleModalVisible, setBibleModalVisible] = useState(false);

  // Ajustes de leitura, favorito e anotação
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [fav, setFav] = useState(false);
  const [nota, setNotaState] = useState("");

  // Lesson progress
  const [lida, setLida] = useState(false);
  useEffect(() => {
    if (lesson) {
      setLida(isLicaoLida(studyId, lesson.id));
      registrarUltimaLicao(studyId, lesson.id);
      setFav(isFavorito(studyId));
      setNotaState(getNota(studyId, lesson.id));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson?.id]);

  const toggleFav = useCallback(() => setFav(toggleFavorito(studyId)), [studyId]);

  const onNotaChange = useCallback((texto: string) => {
    if (!lesson) return;
    setNotaState(texto);
    setNota(studyId, lesson.id, texto);
  }, [lesson, studyId]);

  const handleShare = useCallback(async () => {
    if (!lesson) return;
    const texto = `${lesson.title} — ${lesson.bibleReference}`.trim();
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) {
        await navigator.share({ title: lesson.title, text: texto, url });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${texto}\n${url}`);
      }
    } catch {
      // usuário cancelou ou API indisponível
    }
  }, [lesson]);

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
    setSelectedRefs([ref]);
    setSelectedTitle(ref.raw);
    setBibleModalVisible(true);
  }, []);

  const handleHeaderRefPress = useCallback(() => {
    if (!lesson) return;
    const segments = parseBibleReferences(lesson.bibleReference);
    const refs = segments
      .filter((s) => s.type === "reference" && s.reference)
      .map((s) => s.reference!);
    if (refs.length > 0) {
      setSelectedRefs(refs);
      setSelectedTitle(lesson.bibleReference);
      setBibleModalVisible(true);
    }
  }, [lesson]);

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
        {/* Ações de leitura */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSettingsOpen(true)}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-opacity hover:opacity-70"
            style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
            aria-label="Ajustes de leitura"
          >
            <ALargeSmall size={20} color="#fff" />
          </button>
          <button
            onClick={toggleFav}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-opacity hover:opacity-70"
            style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
            aria-label={fav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            aria-pressed={fav}
          >
            <Star size={18} color="#fff" fill={fav ? "#fff" : "none"} />
          </button>
          <button
            onClick={handleShare}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-opacity hover:opacity-70"
            style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
            aria-label="Compartilhar"
          >
            <Share2 size={18} color="#fff" />
          </button>
        </div>
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
                    {parseBibleReferences(q).map((seg, segIndex) =>
                      seg.reference ? (
                        <BibleReferenceLink
                          key={segIndex}
                          reference={seg.reference}
                          onPress={handleBibleRefPress}
                        />
                      ) : (
                        <span key={segIndex}>{seg.value}</span>
                      ),
                    )}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Minhas anotações */}
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-2">
            <NotebookPen size={18} color={colors.primary} />
            <h2 className="text-base font-bold" style={{ color: colors.text }}>
              Minhas anotações
            </h2>
          </div>
          <textarea
            value={nota}
            onChange={(e) => onNotaChange(e.target.value)}
            placeholder="Escreva aqui suas reflexões sobre esta lição…"
            rows={4}
            className="w-full rounded-2xl p-4 outline-none resize-y"
            style={{
              backgroundColor: colors.surfaceAlt,
              color: colors.text,
              fontSize,
              lineHeight: 1.6,
              border: `1px solid ${colors.border}`,
            }}
          />
          <p className="text-xs mt-1.5" style={{ color: colors.textMuted }}>
            Salvo automaticamente neste aparelho.
          </p>
        </div>

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

      <ReadingSettings open={settingsOpen} onClose={() => setSettingsOpen(false)} />

      <BiblePassageViewer
        references={selectedRefs}
        title={selectedTitle}
        visible={bibleModalVisible}
        onClose={() => setBibleModalVisible(false)}
      />
    </div>
  );
}
