"use client";

import { useMemo } from "react";
import { parseMathText } from "@/lib/math/katex-parser";

interface MathTextProps {
  text: string | null | undefined;
  className?: string;
  as?: "span" | "div" | "p" | "h2" | "h3";
}

export function MathText({
  text,
  className,
  as: Component = "span",
}: MathTextProps) {
  const chunks = useMemo(() => parseMathText(text), [text]);

  if (!text) return null;

  return (
    <Component className={className}>
      {chunks.map((chunk, index) => {
        if (chunk.type === "text") {
          return <span key={index}>{chunk.content}</span>;
        }

        if (chunk.isBlock) {
          return (
            <span
              key={index}
              className="my-2 block overflow-x-auto text-center"
              dangerouslySetInnerHTML={{ __html: chunk.html }}
            />
          );
        }

        return (
          <span
            key={index}
            className="inline-math px-0.5"
            dangerouslySetInnerHTML={{ __html: chunk.html }}
          />
        );
      })}
    </Component>
  );
}
