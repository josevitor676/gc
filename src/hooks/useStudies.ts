"use client";

import { useState, useEffect } from "react";
import type { Study } from "@/types";
import { getStudies } from "@/services/studies";

export function useStudies() {
  const [studies, setStudies] = useState<Study[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setStudies(getStudies());
    setLoading(false);
  }, []);

  return { studies, loading };
}
