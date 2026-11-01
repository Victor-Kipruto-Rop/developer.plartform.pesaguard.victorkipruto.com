import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const source = await readFile(new URL("../src/lib/onboardingText.ts", import.meta.url), "utf8");
const module = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const { toUppercaseOnboardingText } = await import(
  `data:text/javascript;base64,${Buffer.from(module).toString("base64")}`
);

test("converts onboarding details to uppercase without trimming user input", () => {
  assert.equal(toUppercaseOnboardingText("  Acme Payments Ltd  "), "  ACME PAYMENTS LTD  ");
});

test("preserves already-uppercase onboarding details", () => {
  assert.equal(toUppercaseOnboardingText("NAIROBI"), "NAIROBI");
});
