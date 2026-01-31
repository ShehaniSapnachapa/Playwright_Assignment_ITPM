import { test, expect } from '@playwright/test';
import XLSX from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';

// ES module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Normalize function: ignore extra whitespace
function normalize(text?: string) {
  return (text ?? '').replace(/\s+/g, ' ').trim();
}

// Excel file path
const excelFilePath = path.resolve(__dirname, '../../IT23390614.xlsx');

// Interface matching for real Excel columns
interface TestCase {
  'TC ID': string;
  'Test case name': string;
  'Input Length type': string;
  'Input': string;
  'type': string;
  'Expected output'?: string;
  'Actual output'?: string;
  'Status'?: string;
  'Accuracy justification/ Description of issue type'?: string;
  'What is covered by the test'?: string;
}

// Read workbook
const workbook = XLSX.readFile(excelFilePath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const testCases: TestCase[] = XLSX.utils.sheet_to_json<TestCase>(sheet, { defval: '' });

// Dynamic tests
test.describe('Singlish to Sinhala Tests', () => {
  testCases.forEach(tc => {
    const id = tc['TC ID'];
    const testCaseName = tc['Test case name'];
    const inputText = tc['Input'];
    const expected = tc['Expected output'];

    test(`${id} - ${testCaseName}`, async ({ page }) => {
      await page.goto('https://www.swifttranslator.com/');

      // Correct selectors
      const inputField = page.locator(
        'textarea[placeholder="Input Your Singlish Text Here."]'
      );

      // Use .first() in case multiple matching divs exist
      const outputField = page.locator('div.whitespace-pre-wrap').first();

      // Wait for input field and fill text
      await inputField.waitFor({ state: 'visible', timeout: 10000 });
      await inputField.fill(inputText);

      // Wait until translation appears
      await expect(outputField).not.toHaveText('', { timeout: 10000 });

      // Read actual output
      const actual = (await outputField.textContent()) ?? '';
      tc['Actual output'] = actual;

      // Compare normalized text
      if (!expected || expected.trim() === '') {
        console.warn(`Expected output missing in Excel for ${id}`);
        tc['Status'] = 'No Expected Output';
      } else {
        tc['Status'] = normalize(actual) === normalize(expected) ? 'Pass' : 'Fail';
        if (tc['Status'] === 'Fail') {
          console.warn(`Mismatch in ${id}\nExpected: ${expected}\nActual: ${actual}`);
        }
      }
    });
  });
});

// Write results to Excel after all tests
test.afterAll(() => {
  const resultSheet = XLSX.utils.json_to_sheet(testCases, { skipHeader: false });
  XLSX.utils.book_append_sheet(workbook, resultSheet, 'Results');
  XLSX.writeFile(
    workbook,
    path.resolve(__dirname, '../../IT23390614_results.xlsx')
  );
  console.log('Results saved to IT23390614_results.xlsx');
});
