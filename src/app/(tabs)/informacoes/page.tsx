'use client';

import { useState } from 'react';
import Image from 'next/image';
import { MapPin, Users, Clock, HandCoins, Copy } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

function mapsLink(address: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

export default function InformacoesPage() {
  const { colors } = useTheme();
  const [copiedValue, setCopiedValue] = useState<string | null>(null);

  const igrejaAddress = 'Av. Paissandú, 32 - Vila Operária, Maringá - PR, 87050-130';
  const mandaguacuAddress = 'R. Gastão Vidgal, 76 - Vila Bernardino, Mandaguaçu - PR, 87160-000';
  const copyToClipboard = async (value: string) => {
    if (typeof navigator === 'undefined') {
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = value;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'absolute';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  };

  const handleCopy = async (value: string) => {
    await copyToClipboard(value);
    setCopiedValue(value);
    window.setTimeout(() => setCopiedValue(null), 2000);
  };

  return (
    <div className="min-h-full p-5" style={{ backgroundColor: colors.bg }}>
      <div className="grid gap-4 md:grid-cols-2">
        <div
          className="p-4 rounded-lg"
          style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}
        >
          <div className="flex items-center gap-3">
            <MapPin size={20} style={{ color: colors.primary }} />
            <h2 className="text-lg font-semibold" style={{ color: colors.primary }}>
              Onde estamos
            </h2>
          </div>

          <p className="text-sm mt-2 font-medium" style={{ color: colors.text }}>
            Maringá - PR
          </p>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium" style={{ color: colors.text }}>
              {igrejaAddress}
            </p>
            <a
              href={mapsLink(igrejaAddress)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Abrir endereço no Google Maps"
              className="ml-1"
              style={{ color: colors.primary }}
            >
              <MapPin size={18} />
            </a>
          </div>

          <p className="text-sm mt-2 font-medium" style={{ color: colors.text }}>
            Telefones:{' '}
            <a href="tel:+554432264473" style={{ color: colors.primary }}>
              {' '}
              (44) 3226-4473
            </a>{' '}
            /{' '}
            <a href="tel:+5544999230444" style={{ color: colors.primary }}>
              99923-0444
            </a>
          </p>
        </div>

        <div
          className="p-4 rounded-lg"
          style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}
        >
          <div className="flex items-center gap-3">
            <Users size={20} style={{ color: colors.primary }} />
            <h3 className="text-base font-semibold" style={{ color: colors.primary }}>
              Pastores
            </h3>
          </div>
          <ul className="mt-2 space-y-1">
            <li className="font-medium" style={{ color: colors.text }}>
              Rev. Luciano Rocha -{' '}
              <a href="tel:+5544991040617" style={{ color: colors.primary }}>
                99104-0617
              </a>
            </li>
            <li className="font-medium" style={{ color: colors.text }}>
              Rev. Daniel Garcia -{' '}
              <a href="tel:+5544997327947" style={{ color: colors.primary }}>
                99732-7947
              </a>
            </li>
            <li className="font-medium" style={{ color: colors.text }}>
              Rev. Dalmo Ribas -{' '}
              <a href="tel:+5544991051535" style={{ color: colors.primary }}>
                99105-1535
              </a>
            </li>
          </ul>
        </div>

        <div
          className="p-4 rounded-lg"
          style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}
        >
          <div className="flex items-center gap-3">
            <Clock size={20} style={{ color: colors.primary }} />
            <h3 className="text-base font-semibold" style={{ color: colors.primary }}>
              Secretaria da Igreja
            </h3>
          </div>
          <p className="text-sm mt-2 font-medium" style={{ color: colors.text }}>
            Segunda a Sexta - 07:30 às 17:00
          </p>
          <p className="text-sm mt-1 font-medium" style={{ color: colors.text }}>
            Secretária:{' '}
            <a href="mailto:secretaria@ipvo.com.br" style={{ color: colors.primary }}>
              Bruna Emerick - secretaria@ipvo.com.br
            </a>{' '}
          </p>
          <p className="text-sm mt-1 font-medium" style={{ color: colors.text }}>
            Financeiro:{' '}
            <a href="tel:+5544998854900" style={{ color: colors.primary }}>
              Simone Rampim - 99885-4900
            </a>{' '}
            -{' '}
            <a href="mailto:financeiro@ipvo.com.br" style={{ color: colors.primary }}>
              financeiro@ipvo.com.br
            </a>
          </p>
          <p className="text-sm mt-1 font-medium" style={{ color: colors.text }}>
            Tesoureiro:{' '}
            <a href="tel:+5544991158044" style={{ color: colors.primary }}>
              Roberto Matos - 991158044
            </a>
          </p>
        </div>

        <div
          className="p-4 rounded-lg"
          style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}
        >
          <div className="flex items-center gap-3">
            <MapPin size={20} style={{ color: colors.primary }} />
            <h3 className="text-base font-semibold" style={{ color: colors.primary }}>
              Congregação de Mandaguaçu
            </h3>
          </div>
          <p className="text-sm mt-2 font-medium" style={{ color: colors.text }}>
            Mandaguaçu - PR
          </p>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium" style={{ color: colors.text }}>
              {mandaguacuAddress}
            </p>
            <a
              href={mapsLink(mandaguacuAddress)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Abrir endereço no Google Maps"
              className="ml-1"
              style={{ color: colors.primary }}
            >
              <MapPin size={18} />
            </a>
          </div>
        </div>
      </div>

      <div
        className="mt-4 p-6 rounded-lg"
        style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}
      >
        <div className="flex items-center gap-3">
          <HandCoins size={20} style={{ color: colors.primary }} />
          <h3 className="text-base font-semibold" style={{ color: colors.primary }}>
            Dízimos e Ofertas
          </h3>
        </div>
        <div className="mt-3 flex flex-col gap-2 " style={{ color: colors.text }}>
          <p>
            “Trazei todos os dízimos à casa do tesouro, para que haja mantimento na minha casa, e
            depois fazei prova de mim nisto, diz o Senhor dos Exércitos, se eu não vos abrir as
            janelas do céu, e não derramar sobre vós bênção sem medida.”
          </p>
          <p className="mt-1 font-medium" style={{ color: colors.text, textAlign: 'right' }}>
            Malaquias 3:10
          </p>
        </div>
        <p className="mt-3" style={{ color: colors.text }}>
          O seu dízimo e ofertas são essenciais para sustentar a obra de Deus em nossa igreja e
          comunidade. Com sua contribuição, podemos continuar espalhando o amor de Cristo e
          auxiliando aqueles que mais precisam.
        </p>

        <div className="flex flex-col items-center gap-10 md:flex-row md:items-start md:justify-center mt-4">
          <div className="mt-5 flex flex-col items-center gap-2">
            <Image
              src="https://ipvo.com.br/wp-content/uploads/2025/07/WhatsApp-Image-2025-07-11-at-14.33.39-600x602.jpeg"
              alt="Dízimos e Ofertas"
              width={250}
              height={250}
            />
            <div className="flex flex-col items-center gap-1" style={{ color: colors.text }}>
              <p className="mt-1 font-medium" style={{ color: colors.text }}>
                Dízimos e Ofertas para o Terreno
              </p>
              <p className="mt-1 font-medium" style={{ color: colors.text }}>
                Banco Itaú – Ag: 0113 – Cc: 99239-0
              </p>
              <p className="mt-1 font-medium" style={{ color: colors.text }}>
                <span className="inline-flex items-center gap-2">
                  PIX: financeiro@ipvo.com.br
                  <button
                    type="button"
                    onClick={() => handleCopy('financeiro@ipvo.com.br')}
                    className="inline-flex items-center"
                    style={{ color: colors.primary }}
                    aria-label="Copiar PIX financeiro"
                  >
                    <Copy size={20} />
                  </button>
                </span>
              </p>
              {copiedValue === 'financeiro@ipvo.com.br' && (
                <span className="text-sm font-semibold" style={{ color: colors.primary }}>
                  PIX copiado com sucesso
                </span>
              )}
            </div>
          </div>

          <div className="mt-5 flex flex-col items-center gap-2">
            <Image
              src="https://ipvo.com.br/wp-content/uploads/2025/07/WhatsApp-Image-2025-07-11-at-14.34.27-600x605.jpeg"
              alt="Oferta Missionária"
              width={250}
              height={250}
            />
            <div className="flex flex-col items-center gap-1" style={{ color: colors.text }}>
              <p className="mt-1 font-medium" style={{ color: colors.text }}>
                Oferta Missionária
              </p>
              <p className="mt-1 font-medium" style={{ color: colors.text }}>
                Banco Bradesco – Ag: 0972 – Cc: 4092-4
              </p>
              <p className="mt-1 font-medium" style={{ color: colors.text }}>
                <span className="inline-flex items-center gap-2">
                  PIX: 44 99923-0444
                  <button
                    type="button"
                    onClick={() => handleCopy('44 99923-0444')}
                    className="inline-flex items-center"
                    style={{ color: colors.primary }}
                    aria-label="Copiar PIX 44 99923-0444"
                  >
                    <Copy size={20} />
                  </button>
                </span>
              </p>
              {copiedValue === '44 99923-0444' && (
                <span className="text-sm font-semibold" style={{ color: colors.primary }}>
                  PIX copiado com sucesso
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
