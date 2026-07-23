import { formatCompactNumber, prettyPrintJson } from "@/lib/utils/format";

describe("formatCompactNumber", () => {
  it("formats large numbers with a compact suffix", () => {
    // maximumFractionDigits: 1, so this rounds to one decimal, not truncates.
    expect(formatCompactNumber(141_234)).toBe("141.2K");
  });

  it("leaves small numbers as-is", () => {
    expect(formatCompactNumber(42)).toBe("42");
  });
});

describe("prettyPrintJson", () => {
  it("pretty-prints valid JSON", () => {
    expect(prettyPrintJson('{"a":1}')).toBe(JSON.stringify({ a: 1 }, null, 2));
  });

  it("returns the original string when it isn't valid JSON", () => {
    expect(prettyPrintJson("not json")).toBe("not json");
  });
});
