import { render, screen } from "@testing-library/react";
import { HistogramTooltip } from "./HistogramTooltip";

describe("HistogramTooltip", () => {
  const bucket = { time: 0, label: "10:00", count: 5, errors: 2 };

  it("renders nothing when inactive (recharts passes active=false while not hovered)", () => {
    const { container } = render(
      <HistogramTooltip active={false} payload={[{ payload: bucket }]} label="10:00" />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when there is no payload", () => {
    const { container } = render(<HistogramTooltip active payload={[]} label="10:00" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the bucket label and total count when active", () => {
    render(<HistogramTooltip active payload={[{ payload: bucket }]} label="10:00" />);
    expect(screen.getByText("10:00")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("shows the error count only when the bucket has errors", () => {
    render(<HistogramTooltip active payload={[{ payload: bucket }]} label="10:00" />);
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText(/Errors:/)).toBeInTheDocument();
  });

  it("omits the error line when the bucket has zero errors", () => {
    const clean = { ...bucket, errors: 0 };
    render(<HistogramTooltip active payload={[{ payload: clean }]} label="10:00" />);
    expect(screen.queryByText(/Errors:/)).not.toBeInTheDocument();
  });
});
