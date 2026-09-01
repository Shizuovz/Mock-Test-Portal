import { describe, expect, it } from "vitest";
import { cacheTags } from "./tags";

describe("Cache Tags Architecture", () => {
  it("generates exact cache tags defined in Architecture.md Section 15.3", () => {
    expect(cacheTags.exams).toBe("exams");
    expect(cacheTags.exam("e-123")).toBe("exam:e-123");
    expect(cacheTags.subjects).toBe("subjects");
    expect(cacheTags.subject("s-123")).toBe("subject:s-123");
    expect(cacheTags.topics).toBe("topics");
    expect(cacheTags.topic("tp-123")).toBe("topic:tp-123");
    expect(cacheTags.tests).toBe("tests");
    expect(cacheTags.test("t-123")).toBe("test:t-123");
    expect(cacheTags.questionsForTest("t-123")).toBe("questions:t-123");
  });
});
