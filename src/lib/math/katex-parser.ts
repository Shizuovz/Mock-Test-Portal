import katex from "katex";

export type MathChunk =
  | { type: "text"; content: string }
  | { type: "math"; content: string; isBlock: boolean; html: string };

/**
 * Parses raw text containing LaTeX mathematical notations ($...$, $$...$$, \(...\), \[...\])
 * and generates pre-rendered KaTeX HTML chunks.
 */
export function parseMathText(rawText: string | null | undefined): MathChunk[] {
  if (!rawText) return [];

  const chunks: MathChunk[] = [];

  // Regex matching:
  // 1. Block math: $$...$$ or \[...\]
  // 2. Inline math: $...$ or \(...\)
  const mathRegex = /(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|(?<!\\)\$[^\$\n]+?\$|\\\([\s\S]+?\\\))/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = mathRegex.exec(rawText)) !== null) {
    const matchIndex = match.index;
    const matchedText = match[0];

    // Push preceding text chunk
    if (matchIndex > lastIndex) {
      chunks.push({
        type: "text",
        content: rawText.slice(lastIndex, matchIndex),
      });
    }

    let mathExpr = "";
    let isBlock = false;

    if (matchedText.startsWith("$$") && matchedText.endsWith("$$")) {
      mathExpr = matchedText.slice(2, -2).trim();
      isBlock = true;
    } else if (matchedText.startsWith("\\[") && matchedText.endsWith("\\]")) {
      mathExpr = matchedText.slice(2, -2).trim();
      isBlock = true;
    } else if (matchedText.startsWith("\\(") && matchedText.endsWith("\\)")) {
      mathExpr = matchedText.slice(2, -2).trim();
      isBlock = false;
    } else if (matchedText.startsWith("$") && matchedText.endsWith("$")) {
      mathExpr = matchedText.slice(1, -1).trim();
      isBlock = false;
    }

    try {
      const html = katex.renderToString(mathExpr, {
        displayMode: isBlock,
        throwOnError: false,
        output: "htmlAndMathml",
      });

      chunks.push({
        type: "math",
        content: mathExpr,
        isBlock,
        html,
      });
    } catch {
      // Fallback: render raw text if KaTeX parser encounters unrecoverable syntax
      chunks.push({
        type: "text",
        content: matchedText,
      });
    }

    lastIndex = matchIndex + matchedText.length;
  }

  // Push any remaining trailing text
  if (lastIndex < rawText.length) {
    chunks.push({
      type: "text",
      content: rawText.slice(lastIndex),
    });
  }

  return chunks;
}
