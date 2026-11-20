import assert from "node:assert/strict";
import test from "node:test";
import { confusableSkeleton } from "../../frontend/src/lib/scanner/unicode.ts";
import { scanUrl } from "../../frontend/src/lib/scanner/engine.ts";

test("Unicode and Punycode lookalikes match the same brand skeleton", () => {
  assert.equal(confusableSkeleton("exаmple"), confusableSkeleton("example"));
  assert.equal(
    confusableSkeleton("xn--exmple-4nf"),
    confusableSkeleton("example"),
  );
  for (const host of ["exаmple.com", "xn--exmple-4nf.com"]) {
    const result = scanUrl("https://" + host);
    assert.ok(
      result.findings.some((f) => f.ruleId === "brand-lookalike-example"),
    );
    assert.equal(result.score, null);
  }
});

test("ordinary non-Latin domains do not acquire a Unicode penalty", () => {
  for (const host of ["яндекс.рф", "例子.com"]) {
    const result = scanUrl("https://" + host);
    assert.equal(
      result.findings.some(
        (f) =>
          f.category === "brand-impersonation" ||
          f.category === "suspicious-characters",
      ),
      false,
    );
  }
});

test("skeleton normalization handles canonical equivalence", () => {
  assert.equal(confusableSkeleton("é"), confusableSkeleton("e\u0301"));
  assert.equal(
    confusableSkeleton(confusableSkeleton("exаmple")),
    confusableSkeleton("example"),
  );
});
