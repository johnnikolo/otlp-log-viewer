// Compact large counts for the header stats (e.g. 141234 -> "141K")
const compactNumberFormatter = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export function formatCompactNumber(n: number): string {
  return compactNumberFormatter.format(n);
}

// Try to pretty-print JSON; fall back to raw string
export function prettyPrintJson(str: string): string {
  try {
    return JSON.stringify(JSON.parse(str), null, 2);
  } catch {
    return str;
  }
}
