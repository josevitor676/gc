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
  // Desabilitado: causava race conditions de CSS/JS ao cachear agressivamente durante navegação
  aggressiveFrontEndNavCaching: false,
  // Desabilitado: causava reload forçado ao reconectar, resultando em "This page couldn't load"
  // quando havia instabilidade momentânea na rede mobile
  reloadOnOnline: false,
  disable: process.env.NODE_ENV === "development",
  // Estende (não substitui) o runtimeCaching padrão.
  // Entradas com o mesmo cacheName substituem as padrões.
  extendDefaultRuntimeCaching: true,
  workboxOptions: {
    additionalManifestEntries: [{ url: "/", revision: "index" }, ...precacheRoutes],
    runtimeCaching: [
      // RSC prefetch: adiciona timeout de 3 s para cair no cache rapidamente quando offline
      {
        urlPattern: ({ request, url: { pathname }, sameOrigin }: { request: Request; url: URL; sameOrigin: boolean }) =>
          request.headers.get("RSC") === "1" &&
          request.headers.get("Next-Router-Prefetch") === "1" &&
          sameOrigin &&
          !pathname.startsWith("/api/"),
        handler: "NetworkFirst" as const,
        options: {
          cacheName: "pages-rsc-prefetch",
          networkTimeoutSeconds: 3,
          expiration: { maxEntries: 32, maxAgeSeconds: 86400 },
        },
      },
      // RSC: adiciona timeout de 3 s — sem isso, navegação offline trava indefinidamente
      // em vez de servir a página do cache
      {
        urlPattern: ({ request, url: { pathname }, sameOrigin }: { request: Request; url: URL; sameOrigin: boolean }) =>
          request.headers.get("RSC") === "1" &&
          sameOrigin &&
          !pathname.startsWith("/api/"),
        handler: "NetworkFirst" as const,
        options: {
          cacheName: "pages-rsc",
          networkTimeoutSeconds: 3,
          expiration: { maxEntries: 32, maxAgeSeconds: 86400 },
        },
      },
      // Páginas HTML: idem — timeout para fallback rápido offline
      {
        urlPattern: ({ url: { pathname }, sameOrigin }: { url: URL; sameOrigin: boolean }) =>
          sameOrigin && !pathname.startsWith("/api/"),
        handler: "NetworkFirst" as const,
        options: {
          cacheName: "pages",
          networkTimeoutSeconds: 3,
          expiration: { maxEntries: 32, maxAgeSeconds: 86400 },
        },
      },
    ],
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
  allowedDevOrigins: ['c70d-2804-3c74-3f0-912e-91a7-7bfc-7e05-65c3.ngrok-free.app'],
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type,Authorization" },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: CSP },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Access-Control-Allow-Origin", value: "*" }
        ],
      },
    ];
  },
};

export default withPWA(nextConfig);
