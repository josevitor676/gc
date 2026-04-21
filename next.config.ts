import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";
import studies from "./src/data/studies.json";

// Todas as rotas de estudo e lição serão pré-cacheadas pelo SW na instalação,
// garantindo que funcionem offline mesmo sem o usuário ter visitado antes.
const precacheRoutes = (
  studies as Array<{ id: string; lessons: Array<{ id: string }> }>
).flatMap((study) => [
  { url: `/study/${study.id}`, revision: study.id },
  ...study.lessons.map((lesson) => ({
    url: `/study/${study.id}/lesson/${lesson.id}`,
    revision: lesson.id,
  })),
]);

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  fallbacks: {
    document: "/offline.html",
  },
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
