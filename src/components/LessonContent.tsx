"use client";

import { useRef } from "react";
import type { ContentBlock, BibleReference, Highlight } from "@/types";
import { parseBibleReferences, type ParsedSegment } from "@/utils/bible-ref-parser";
import BibleReferenceLink from "./BibleReferenceLink";
import { useTheme } from "@/contexts/ThemeContext";

interface Props {
  blocks: ContentBlock[];
  highlights: Highlight[];
  onBibleRefPress: (ref: BibleReference) => void;
  onTextSelect: (
    blockIndex: number,
    startOffset: number,
    endOffset: number,
    x: number,
    y: number,
  ) => void;
  onHighlightClick: (highlight: Highlight) => void;
}

// ── Segment building ─────────────────────────────────────

interface RenderSegment {
  text: string;
  bibleRef?: BibleReference;
  highlightId?: string;
  highlightColor?: string;
}

function buildSegments(text: string, highlights: Highlight[]): RenderSegment[] {
  const sorted = [...highlights]
    .filter((h) => h.startOffset < text.length)
    .sort((a, b) => a.startOffset - b.startOffset);

  // Merge overlapping highlights (keep first)
  const merged: Highlight[] = [];
  let lastEnd = 0;
  for (const h of sorted) {
    if (h.startOffset >= lastEnd) {
      merged.push(h);
      lastEnd = h.endOffset;
    }
  }

  const toSegs = (slice: string, h?: Highlight): RenderSegment[] =>
    parseBibleReferences(slice).map((s: ParsedSegment) => ({
      text: s.value,
      bibleRef: s.reference,
      highlightId: h?.id,
      highlightColor: h?.color,
    }));

  const result: RenderSegment[] = [];
  let pos = 0;

  for (const h of merged) {
    if (h.startOffset > pos) result.push(...toSegs(text.slice(pos, h.startOffset)));
    result.push(...toSegs(text.slice(h.startOffset, Math.min(h.endOffset, text.length)), h));
    pos = Math.min(h.endOffset, text.length);
  }

  if (pos < text.length) result.push(...toSegs(text.slice(pos)));
  return result;
}

// ── Text offset inside a DOM container ───────────────────

function getTextOffset(container: Element, targetNode: Node, targetOffset: number): number {
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  let chars = 0;
  let node: Node | null;
  while ((node = walker.nextNode())) {
    if (node === targetNode) return chars + targetOffset;
    chars += (node as Text).textContent!.length;
  }
  return chars;
}

// ── BlockWrapper — handles text selection per block ───────

function BlockWrapper({
  blockIndex,
  children,
  onTextSelect,
}: {
  blockIndex: number;
  children: React.ReactNode;
  onTextSelect: Props["onTextSelect"];
}) {
  const ref = useRef<HTMLDivElement>(null);

  function handlePointerUp() {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !ref.current) return;

    const range = sel.getRangeAt(0);
    if (!ref.current.contains(range.commonAncestorContainer)) return;
    if (!sel.toString().trim()) return;

    const startOffset = getTextOffset(ref.current, range.startContainer, range.startOffset);
    const endOffset = getTextOffset(ref.current, range.endContainer, range.endOffset);
    if (startOffset === endOffset) return;

    const rect = range.getBoundingClientRect();
    onTextSelect(
      blockIndex,
      Math.min(startOffset, endOffset),
      Math.max(startOffset, endOffset),
      rect.left + rect.width / 2,
      rect.top,
    );
  }

  return (
    <div ref={ref} onPointerUp={handlePointerUp}>
      {children}
    </div>
  );
}

// ── RichText ──────────────────────────────────────────────

interface RichTextProps {
  text: string;
  bold?: boolean;
  italic?: boolean;
  highlights: Highlight[];
  onBibleRefPress: (ref: BibleReference) => void;
  onHighlightClick: (highlight: Highlight) => void;
  fontSize: number;
  colors: ReturnType<typeof useTheme>["colors"];
}

function RichText({
  text,
  bold,
  italic,
  highlights,
  onBibleRefPress,
  onHighlightClick,
  fontSize,
  colors,
}: RichTextProps) {
  const segments = buildSegments(text, highlights);
  const highlightMap = new Map(highlights.map((h) => [h.id, h]));

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
        if (seg.highlightId && seg.highlightColor) {
          const highlight = highlightMap.get(seg.highlightId);
          return (
            <mark
              key={i}
              style={{
                backgroundColor: seg.highlightColor,
                borderRadius: 2,
                padding: "0 1px",
                cursor: "pointer",
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (highlight) onHighlightClick(highlight);
              }}
            >
              {seg.bibleRef ? (
                <BibleReferenceLink reference={seg.bibleRef} onPress={onBibleRefPress} />
              ) : (
                seg.text
              )}
            </mark>
          );
        }

        if (seg.bibleRef) {
          return <BibleReferenceLink key={i} reference={seg.bibleRef} onPress={onBibleRefPress} />;
        }

        return <span key={i}>{seg.text}</span>;
      })}
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

export default function LessonContent({
  blocks,
  highlights,
  onBibleRefPress,
  onTextSelect,
  onHighlightClick,
}: Props) {
  const { colors, fontSize } = useTheme();

  return (
    <div>
      {blocks.map((block, blockIndex) => {
        const blockHighlights = highlights.filter((h) => h.blockIndex === blockIndex);
        const richTextProps = {
          highlights: blockHighlights,
          onBibleRefPress,
          onHighlightClick,
          fontSize,
          colors,
        };

        return (
          <BlockWrapper key={blockIndex} blockIndex={blockIndex} onTextSelect={onTextSelect}>
            <div style={{ marginBottom: 12 }}>
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
          </BlockWrapper>
        );
      })}
    </div>
  );
}
