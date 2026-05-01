"use client";

import type { ContentBlock, BibleReference } from "@/types";
import { parseBibleReferences, type ParsedSegment } from "@/utils/bible-ref-parser";
import BibleReferenceLink from "./BibleReferenceLink";
import { useTheme } from "@/contexts/ThemeContext";

interface Props {
  blocks: ContentBlock[];
  onBibleRefPress: (ref: BibleReference) => void;
}

// ── RichText ──────────────────────────────────────────────

interface RichTextProps {
  text: string;
  bold?: boolean;
  italic?: boolean;
  onBibleRefPress: (ref: BibleReference) => void;
  fontSize: number;
  colors: ReturnType<typeof useTheme>["colors"];
}

function RichText({ text, bold, italic, onBibleRefPress, fontSize, colors }: RichTextProps) {
  const segments = parseBibleReferences(text);

  return (
    <p
      style={{
        fontSize,
        lineHeight: `${fontSize * 1.6}px`,
        color: colors.textSecondary,
        fontWeight: bold ? 600 : undefined,
        fontStyle: italic ? "italic" : undefined,
      }}
    >
      {segments.map((seg: ParsedSegment, i: number) =>
        seg.reference ? (
          <BibleReferenceLink key={i} reference={seg.reference} onPress={onBibleRefPress} />
        ) : (
          <span key={i}>{seg.value}</span>
        ),
      )}
    </p>
  );
}

// ── Helpers ───────────────────────────────────────────────

function getNumberPrefix(index: number, blocks: ContentBlock[]): number {
  let count = 0;
  for (let i = 0; i <= index; i++) {
    if (blocks[i].type === "numbered_point") count++;
  }
  return count;
}

// ── Main export ───────────────────────────────────────────

export default function LessonContent({ blocks, onBibleRefPress }: Props) {
  const { colors, fontSize } = useTheme();

  return (
    <div>
      {blocks.map((block, blockIndex) => {
        const richTextProps = { onBibleRefPress, fontSize, colors };

        return (
          <div key={blockIndex} style={{ marginBottom: 12 }}>
            {block.type === "heading" && (
              <p
                className="font-bold mt-4 mb-1"
                style={{ fontSize: fontSize + 2, color: colors.primary }}
              >
                {block.text}
              </p>
            )}

            {block.type === "paragraph" && (
              <RichText text={block.text} bold={block.bold} italic={block.italic} {...richTextProps} />
            )}

            {block.type === "numbered_point" && (
              <div className="flex ml-1 mt-1">
                <span
                  className="font-bold mr-2 mt-0.5 shrink-0"
                  style={{ color: colors.primary, fontSize }}
                >
                  {getNumberPrefix(blockIndex, blocks)}.
                </span>
                <div className="flex-1">
                  <RichText
                    text={block.text}
                    bold={block.bold}
                    italic={block.italic}
                    {...richTextProps}
                  />
                </div>
              </div>
            )}

            {block.type === "sub_point" && (
              <div className="ml-6 mt-1">
                <RichText
                  text={block.text}
                  bold={block.bold}
                  italic={block.italic}
                  {...richTextProps}
                />
              </div>
            )}

            {block.type === "bible_quote" && (
              <blockquote
                className="mt-1 ml-1 px-3 py-3 rounded-r-lg border-l-4"
                style={{
                  backgroundColor: colors.reflectionBg,
                  borderLeftColor: colors.primaryLight,
                }}
              >
                <RichText text={block.text} italic {...richTextProps} />
              </blockquote>
            )}
          </div>
        );
      })}
    </div>
  );
}

