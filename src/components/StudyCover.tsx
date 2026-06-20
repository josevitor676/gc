"use client";

import { getCategoria } from "@/data/estudos/categorias";

interface Props {
  studyId: string;
  title?: string;
  height?: number;
  showTitle?: boolean;
  rounded?: boolean;
}

// Gera uma "capa ilustrada" determinística por estudo: fundo na cor da categoria,
// formas decorativas posicionadas por um hash do id e o ícone da categoria.
function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export default function StudyCover({
  studyId,
  title,
  height = 104,
  showTitle = false,
  rounded = false,
}: Props) {
  const cat = getCategoria(studyId);
  const Icon = cat.icon;
  const h = hash(studyId);

  // posições/raios determinísticos a partir do hash
  const c1 = { cx: 18 + (h % 30), cy: 20 + ((h >> 2) % 25), r: 60 + ((h >> 3) % 30) };
  const c2 = { cx: 78 + ((h >> 4) % 24), cy: 70 + ((h >> 5) % 30), r: 34 + ((h >> 6) % 24) };
  const rot = (h % 24) - 12;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height,
        backgroundColor: cat.cover,
        overflow: "hidden",
        borderRadius: rounded ? 16 : 0,
      }}
      aria-hidden={!showTitle}
    >
      <svg
        viewBox="0 0 120 100"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      >
        <circle cx={c1.cx} cy={c1.cy} r={c1.r} fill="#FFFFFF" opacity={0.1} />
        <circle cx={c2.cx} cy={c2.cy} r={c2.r} fill="#000000" opacity={0.08} />
        <circle cx={c2.cx} cy={c2.cy} r={c2.r * 0.55} fill="#FFFFFF" opacity={0.08} />
      </svg>

      <div
        style={{
          position: "absolute",
          right: -8,
          top: showTitle ? 14 : "50%",
          transform: `translateY(${showTitle ? "0" : "-50%"}) rotate(${rot}deg)`,
          color: "#FFFFFF",
          opacity: 0.28,
        }}
      >
        <Icon size={showTitle ? 76 : 60} strokeWidth={1.5} />
      </div>

      {showTitle && title && (
        <div
          style={{
            position: "absolute",
            left: 16,
            right: 16,
            bottom: 14,
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              fontSize: 11,
              fontWeight: 600,
              color: "#FFFFFF",
              backgroundColor: "rgba(0,0,0,0.18)",
              padding: "3px 9px",
              borderRadius: 999,
              marginBottom: 8,
            }}
          >
            {cat.label}
          </span>
          <h2
            style={{
              fontSize: 22,
              fontWeight: 800,
              lineHeight: 1.15,
              color: "#FFFFFF",
              margin: 0,
              textShadow: "0 1px 8px rgba(0,0,0,0.25)",
            }}
          >
            {title}
          </h2>
        </div>
      )}
    </div>
  );
}
