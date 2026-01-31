# IT23390614 – Playwright-project-assignment

# Overview
This project automates functional testing of the Singlish-to-Sinhala transliteration system available at Swift Translator.
The automation verifies translation accuracy, covering positive, negative, and UI test scenarios, as required by IT3040 – ITPM Assignment 1.

```bash

The project:
-- Reads test cases from 'IT23390614.xlsx'.
-- Automates input and captures the output in real-time.
-- Compares actual output with expected output.
-- Writes results into 'IT23390614_results.xlsx'.

## Folder Structure
IT23390614/
 ─ SinhalaAutomation/ # Playwright scripts and configuration
 ─ IT23390614.xlsx # Input Excel file with test cases
 ─ IT23390614_results.xlsx # Output Excel file with results
 ─ README.md # This file

## Prerequisites

Node.js (version 18 or higher)
npm (version 9 or higher)
Playwright testing framework

## Installation

```bash

1. Clone the repositary:

git clone <your-github-repo-link>
cd IT23390614/SinhalaAutomation

2. Install dependencies:

npm install
npx playwright install

3. Run Tests
    Run all tests: npx playwright test
    Run a specific test: npx playwright test -g "Pos_Fun_0001"

Excel Test Cases
    Input: IT23390614.xlsx contains all test cases (positive, negative, UI) following the standard template.
    Output: IT23390614_results.xlsx is generated automatically after running tests.



