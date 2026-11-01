import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const source = await readFile(new URL("../src/lib/passwordFeedback.ts", import.meta.url), "utf8");
const module = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const { getPasswordFeedback } = await import(
  `data:text/javascript;base64,${Buffer.from(module).toString("base64")}`
);

test("reports the server's minimum character and maximum UTF-8 byte requirements", () => {
  const feedback = getPasswordFeedback("123456789012", "");
  assert.equal(feedback.characterCount, 12);
  assert.equal(feedback.utf8Bytes, 12);
  assert.equal(feedback.requirements.minimumLength.met, true);
  assert.equal(feedback.requirements.maximumBytes.met, true);
});

test("counts Unicode code points and UTF-8 bytes like the backend password policy", () => {
  const feedback = getPasswordFeedback("😀".repeat(19), "");
  assert.equal(feedback.characterCount, 19);
  assert.equal(feedback.utf8Bytes, 76);
  assert.equal(feedback.requirements.minimumLength.met, true);
  assert.equal(feedback.requirements.maximumBytes.met, false);
});

test("marks confirmation as satisfied only after a non-empty exact match", () => {
  assert.equal(getPasswordFeedback("long-enough-pass", "").requirements.matches.met, false);
  assert.equal(getPasswordFeedback("long-enough-pass", "different").requirements.matches.met, false);
  assert.equal(getPasswordFeedback("long-enough-pass", "long-enough-pass").requirements.matches.met, true);
});

test("does not mark password requirements as satisfied before typing starts", () => {
  const feedback = getPasswordFeedback("", "");
  assert.equal(feedback.requirements.minimumLength.met, false);
  assert.equal(feedback.requirements.maximumBytes.met, false);
  assert.equal(feedback.requirements.matches.met, false);
});

test("estimates password strength from length and character variety without exposing the password", () => {
  const short = getPasswordFeedback("a", "");
  const stronger = getPasswordFeedback("R4ndom!phrase-92", "");
  assert.ok(stronger.strength.score > short.strength.score);
  assert.ok(stronger.strength.score <= stronger.strength.maximum);
  assert.equal("password" in stronger, false);
});
