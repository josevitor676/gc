import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";
import { readFileSync } from "fs";
import { join } from "path";

// Lê o JSON de estudos via fs para garantir compatibilidade em qualquer ambiente de build
function loadStudyRoutes() {
  try {
    const raw = readFileSync(join(process.cwd(), "src/data/studies.json"), "utf-8");
    const studies = JSON.parse(raw) as Array<{ id: string; lessons: Array<{ id: string }> }>;
    return studies.flatMap((study) => [
      { url: `/study/${study.id}`, revision: study.id },
      ...study.lessons.map((lesson) => ({
        url: `/study/${study.id}/lesson/${lesson.id}`,
        revision: lesson.id,
      })),
    ]);
  } catch {
    return [];
  }
}

const precacheRoutes = loadStudyRoutes();

// app/~offline/page.tsx é detectado automaticamente pelo @ducanh2912/next-pwa
// e gera o fallback correto para navegação offline (sem necessidade de configurar `fallbacks` manualmente)
const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    additionalManifestEntries: [{ url: "/", revision: "index" }, ...precacheRoutes],
  },
});

const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "connect-src 'self' https://bible-api.com",
  "img-src 'self' data: blob:",
  "manifest-src 'self'",
  "worker-src 'self'",
].join("; ");

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: CSP },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default withPWA(nextConfig);
