import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { GroupedLogView } from "./GroupedLogView";
import { NormalizedLogRecord } from "@/types/otlp";

function renderGrouped(records: NormalizedLogRecord[]) {
  return render(
    <TooltipProvider delayDuration={0}>
      <GroupedLogView records={records} />
    </TooltipProvider>,
  );
}

const mk = (
  serviceName: string,
  severityNumber: number,
  overrides: Partial<NormalizedLogRecord> = {},
): NormalizedLogRecord => ({
  id: Math.random().toString(),
  timestampMs: Date.now(),
  severityText: severityNumber >= 17 ? "ERROR" : severityNumber >= 13 ? "WARN" : "INFO",
  severityNumber,
  body: "x",
  bodyType: "text",
  attributes: [],
  serviceName,
  serviceNamespace: "",
  serviceVersion: "",
  ...overrides,
});

describe("GroupedLogView", () => {
  it("renders one accordion group per distinct service", () => {
    renderGrouped([mk("svc-a", 9), mk("svc-b", 9), mk("svc-a", 9)]);
    expect(screen.getByText("svc-a")).toBeInTheDocument();
    expect(screen.getByText("svc-b")).toBeInTheDocument();
  });

  it("shows the record count per group", () => {
    renderGrouped([mk("svc-a", 9), mk("svc-a", 9), mk("svc-b", 9)]);
    // svc-a has 2 logs, svc-b has 1.
    const svcARow = screen.getByText("svc-a").closest("button")!;
    expect(svcARow).toHaveTextContent("2");
    const svcBRow = screen.getByText("svc-b").closest("button")!;
    expect(svcBRow).toHaveTextContent("1");
  });

  it("orders groups with the highest severity first", () => {
    renderGrouped([mk("quiet-svc", 9), mk("noisy-svc", 21)]); // FATAL beats INFO
    const headers = screen.getAllByRole("button").map((b) => b.textContent);
    const noisyIdx = headers.findIndex((t) => t?.includes("noisy-svc"));
    const quietIdx = headers.findIndex((t) => t?.includes("quiet-svc"));
    expect(noisyIdx).toBeLessThan(quietIdx);
  });

  it("breaks a severity tie by record count (more logs first)", () => {
    renderGrouped([
      mk("small-svc", 9),
      mk("big-svc", 9),
      mk("big-svc", 9),
      mk("big-svc", 9),
    ]);
    const headers = screen.getAllByRole("button").map((b) => b.textContent);
    const bigIdx = headers.findIndex((t) => t?.includes("big-svc"));
    const smallIdx = headers.findIndex((t) => t?.includes("small-svc"));
    expect(bigIdx).toBeLessThan(smallIdx);
  });

  it("shows error/warn pill counts only when present", () => {
    renderGrouped([mk("svc-a", 17), mk("svc-a", 13)]); // 1 error, 1 warn
    expect(screen.getByText(/error & fatal/)).toBeInTheDocument();
    expect(screen.getByText(/warn/)).toBeInTheDocument();
  });

  it("expands a group to reveal its logs, and collapses the previous one (single, collapsible accordion)", async () => {
    const user = userEvent.setup();
    renderGrouped([
      mk("svc-a", 9, { body: "log from a" }),
      mk("svc-b", 9, { body: "log from b" }),
    ]);

    expect(screen.queryByText("log from a")).not.toBeInTheDocument();

    await user.click(screen.getByText("svc-a"));
    expect(await screen.findByText("log from a")).toBeInTheDocument();

    await user.click(screen.getByText("svc-b"));
    expect(await screen.findByText("log from b")).toBeInTheDocument();
    expect(screen.queryByText("log from a")).not.toBeInTheDocument();
  });
});
