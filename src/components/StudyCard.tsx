'use client';

import { useState, useEffect, memo } from 'react';
import Link from 'next/link';
import type { Study } from '@/types';
import { useTheme } from '@/contexts/ThemeContext';
import { getProgressoEstudo } from '@/lib/progresso-licao';

interface Props {
  study: Study;
}

export default memo(function StudyCard({ study }: Props) {
  const { colors } = useTheme();
  const totalLessons = study.lessons.length;
  const [lidasCount, setLidasCount] = useState(0);

  useEffect(() => {
    setLidasCount(
      getProgressoEstudo(
        study.id,
        study.lessons.map((l) => l.id)
      )
    );
  }, [study]);

  return (
    <Link
      href={`/study/${study.id}`}
      className="flex flex-col rounded-2xl overflow-hidden shadow-md hover:shadow-xl active:scale-[0.98] transition-all duration-200"
      style={{ backgroundColor: colors.card }}
    >
      {/* Header */}
      <div
        className="px-5 py-10 flex flex-col items-center text-center flex-shrink-0"
        style={{ backgroundColor: colors.headerBg }}
      >
        <span className="text-5xl mb-3">📖</span>
        <h2 className="text-white text-xl font-extrabold tracking-wide leading-snug">
          {study.title}
        </h2>
        <p className="text-white/70 text-sm mt-2">{study.subtitle}</p>
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center justify-between">
          <span
            className="text-[11px] font-semibold uppercase tracking-wider"
            style={{ color: colors.textMuted }}
          >
            Autor
          </span>
          <span
            className="text-sm font-medium text-right ml-2"
            style={{ color: colors.textSecondary }}
          >
            {study.author}
          </span>
        </div>

        <div className="my-3 h-px" style={{ backgroundColor: colors.divider }} />

        <div className="flex items-center gap-2.5 mt-auto">
          <span
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
            style={{ backgroundColor: colors.badgeBg, color: colors.badgeText }}
            aria-label={`${lidasCount} de ${totalLessons} ${totalLessons === 1 ? 'lição' : 'lições'} lidas`}
          >
            {totalLessons}
          </span>
          <div className="flex-1">
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              {lidasCount > 0
                ? `${lidasCount}/${totalLessons} lições`
                : `${totalLessons} ${totalLessons === 1 ? 'lição disponível' : 'lições disponíveis'}`}
            </p>
            {lidasCount > 0 && totalLessons > 0 && (
              <div
                className="mt-1.5 h-1.5 rounded-full overflow-hidden"
                style={{ backgroundColor: colors.border }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(lidasCount / totalLessons) * 100}%`,
                    backgroundColor:
                      lidasCount === totalLessons ? '#22c55e' : colors.primaryLight,
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
});