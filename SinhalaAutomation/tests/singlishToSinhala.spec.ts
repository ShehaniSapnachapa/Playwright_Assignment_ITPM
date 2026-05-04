import { test, expect } from '@playwright/test';
import ExcelJS from 'exceljs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Normalize function: collapse whitespace for comparison
function normalize(text?: string | null) {
  return (text ?? '').replace(/\s+/g, ' ').trim();
}

// Excel file paths
const inputExcelPath  = path.resolve(__dirname, '../../Test_Cases.xlsx');
const outputExcelPath = path.resolve(__dirname, '../../Testing_results.xlsx');

// Row data type
interface TestCase {
  rowNumber: number;
  tcId: string;
  testCaseName: string;
  inputLengthType: string;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  status: string;
  singlishTypes: string;
  evidence: string;
}

// Shared state populated in beforeAll
let testCases: TestCase[] = [];
let workbook: ExcelJS.Workbook;
let worksheet: ExcelJS.Worksheet;

// Column index map (1-based) — matches the Excel template exactly
// Col: 1=TC ID  2=Test case name  3=Input length type  4=Input
//      5=Expected output  6=Actual output  7=Status
//      8=Singlish input types covered  9=Evidence or rationale
const COL = {
  tcId:             1,
  testCaseName:     2,
  inputLengthType:  3,
  input:            4,
  expectedOutput:   5,
  actualOutput:     6,
  status:           7,
  singlishTypes:    8,
  evidence:         9,
};

// Target URL — Chat Sinhala transliteration on PixelsSuite
const TARGET_URL = 'https://www.pixelssuite.com/chat-translator';

// Selectors (confirmed from live page inspection)
const INPUT_SELECTOR   = 'textarea[placeholder="Type your English text here…"]';
const OUTPUT_SELECTOR  = 'textarea[placeholder="Transliterated Sinhala will appear here…"]';
const TRANSLATE_BTN    = 'button:has-text("Transliterate")';

// ─── One test per Excel row ──────────────────────────────────────────────────
test.describe('Singlish to Sinhala – Negative Test Cases', () => {
  // Load Excel INSIDE the describe so beforeAll/afterAll are properly scoped
  // (prevents hooks from re-running on each retry)
  test.beforeAll(async () => {
    workbook  = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(inputExcelPath);
    worksheet = workbook.worksheets[0];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // skip header row

      const cell = (col: number) =>
        normalize(String(row.getCell(col).value ?? ''));

      const tc: TestCase = {
        rowNumber,
        tcId:            cell(COL.tcId),
        testCaseName:    cell(COL.testCaseName),
        inputLengthType: cell(COL.inputLengthType),
        input:           cell(COL.input),
        expectedOutput:  cell(COL.expectedOutput),
        actualOutput:    '',
        status:          '',
        singlishTypes:   cell(COL.singlishTypes),
        evidence:        cell(COL.evidence),
      };

      if (tc.tcId) testCases.push(tc);
    });
  });

  for (let i = 0; i < 50; i++) {
    test(`Row ${i + 2}`, async ({ page }) => {
      const tc = testCases[i];
      if (!tc) test.skip();

      test.info().annotations.push({ type: 'TC ID',   description: tc.tcId });
      test.info().annotations.push({ type: 'TC Name', description: tc.testCaseName });

      await page.goto(TARGET_URL);

      const inputField   = page.locator(INPUT_SELECTOR);
      const outputField  = page.locator(OUTPUT_SELECTOR);
      const translateBtn = page.locator(TRANSLATE_BTN);

      await inputField.waitFor({ state: 'visible', timeout: 15000 });
      await inputField.fill('');
      await inputField.fill(tc.input);
      await translateBtn.click();

      // Wait for the "Transliterating…" busy state to start (confirms click registered)
      const processingBtn = page.locator('button:has-text("Transliterating")');
      await processingBtn.waitFor({ state: 'visible', timeout: 10000 });

      // Wait for "Transliterating…" to disappear — API call finished (success or "Failed to fetch")
      await processingBtn.waitFor({ state: 'hidden', timeout: 90000 });

      // Read whatever the output contains (may be empty on API error)
      const actual = await outputField.inputValue();
      tc.actualOutput = actual;

      if (actual.trim() === '') {
        // API returned an error ("Failed to fetch") — no Sinhala output produced
        tc.status = 'Fail';
        console.warn(`[${tc.tcId}] API Error — no output returned (Failed to fetch)`);
      } else if (!tc.expectedOutput) {
        console.warn(`[${tc.tcId}] No expected output — skipping comparison`);
        tc.status = 'No Expected Output';
      } else {
        const passed = normalize(actual) === normalize(tc.expectedOutput);
        tc.status = passed ? 'Pass' : 'Fail';
        if (!passed) {
          console.warn(
            `[${tc.tcId}] MISMATCH\n  Expected: ${tc.expectedOutput}\n  Actual:   ${actual}`
          );
        }
      }
    });
  }

  // ─── Write results back to Excel after ALL tests in this describe complete ──
  test.afterAll(async () => {
    if (!worksheet || testCases.length === 0) return;

    for (const tc of testCases) {
      worksheet.getRow(tc.rowNumber).getCell(COL.actualOutput).value = tc.actualOutput;
      worksheet.getRow(tc.rowNumber).getCell(COL.status).value       = tc.status;
      worksheet.getRow(tc.rowNumber).commit();
    }

    await workbook.xlsx.writeFile(outputExcelPath);
    console.log(`Results saved to: ${outputExcelPath}`);
  });
});
