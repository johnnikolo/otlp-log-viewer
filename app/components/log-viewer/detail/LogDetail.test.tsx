import { render, screen } from "@testing-library/react";
import { LogDetail } from "./LogDetail";
import { NormalizedLogRecord } from "@/types/otlp";

const baseRecord: NormalizedLogRecord = {
  id: "1",
  timestampMs: Date.parse("2024-01-01T00:00:00.000Z"),
  severityText: "INFO",
  severityNumber: 9,
  body: "hello",
  bodyType: "text",
  attributes: [],
  serviceName: "checkout",
  serviceNamespace: "",
  serviceVersion: "",
};

describe("LogDetail", () => {
  it("renders the full message body", () => {
    render(<LogDetail record={{ ...baseRecord, body: "full message" }} />);
    expect(screen.getByText("full message")).toBeInTheDocument();
  });

  it("shows trace/span correlation only when present", () => {
    const { rerender } = render(<LogDetail record={baseRecord} />);
    expect(screen.queryByText("Trace ID")).not.toBeInTheDocument();

    rerender(<LogDetail record={{ ...baseRecord, traceId: "abc123" }} />);
    expect(screen.getByText("Trace ID")).toBeInTheDocument();
    expect(screen.getByText("abc123")).toBeInTheDocument();
    expect(screen.queryByText("Span ID")).not.toBeInTheDocument();
  });

  it("always shows timestamp and severity number", () => {
    render(<LogDetail record={{ ...baseRecord, severityNumber: 21 }} />);
    expect(screen.getByText("Severity #")).toBeInTheDocument();
    expect(screen.getByText("21")).toBeInTheDocument();
  });

  it("shows namespace and version only when non-empty", () => {
    const { rerender } = render(<LogDetail record={baseRecord} />);
    expect(screen.queryByText("Namespace")).not.toBeInTheDocument();
    expect(screen.queryByText("Version")).not.toBeInTheDocument();

    rerender(
      <LogDetail
        record={{ ...baseRecord, serviceNamespace: "payments", serviceVersion: "1.2.3" }}
      />,
    );
    expect(screen.getByText("payments")).toBeInTheDocument();
    expect(screen.getByText("1.2.3")).toBeInTheDocument();
  });

  it("renders an attributes table only when attributes exist", () => {
    const { rerender } = render(<LogDetail record={baseRecord} />);
    expect(screen.queryByText("Attributes")).not.toBeInTheDocument();

    rerender(
      <LogDetail
        record={{ ...baseRecord, attributes: [{ key: "user.id", value: "u1" }] }}
      />,
    );
    expect(screen.getByText("Attributes")).toBeInTheDocument();
    expect(screen.getByText("user.id")).toBeInTheDocument();
    expect(screen.getByText("u1")).toBeInTheDocument();
  });

  it("renders every attribute even when keys repeat (unique React keys, see LogDetail's index-based key)", () => {
    render(
      <LogDetail
        record={{
          ...baseRecord,
          attributes: [
            { key: "tag", value: "a" },
            { key: "tag", value: "b" },
          ],
        }}
      />,
    );
    expect(screen.getByText("a")).toBeInTheDocument();
    expect(screen.getByText("b")).toBeInTheDocument();
  });
});
