export type ParsedImportRow = {
  rowNumber: number;
  exam: string;
  subject: string;
  topic: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: "A" | "B" | "C" | "D";
  explanation?: string;
  difficulty: "easy" | "medium" | "hard";
  marks: number;
  negativeMarks: number;
  isValid: boolean;
  errors: string[];
};

export type BulkImportResult = {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  importedCount: number;
  errors: string[];
};

export function parseCSV(content: string): ParsedImportRow[] {
  const lines = splitCSVLines(content);
  if (lines.length < 2) {
    return [];
  }

  // Parse header
  const header = parseCSVRow(lines[0]).map((h) => h.trim().toLowerCase());
  const colIndex = {
    exam: header.indexOf("exam"),
    subject: header.indexOf("subject"),
    topic: header.indexOf("topic"),
    question_text: header.findIndex((h) => h === "question_text" || h === "question"),
    option_a: header.indexOf("option_a"),
    option_b: header.indexOf("option_b"),
    option_c: header.indexOf("option_c"),
    option_d: header.indexOf("option_d"),
    correct_option: header.findIndex((h) => h === "correct_option" || h === "correct"),
    explanation: header.indexOf("explanation"),
    difficulty: header.indexOf("difficulty"),
    marks: header.indexOf("marks"),
    negative_marks: header.findIndex((h) => h === "negative_marks" || h === "negativemarks"),
  };

  const parsedRows: ParsedImportRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) continue;

    const cols = parseCSVRow(rawLine);
    const rowNumber = i + 1;
    const errors: string[] = [];

    const exam = (colIndex.exam !== -1 ? cols[colIndex.exam] : "")?.trim() || "";
    const subject = (colIndex.subject !== -1 ? cols[colIndex.subject] : "")?.trim() || "";
    const topic = (colIndex.topic !== -1 ? cols[colIndex.topic] : "")?.trim() || "";
    const questionText = (colIndex.question_text !== -1 ? cols[colIndex.question_text] : "")?.trim() || "";
    const optionA = (colIndex.option_a !== -1 ? cols[colIndex.option_a] : "")?.trim() || "";
    const optionB = (colIndex.option_b !== -1 ? cols[colIndex.option_b] : "")?.trim() || "";
    const optionC = (colIndex.option_c !== -1 ? cols[colIndex.option_c] : "")?.trim() || "";
    const optionD = (colIndex.option_d !== -1 ? cols[colIndex.option_d] : "")?.trim() || "";
    const rawCorrect = (colIndex.correct_option !== -1 ? cols[colIndex.correct_option] : "")?.trim().toUpperCase() || "";
    const explanation = (colIndex.explanation !== -1 ? cols[colIndex.explanation] : "")?.trim() || undefined;
    const rawDiff = (colIndex.difficulty !== -1 ? cols[colIndex.difficulty] : "")?.trim().toLowerCase() || "medium";
    const rawMarks = colIndex.marks !== -1 ? Number(cols[colIndex.marks]) : 1;
    const rawNeg = colIndex.negative_marks !== -1 ? Number(cols[colIndex.negative_marks]) : 0;

    if (!exam) errors.push("Missing exam name.");
    if (!subject) errors.push("Missing subject name.");
    if (!topic) errors.push("Missing topic name.");
    if (!questionText) errors.push("Missing question text.");
    if (!optionA) errors.push("Missing Option A.");
    if (!optionB) errors.push("Missing Option B.");
    if (!optionC) errors.push("Missing Option C.");
    if (!optionD) errors.push("Missing Option D.");

    let correctOption: "A" | "B" | "C" | "D" = "A";
    if (["A", "B", "C", "D"].includes(rawCorrect)) {
      correctOption = rawCorrect as "A" | "B" | "C" | "D";
    } else if (rawCorrect === "1") correctOption = "A";
    else if (rawCorrect === "2") correctOption = "B";
    else if (rawCorrect === "3") correctOption = "C";
    else if (rawCorrect === "4") correctOption = "D";
    else errors.push(`Invalid correct option "${rawCorrect}". Must be A, B, C, or D.`);

    let difficulty: "easy" | "medium" | "hard" = "medium";
    if (["easy", "medium", "hard"].includes(rawDiff)) {
      difficulty = rawDiff as "easy" | "medium" | "hard";
    }

    const marks = isNaN(rawMarks) || rawMarks <= 0 ? 1 : rawMarks;
    const negativeMarks = isNaN(rawNeg) || rawNeg < 0 ? 0 : rawNeg;

    parsedRows.push({
      rowNumber,
      exam,
      subject,
      topic,
      questionText,
      optionA,
      optionB,
      optionC,
      optionD,
      correctOption,
      explanation,
      difficulty,
      marks,
      negativeMarks,
      isValid: errors.length === 0,
      errors,
    });
  }

  return parsedRows;
}

export function splitCSVLines(text: string): string[] {
  const lines: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      inQuotes = !inQuotes;
      current += char;
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && text[i + 1] === "\n") {
        i++;
      }
      if (current.trim()) {
        lines.push(current);
      }
      current = "";
    } else {
      current += char;
    }
  }

  if (current.trim()) {
    lines.push(current);
  }

  return lines;
}

export function parseCSVRow(rowText: string): string[] {
  const cols: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < rowText.length; i++) {
    const char = rowText[i];
    if (char === '"') {
      if (inQuotes && rowText[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      cols.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  cols.push(current.trim());
  return cols;
}
