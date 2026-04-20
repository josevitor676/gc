"use client";

import type { BibleReference } from "@/types";
import { useTheme } from "@/contexts/ThemeContext";

interface Props {
  reference: BibleReference;
  onPress: (ref: BibleReference) => void;
}

export default function BibleReferenceLink({ reference, onPress }: Props) {
  const { colors } = useTheme();

  return (
    <button
      onClick={() => onPress(reference)}
      className="underline font-semibold hover:opacity-80 transition-opacity cursor-pointer"
      style={{ color: colors.primaryLight }}
    >
      {reference.raw}
    </button>
  );
}
