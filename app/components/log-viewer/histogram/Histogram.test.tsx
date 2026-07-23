import { render, screen, waitFor } from "@testing-library/react";
import { Histogram } from "./Histogram";
import { NormalizedLogRecord, SeverityLevel } from "@/types/otlp";
import { ALL_SEVERITY_LEVELS, SEVERITY_HEX } from "@/lib/utils";

// bucketByTime buckets by severityText directly (not derived from
// severityNumber here), so tests pass the level they actually want.
const mk = (timestampMs: number, severityText: SeverityLevel = "INFO"): NormalizedLogRecord => ({
  id: Math.random().toString(),
  timestampMs,
  severityText,
  severityNumber: 0,
  body: "x",
  bodyType: "text",
  attributes: [],
  serviceName: "svc",
  serviceNamespace: "",
  serviceVersion: "",
});

// recharts (via react-smooth) animates bars in on mount and skips drawing a
// rectangle at all for a zero-height (empty) series - so the number of
// .recharts-rectangle elements equals the number of *non-empty* severity
// segments across all buckets, not a fixed count, and only appears after the
// entrance animation's first tick. waitFor lets that pending timer flush
// before asserting.
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

  it("draws one segment for a single populated bucket with one severity", async () => {
    const { container } = render(
      <Histogram records={[mk(Date.now())]} rangeMs={60 * 60 * 1000} />,
    );
    await waitForBars(container, 1);
  });

  it("draws a separate segment per distinct bucket", async () => {
    const now = Date.now();
    const records = [mk(now), mk(now - 30 * 60 * 1000)]; // ~30 min apart, 1h window / 24 buckets
    const { container } = render(<Histogram records={records} rangeMs={60 * 60 * 1000} />);
    await waitForBars(container, 2);
  });

  it("stacks a second segment in the same bucket when it holds more than one severity", async () => {
    const now = Date.now();
    // Same bucket, two different severities -> two stacked segments, not one.
    const records = [mk(now, "INFO"), mk(now, "ERROR")];
    const { container } = render(<Histogram records={records} rangeMs={60 * 60 * 1000} />);
    await waitForBars(container, 2);

    const fills = Array.from(container.querySelectorAll(".recharts-rectangle")).map((r) =>
      r.getAttribute("fill"),
    );
    expect(fills).toContain(SEVERITY_HEX.INFO);
    expect(fills).toContain(SEVERITY_HEX.ERROR);
  });

  it("colors every one of the 7 severities with its own fixed color, stacked most-severe-first", async () => {
    const now = Date.now();
    // One record per severity, all in the same bucket -> 7 stacked segments.
    const records = ALL_SEVERITY_LEVELS.map((level) => mk(now, level));
    const { container } = render(<Histogram records={records} rangeMs={60 * 60 * 1000} />);
    await waitForBars(container, ALL_SEVERITY_LEVELS.length);

    const rects = Array.from(container.querySelectorAll(".recharts-rectangle"));

    // DOM order matches ALL_SEVERITY_LEVELS (most severe first) - proves
    // Histogram renders <Bar> series in that order, not resorted/reversed.
    expect(rects.map((r) => r.getAttribute("fill"))).toEqual(
      ALL_SEVERITY_LEVELS.map((level) => SEVERITY_HEX[level]),
    );

    // Each next segment's y is smaller (higher up the chart) than the last,
    // confirming the most severe segment (FATAL) sits closest to the baseline.
    const ys = rects.map((r) => Number(r.getAttribute("y")));
    for (let i = 1; i < ys.length; i++) {
      expect(ys[i]).toBeLessThan(ys[i - 1]);
    }
  });
});
