"use client";

import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

export default function OfflineBanner() {
  const online = useOnlineStatus();
  if (online) return null;

  return (
    <div
      className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium"
      style={{ backgroundColor: "#FAEEDA", color: "#854F0B" }}
      role="status"
    >
      <WifiOff size={15} />
      <span>Você está offline — seus estudos continuam disponíveis</span>
    </div>
  );
}
