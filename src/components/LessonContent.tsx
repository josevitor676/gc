"use client";

import type { ContentBlock, BibleReference, Highlight } from "@/types";
import { parseBibleReferences } from "@/utils/bible-ref-parser";
import BibleReferenceLink from "./BibleReferenceLink";
import { useTheme } from "@/contexts/ThemeContext";

interface Props {
  blocks: ContentBlock[];
  highlights: Highlight[];
  onBibleRefPress: (ref: BibleReference) => void;
}

function getNumberPrefix(index: number, blocks: ContentBlock[]): number {
  let count = 0;
  for (let i = 0; i <= index; i++) {
    if (blocks[i].type === "numbered_point") count++;
  }
  return count;
}

export default function LessonContent({ blocks, highlights, onBibleRefPress }: Props) {
  const { colors, fontSize } = useTheme();

  return (
    <div>
      {blocks.map((block, blockIndex) => {
        const blockHighlights = highlights.filter((h) => h.blockIndex === blockIndex);

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
              <RichText
                text={block.text}
                bold={block.bold}
                italic={block.italic}
                highlights={blockHighlights}
                onBibleRefPress={onBibleRefPress}
                fontSize={fontSize}
                colors={colors}
              />
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
                    highlights={blockHighlights}
                    onBibleRefPress={onBibleRefPress}
                    fontSize={fontSize}
                    colors={colors}
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
                  highlights={blockHighlights}
                  onBibleRefPress={onBibleRefPress}
                  fontSize={fontSize}
                  colors={colors}
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
                <RichText
                  text={block.text}
                  italic
                  highlights={blockHighlights}
                  onBibleRefPress={onBibleRefPress}
                  fontSize={fontSize}
                  colors={colors}
                />
              </blockquote>
            )}
          </div>
        );
      })}
    </div>
  );
}

interface RichTextProps {
  text: string;
  bold?: boolean;
  italic?: boolean;
  highlights: Highlight[];
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
      {segments.map((seg, i) => {
        if (seg.type === "reference" && seg.reference) {
          return (
            <BibleReferenceLink key={i} reference={seg.reference} onPress={onBibleRefPress} />
          );
        }
        return <span key={i}>{seg.value}</span>;
      })}
    </p>
  );
}
