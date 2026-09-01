"use client";

import { useState } from "react";
import { parseCSV, type ParsedImportRow, type BulkImportResult } from "@/lib/admin/bulk-import-parser";
import { importQuestionsAction } from "@/lib/actions/import-actions";

const SAMPLE_CSV = `exam,subject,topic,question_text,option_a,option_b,option_c,option_d,correct_option,explanation,difficulty,marks,negative_marks
SSC CGL,Quantitative Aptitude,Percentage,"What is 25% of 240?",50,60,70,80,B,"25% of 240 = 240 / 4 = 60",easy,2,0.5
SSC CGL,English,Grammar,"Identify the synonym of CANDID",Biased,Frank,Secretive,Deceptive,B,"Candid means frank and outspoken",medium,2,0.5`;

export function BulkImportPreview() {
  const [csvContent, setCsvContent] = useState("");
  const [parsedRows, setParsedRows] = useState<ParsedImportRow[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<BulkImportResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleCsvChange(text: string) {
    setCsvContent(text);
    setResult(null);
    setErrorMessage(null);
    if (text.trim()) {
      const rows = parseCSV(text);
      setParsedRows(rows);
    } else {
      setParsedRows([]);
    }
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      handleCsvChange(content);
    };
    reader.readAsText(file);
  }

  function loadSample() {
    handleCsvChange(SAMPLE_CSV);
  }

  async function handleImport() {
    if (parsedRows.filter((r) => r.isValid).length === 0) return;
    setIsImporting(true);
    setErrorMessage(null);

    try {
      const res = await importQuestionsAction(csvContent);
      setResult(res);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : String(err));
    } finally {
      setIsImporting(false);
    }
  }

  const validCount = parsedRows.filter((r) => r.isValid).length;
  const invalidCount = parsedRows.length - validCount;

  return (
    <div className="space-y-6">
      {/* Upload/Paste controls */}
      <div className="rounded-lg border border-[#ccd8d4] bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-[#15171a]">Provide CSV Question Data</h2>
            <p className="mt-1 text-sm text-[#475467]">
              Upload a .csv file or paste your formatted spreadsheet rows below.
            </p>
          </div>
          <button
            type="button"
            onClick={loadSample}
            className="rounded-md border border-[#ccd8d4] bg-[#fbfcfb] px-3 py-1.5 text-xs font-semibold text-[#146b5f] hover:bg-[#f4f6f5]"
          >
            Paste Sample Template
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="inline-flex cursor-pointer items-center justify-center rounded-md border border-[#ccd8d4] bg-white px-4 py-2 text-sm font-semibold text-[#15171a] shadow-sm hover:bg-[#f4f6f5]">
            <span>Choose CSV File</span>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          <span className="text-xs text-[#667085]">Required columns: exam, subject, topic, question_text, option_a, option_b, option_c, option_d, correct_option</span>
        </div>

        <div className="mt-4">
          <textarea
            value={csvContent}
            onChange={(e) => handleCsvChange(e.target.value)}
            rows={7}
            placeholder="Paste CSV rows with header here..."
            className="w-full font-mono rounded-md border border-[#ccd8d4] p-3 text-xs focus:border-[#146b5f] focus:outline-none"
          />
        </div>
      </div>

      {/* Parsing Summary & Actions */}
      {parsedRows.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-[#d9dee7] bg-white p-4">
          <div className="flex items-center gap-4 text-sm">
            <span className="font-semibold text-[#15171a]">
              Total Rows: {parsedRows.length}
            </span>
            <span className="inline-flex items-center rounded-full bg-[#ecfdf3] px-2.5 py-0.5 text-xs font-semibold text-[#027a48]">
              {validCount} Valid
            </span>
            {invalidCount > 0 && (
              <span className="inline-flex items-center rounded-full bg-[#fef3f2] px-2.5 py-0.5 text-xs font-semibold text-[#b42318]">
                {invalidCount} Errors
              </span>
            )}
          </div>

          <button
            type="button"
            disabled={validCount === 0 || isImporting}
            onClick={handleImport}
            className="rounded-md bg-[#146b5f] px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#0f544a] disabled:opacity-50"
          >
            {isImporting ? "Importing..." : `Confirm & Import ${validCount} Questions`}
          </button>
        </div>
      )}

      {/* Result feedback */}
      {result && (
        <div className="rounded-lg border border-[#bbf7d0] bg-[#f0fdf4] p-5 text-sm text-[#166534]">
          <h3 className="font-semibold text-[#15803d]">✓ Import Completed!</h3>
          <p className="mt-1">
            Successfully imported <strong>{result.importedCount}</strong> questions into the question bank.
          </p>
          {result.errors.length > 0 && (
            <ul className="mt-3 list-disc pl-5 text-xs text-[#b42318]">
              {result.errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {errorMessage && (
        <div className="rounded-lg border border-[#fecdca] bg-[#fffbfa] p-4 text-sm text-[#b42318]">
          {errorMessage}
        </div>
      )}

      {/* Preview Table */}
      {parsedRows.length > 0 && (
        <div className="rounded-lg border border-[#d9dee7] bg-white shadow-sm overflow-hidden">
          <div className="border-b border-[#d9dee7] px-6 py-4">
            <h3 className="font-semibold text-[#15171a]">Parsed Questions Preview</h3>
          </div>
          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 border-b border-[#eaecf0] bg-[#f9fafb] font-semibold text-[#475467]">
                <tr>
                  <th className="px-4 py-3">Row</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Exam / Subject / Topic</th>
                  <th className="px-4 py-3">Question Text</th>
                  <th className="px-4 py-3">Options (A / B / C / D)</th>
                  <th className="px-4 py-3">Correct</th>
                  <th className="px-4 py-3">Marks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eaecf0]">
                {parsedRows.map((row) => (
                  <tr
                    key={row.rowNumber}
                    className={row.isValid ? "hover:bg-[#f8f9fa]" : "bg-[#fffbfa] hover:bg-[#fee4e2]/50"}
                  >
                    <td className="px-4 py-3 font-mono font-medium">{row.rowNumber}</td>
                    <td className="px-4 py-3">
                      {row.isValid ? (
                        <span className="rounded bg-[#ecfdf3] px-2 py-0.5 font-semibold text-[#027a48]">
                          Valid
                        </span>
                      ) : (
                        <div className="space-y-1">
                          <span className="rounded bg-[#fef3f2] px-2 py-0.5 font-semibold text-[#b42318]">
                            Error
                          </span>
                          <p className="text-[10px] text-[#b42318]">{row.errors.join("; ")}</p>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-[#15171a]">{row.exam}</div>
                      <div className="text-[#667085]">
                        {row.subject} &gt; {row.topic}
                      </div>
                    </td>
                    <td className="px-4 py-3 max-w-[250px] truncate" title={row.questionText}>
                      {row.questionText}
                    </td>
                    <td className="px-4 py-3 text-[11px] text-[#475467]">
                      <div>A: {row.optionA}</div>
                      <div>B: {row.optionB}</div>
                      <div>C: {row.optionC}</div>
                      <div>D: {row.optionD}</div>
                    </td>
                    <td className="px-4 py-3 font-bold text-[#146b5f]">{row.correctOption}</td>
                    <td className="px-4 py-3">
                      +{row.marks} / -{row.negativeMarks}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
