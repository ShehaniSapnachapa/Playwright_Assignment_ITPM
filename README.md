# IT23390614 – Singlish-to-Sinhala Transliteration Automation

## Overview

This project automates **negative test cases** for the Chat Sinhala transliteration function available at:

> **https://www.pixelssuite.com/chat-translator**

It is submitted as Assignment 1 for IT3040 – ITPM (Year 3, Semester 1).

The automation:
- Reads 50 negative test cases from `Test_Cases.xlsx`
- Types each input into the live transliteration tool
- Clicks **Transliterate** and captures the actual Sinhala output
- Compares the actual output against the expected output
- Writes `Actual output` and `Status` (Pass/Fail) back into `Testing_results.xlsx`

---

## Folder Structure

```
IT23390614/
├── SinhalaAutomation/
│   ├── tests/
│   │   └── singlishToSinhala.spec.ts   # Main Playwright test file
│   ├── playwright.config.ts             # Playwright configuration
│   ├── package.json                     # Node.js dependencies
│   └── test-results/                    # Generated test artifacts (screenshots, videos)
├── Test_Cases.xlsx                      # Input: 50 negative test cases
├── Testing_results.xlsx                 # Output: generated after running tests
└── README.md
```

---

## Prerequisites

- **Node.js** v18 or higher — https://nodejs.org
- **npm** v9 or higher (bundled with Node.js)

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/ShehaniSapnachapa/Playwright_Assignment_ITPM.git
cd Playwright_Assignment_ITPM/SinhalaAutomation
```

### 2. Install dependencies

```bash
npm install
```

### 3. Install Playwright browsers (one-time)

```bash
npx playwright install chromium
```

---

## Running the Tests

From inside the `SinhalaAutomation/` folder:

```bash
# Run all 50 test cases (headless by default)
npx playwright test

# Run with browser visible
npx playwright test --headed

# Run a single test case by its TC ID
npx playwright test -g "Neg_0001"

# View the HTML report after the run
npx playwright show-report test-results/html-report
```

---

## Results

After the test run completes:
- `Testing_results.xlsx` is created in the **root** (`IT23390614/`) folder
- It contains all original columns plus `Actual output` and `Status` filled in automatically
- Screenshots and videos for any failed tests are saved in `SinhalaAutomation/test-results/artifacts/`

---

## Excel File Format

`Test_Cases.xlsx` follows the assignment template with these columns:

| TC ID | Test case name | Input Length type | Input | Expected output | Actual output | Status | ... |
|-------|---------------|-------------------|-------|-----------------|---------------|--------|-----|

All 50 test cases are **negative** (TC IDs begin with `Neg_`) and cover all 24 Singlish input types defined in Appendix 1 of the assignment.


