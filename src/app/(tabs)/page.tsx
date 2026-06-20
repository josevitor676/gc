'use client';

import { useStudies } from '@/hooks/useStudies';
import StudyCard from '@/components/StudyCard';
import { useTheme } from '@/contexts/ThemeContext';

export default function EstudosPage() {
  const { studies, loading, error } = useStudies();
  const { colors } = useTheme();

  return (
    <div className="flex flex-col px-6 py-8 w-full">
      <div className="mb-8 flex flex-col items-center text-center">
        <p
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: colors.textMuted }}
        >
          Bem-vindo ao
        </p>
        <h2
          className="text-3xl font-extrabold mt-1 leading-tight"
          style={{ color: colors.text }}
        >
          Grupos de Crescimento IPVO
        </h2>
        <p className="text-sm mt-2" style={{ color: colors.textSecondary }}>
          Escolha um estudo para o seu GC
        </p>
      </div>

      {loading ? (
        <div
          className="flex justify-center mt-12"
          role="status"
          aria-label="Carregando estudos..."
        >
          <div
            className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: colors.primaryLight, borderTopColor: 'transparent' }}
          />
        </div>
      ) : error ? (
        <div className="flex justify-center mt-12">
          <p className="text-sm text-center" style={{ color: colors.textMuted }}>
            {error}
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gap: '1.5rem',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 400px), 1fr))',
          }}
        >
          {studies.map((study) => (
            <StudyCard key={study.id} study={study} />
          ))}
        </div>
      )}
    </div>
  );
}