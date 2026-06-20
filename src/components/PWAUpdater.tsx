"use client";

import { useEffect } from "react";

// Mantém o PWA atualizado sem precisar reinstalar — especialmente no iOS, que só
// verifica uma nova versão do Service Worker quando registration.update() é chamado.
// Forçamos essa verificação ao abrir o app e sempre que ele volta ao primeiro plano.
// O SW já faz skipWaiting()+clientsClaim(); quando a nova versão assume o controle,
// recarregamos uma única vez para mostrar o conteúdo novo.
export default function PWAUpdater() {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;

    let registration: ServiceWorkerRegistration | undefined;
    let refreshing = false;

    const onControllerChange = () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    const checkForUpdate = () => {
      registration?.update().catch(() => {
        // sem rede ou SW indisponível — tenta de novo no próximo foco
      });
    };

    navigator.serviceWorker.ready
      .then((reg) => {
        registration = reg;
        checkForUpdate();
      })
      .catch(() => {});

    const onVisibility = () => {
      if (document.visibilityState === "visible") checkForUpdate();
    };
    document.addEventListener("visibilitychange", onVisibility);

    // Verificação periódica enquanto o app fica aberto (a cada 30 min)
    const interval = window.setInterval(checkForUpdate, 30 * 60 * 1000);

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
      document.removeEventListener("visibilitychange", onVisibility);
      window.clearInterval(interval);
    };
  }, []);

  return null;
}
