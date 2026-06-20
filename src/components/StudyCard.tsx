"use client";

import { useState, useEffect, memo } from "react";
import Link from "next/link";
import { CloudCheck } from "lucide-react";
import type { Study } from "@/types";
import { useTheme } from "@/contexts/ThemeContext";
import { getProgressoEstudo } from "@/lib/progresso-licao";
import { getCategoria } from "@/data/estudos/categorias";
import StudyCover from "./StudyCover";

interface Props {
  study: Study;
}

export default memo(function StudyCard({ study }: Props) {
  const { colors } = useTheme();
  const cat = getCategoria(study.id);
  const totalLessons = study.lessons.length;
  const [lidasCount, setLidasCount] = useState(0);

  useEffect(() => {
    setLidasCount(
      getProgressoEstudo(
        study.id,
        study.lessons.map((l) => l.id),
      ),
    );
  }, [study]);

  const concluido = lidasCount > 0 && lidasCount === totalLessons;

  return (
    <Link
      href={`/study/${study.id}`}
      className="block rounded-2xl overflow-hidden border shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-200"
      style={{ backgroundColor: colors.card, borderColor: colors.border }}
    >
      <StudyCover studyId={study.id} height={96} />

      <div className="p-3">
        <span
          className="inline-flex items-center gap-1 text-[10px] font-semibold rounded-full px-2 py-0.5"
          style={{ backgroundColor: cat.tint, color: cat.ink }}
        >
          {cat.label}
        </span>

        <h2
          className="text-sm font-bold leading-snug mt-1.5 line-clamp-2"
          style={{ color: colors.text }}
        >
          {study.title}
        </h2>

        <div
          className="flex items-center gap-1 text-[11px] mt-1.5"
          style={{ color: colors.textMuted }}
        >
          <CloudCheck size={13} />
          <span>
            {lidasCount > 0
              ? `${lidasCount}/${totalLessons} lições`
              : `${totalLessons} ${totalLessons === 1 ? "lição" : "lições"}`}
          </span>
        </div>

        {lidasCount > 0 && (
          <div
            className="mt-2 h-1.5 rounded-full overflow-hidden"
            style={{ backgroundColor: colors.border }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(lidasCount / totalLessons) * 100}%`,
                backgroundColor: concluido ? "#22c55e" : cat.cover,
              }}
            />
          </div>
        )}
      </div>
    </Link>
  );
});
