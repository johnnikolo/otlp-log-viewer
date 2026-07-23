import { render, screen } from "@testing-library/react";
import { HistogramTooltip } from "./HistogramTooltip";
import { TimeBucket } from "@/lib/transform";
import { ALL_SEVERITY_LEVELS } from "@/lib/utils/severity";

const mkBucket = (
  bySeverity: Partial<TimeBucket["bySeverity"]>,
): TimeBucket => {
  const zeroed = {
    FATAL: 0,
    ERROR: 0,
    WARN: 0,
    INFO: 0,
    DEBUG: 0,
    TRACE: 0,
    UNSPECIFIED: 0,
    ...bySeverity,
  };
  return {
    time: 0,
    endTime: 900_000,
    label: "10:00",
    endLabel: "10:15",
    count: Object.values(zeroed).reduce((a, b) => a + b, 0),
    bySeverity: zeroed,
  };
};

describe("HistogramTooltip", () => {
  const bucket = mkBucket({ INFO: 3, ERROR: 2 });

  it("renders nothing when inactive (recharts passes active=false while not hovered)", () => {
    const { container } = render(
      <HistogramTooltip active={false} payload={[{ payload: bucket }]} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when there is no payload", () => {
    const { container } = render(<HistogramTooltip active payload={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the bucket's exact time range and total count", () => {
    render(<HistogramTooltip active payload={[{ payload: bucket }]} />);
    expect(screen.getByText("10:00 – 10:15")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("lists only the severities present in the bucket, each with its own count", () => {
    render(<HistogramTooltip active payload={[{ payload: bucket }]} />);
    expect(screen.getByText("INFO:")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("ERROR:")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.queryByText("WARN:")).not.toBeInTheDocument();
    expect(screen.queryByText("FATAL:")).not.toBeInTheDocument();
  });

  it("lists all 7 severities, most severe first, when every one is present", () => {
    const full = mkBucket({
      FATAL: 1,
      ERROR: 2,
      WARN: 3,
      INFO: 4,
      DEBUG: 5,
      TRACE: 6,
      UNSPECIFIED: 7,
    });
    const { container } = render(
      <HistogramTooltip active payload={[{ payload: full }]} />,
    );

    // First two <p> are the time range and the total; the rest are the
    // per-severity breakdown, one per level.
    const severityLines = Array.from(container.querySelectorAll("p")).slice(2);
    expect(severityLines).toHaveLength(ALL_SEVERITY_LEVELS.length);
    expect(severityLines.map((p) => p.textContent)).toEqual(
      ALL_SEVERITY_LEVELS.map((level) => `${level}: ${full.bySeverity[level]}`),
    );
  });

  it("shows nothing but the total for a bucket with no severities present", () => {
    const empty = mkBucket({});
    render(<HistogramTooltip active payload={[{ payload: empty }]} />);
    for (const level of [
      "FATAL",
      "ERROR",
      "WARN",
      "INFO",
      "DEBUG",
      "TRACE",
      "UNSPECIFIED",
    ]) {
      expect(screen.queryByText(`${level}:`)).not.toBeInTheDocument();
    }
  });
});
