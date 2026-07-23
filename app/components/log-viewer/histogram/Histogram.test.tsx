import { render, screen, waitFor } from "@testing-library/react";
import { Histogram } from "./Histogram";
import { NormalizedLogRecord } from "@/types/otlp";

const mk = (timestampMs: number, severityNumber = 9): NormalizedLogRecord => ({
  id: Math.random().toString(),
  timestampMs,
  severityText: severityNumber >= 17 ? "ERROR" : "INFO",
  severityNumber,
  body: "x",
  bodyType: "text",
  attributes: [],
  serviceName: "svc",
  serviceNamespace: "",
  serviceVersion: "",
});

// recharts (via react-smooth) animates bars in on mount and skips drawing a
// rectangle at all for a zero-height (empty) bucket - so the number of
// .recharts-rectangle elements equals the number of *non-empty* buckets, not
// the fixed bucketCount, and only appears after the entrance animation's
// first tick. waitFor lets that pending timer flush before asserting.
async function waitForBars(container: HTMLElement, count: number) {
  await waitFor(() => {
    expect(container.querySelectorAll(".recharts-rectangle")).toHaveLength(count);
  });
}

describe("Histogram", () => {
  it("shows the range label alongside the distribution heading", () => {
    render(<Histogram records={[mk(Date.now())]} rangeMs={60 * 60 * 1000} />);
    expect(screen.getByText(/Log Distribution/)).toHaveTextContent("Last 1h");
  });

  it("shows 'All time' in the heading when rangeMs is null", () => {
    render(<Histogram records={[mk(Date.now())]} rangeMs={null} />);
    expect(screen.getByText(/Log Distribution/)).toHaveTextContent("All time");
  });

  it("renders a chart surface without crashing for an empty record set", () => {
    const { container } = render(<Histogram records={[]} rangeMs={60 * 60 * 1000} />);
    expect(container.querySelector(".recharts-responsive-container")).toBeInTheDocument();
  });

  it("draws no bars when every bucket is empty", async () => {
    const { container } = render(<Histogram records={[]} rangeMs={60 * 60 * 1000} />);
    // Give any pending animation frame a chance to run; there's nothing to draw either way.
    await new Promise((r) => setTimeout(r, 50));
    expect(container.querySelectorAll(".recharts-rectangle")).toHaveLength(0);
  });

  it("draws one bar for a single populated bucket", async () => {
    const { container } = render(
      <Histogram records={[mk(Date.now())]} rangeMs={60 * 60 * 1000} />,
    );
    await waitForBars(container, 1);
  });

  it("draws a separate bar per distinct bucket", async () => {
    const now = Date.now();
    const records = [mk(now), mk(now - 30 * 60 * 1000)]; // ~30 min apart, 1h window / 24 buckets
    const { container } = render(<Histogram records={records} rangeMs={60 * 60 * 1000} />);
    await waitForBars(container, 2);
  });

  it("colors a clean bucket indigo and a majority-error bucket red", async () => {
    const now = Date.now();
    const records = [mk(now, 17), mk(now, 17), mk(now - 700_000, 9)]; // separate buckets
    const { container } = render(<Histogram records={records} rangeMs={60 * 60 * 1000} />);
    await waitForBars(container, 2);

    const fills = Array.from(container.querySelectorAll(".recharts-rectangle")).map((r) =>
      r.getAttribute("fill"),
    );
    expect(fills).toContain("#6366f1"); // clean bucket
    expect(fills).toContain("#ef4444"); // 2/2 errors in that bucket -> mostly-errors
  });

  it("colors a minority-error bucket orange, not red", async () => {
    const now = Date.now();
    const records = [mk(now, 17), mk(now, 9), mk(now, 9)]; // 1/3 errors -> not majority
    const { container } = render(<Histogram records={records} rangeMs={60 * 60 * 1000} />);
    await waitForBars(container, 1);

    const fill = container.querySelector(".recharts-rectangle")?.getAttribute("fill");
    expect(fill).toBe("#f97316");
  });
});
