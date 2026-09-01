import { describe, expect, it } from "vitest";
import { parseCSV } from "./bulk-import";

describe("parseCSV", () => {
  it("parses valid CSV rows into typed question records", () => {
    const csv = `exam,subject,topic,question_text,option_a,option_b,option_c,option_d,correct_option,explanation,difficulty,marks,negative_marks
SSC CGL,Quant,Ratio,"What is ratio of 2 to 4?",1:2,1:3,1:4,2:1,A,"2/4 = 1/2",easy,2,0.5`;

    const rows = parseCSV(csv);
    expect(rows).toHaveLength(1);
    expect(rows[0].isValid).toBe(true);
    expect(rows[0].exam).toBe("SSC CGL");
    expect(rows[0].correctOption).toBe("A");
    expect(rows[0].marks).toBe(2);
    expect(rows[0].negativeMarks).toBe(0.5);
    expect(rows[0].errors).toHaveLength(0);
  });

  it("detects invalid rows with missing required columns or invalid correct option", () => {
    const csv = `exam,subject,topic,question_text,option_a,option_b,option_c,option_d,correct_option
SSC CGL,Quant,Ratio,"Broken question",A,B,,D,Z`;

    const rows = parseCSV(csv);
    expect(rows).toHaveLength(1);
    expect(rows[0].isValid).toBe(false);
    expect(rows[0].errors).toContain("Missing Option C.");
    expect(rows[0].errors.some((e) => e.includes("Invalid correct option"))).toBe(true);
  });

  it("handles numeric correct options 1, 2, 3, 4 gracefully", () => {
    const csv = `exam,subject,topic,question_text,option_a,option_b,option_c,option_d,correct_option
SSC CGL,English,Vocab,"Select correct",Opt1,Opt2,Opt3,Opt4,3`;

    const rows = parseCSV(csv);
    expect(rows).toHaveLength(1);
    expect(rows[0].isValid).toBe(true);
    expect(rows[0].correctOption).toBe("C");
  });
});
