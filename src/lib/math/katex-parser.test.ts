import { describe, expect, it } from "vitest";
import { parseMathText } from "./katex-parser";

describe("KaTeX Math Parser (PRD LaTeX Support)", () => {
  it("renders pure plain text without math chunks", () => {
    const chunks = parseMathText("What is the capital of France?");
    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toEqual({
      type: "text",
      content: "What is the capital of France?",
    });
  });

  it("parses and renders inline LaTeX with $...$", () => {
    const chunks = parseMathText("Solve for x: $x^2 + 5x + 6 = 0$");
    expect(chunks).toHaveLength(2);
    expect(chunks[0].type).toBe("text");
    expect(chunks[0].content).toBe("Solve for x: ");

    expect(chunks[1].type).toBe("math");
    if (chunks[1].type === "math") {
      expect(chunks[1].content).toBe("x^2 + 5x + 6 = 0");
      expect(chunks[1].isBlock).toBe(false);
      expect(chunks[1].html).toContain("katex");
    }
  });

  it("parses and renders block/display LaTeX with $$...$$", () => {
    const chunks = parseMathText("The quadratic formula is:\n$$\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$\nFind the roots.");
    expect(chunks).toHaveLength(3);
    expect(chunks[0].type).toBe("text");
    expect(chunks[1].type).toBe("math");
    if (chunks[1].type === "math") {
      expect(chunks[1].isBlock).toBe(true);
      expect(chunks[1].html).toContain("katex-display");
    }
    expect(chunks[2].type).toBe("text");
    expect(chunks[2].content).toBe("\nFind the roots.");
  });

  it("parses alternative LaTeX delimiters \\(...\\) and \\[...\\]", () => {
    const inlineChunks = parseMathText("Evaluate \\(\\sqrt{144}\\)");
    expect(inlineChunks).toHaveLength(2);
    expect(inlineChunks[1].type).toBe("math");

    const blockChunks = parseMathText("Evaluate \\[\n\\int_0^1 x^2 dx\n\\]");
    expect(blockChunks).toHaveLength(2);
    expect(blockChunks[1].type).toBe("math");
    if (blockChunks[1].type === "math") {
      expect(blockChunks[1].isBlock).toBe(true);
    }
  });

  it("handles null, empty, or undefined input gracefully", () => {
    expect(parseMathText(null)).toEqual([]);
    expect(parseMathText(undefined)).toEqual([]);
    expect(parseMathText("")).toEqual([]);
  });

  it("gracefully falls back when invalid LaTeX is supplied without crashing", () => {
    const chunks = parseMathText("Invalid math: $\\invalidcommand{123}$");
    expect(chunks).toBeDefined();
    // KaTeX with throwOnError: false renders the formula with an error element or fallback
    expect(chunks[1].type).toBe("math");
  });
});
