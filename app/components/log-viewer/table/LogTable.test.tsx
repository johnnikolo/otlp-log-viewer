import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { LogTable } from "./LogTable";
import { NormalizedLogRecord } from "@/types/otlp";

function renderTable(records: NormalizedLogRecord[], maxHeight?: number) {
  return render(
    <TooltipProvider delayDuration={0}>
      <LogTable records={records} maxHeight={maxHeight} />
    </TooltipProvider>,
  );
}

const mk = (overrides: Partial<NormalizedLogRecord>): NormalizedLogRecord => ({
  id: Math.random().toString(),
  timestampMs: Date.now(),
  severityText: "INFO",
  severityNumber: 9,
  body: "log body",
  bodyType: "text",
  attributes: [],
  serviceName: "svc",
  serviceNamespace: "",
  serviceVersion: "",
  ...overrides,
});

describe("LogTable", () => {
  it("shows an empty-state message when there are no records", () => {
    renderTable([]);
    expect(screen.getByText("No log records found.")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("renders one row per record", () => {
    const records = [
      mk({ id: "1", body: "first" }),
      mk({ id: "2", body: "second" }),
      mk({ id: "3", body: "third" }),
    ];
    renderTable(records);
    expect(screen.getByText("first")).toBeInTheDocument();
    expect(screen.getByText("second")).toBeInTheDocument();
    expect(screen.getByText("third")).toBeInTheDocument();
  });

  it("defaults to sorting by time, descending", () => {
    const older = mk({ id: "old", timestampMs: 1_000, body: "older log" });
    const newer = mk({ id: "new", timestampMs: 2_000, body: "newer log" });
    renderTable([older, newer]);

    const rows = screen
      .getAllByRole("row")
      .filter((r) => r.getAttribute("tabindex") === "0");
    expect(within(rows[0]).getByText("newer log")).toBeInTheDocument();
    expect(within(rows[1]).getByText("older log")).toBeInTheDocument();
  });

  it("re-sorts when a sortable column header is clicked", async () => {
    const a = mk({ id: "a", serviceName: "aaa-service" });
    const b = mk({ id: "b", serviceName: "zzz-service" });
    const user = userEvent.setup();
    renderTable([a, b]);

    await user.click(screen.getByRole("columnheader", { name: "Service" }));

    let dataRows = screen
      .getAllByRole("row")
      .filter((r) => r.getAttribute("tabindex") === "0");
    expect(within(dataRows[0]).getByText("aaa-service")).toBeInTheDocument();

    // Toggling again should flip to descending (enableSortingRemoval: false
    // means it cycles asc <-> desc, never back to an unsorted third state).
    await user.click(screen.getByRole("columnheader", { name: "Service" }));
    dataRows = screen
      .getAllByRole("row")
      .filter((r) => r.getAttribute("tabindex") === "0");
    expect(within(dataRows[0]).getByText("zzz-service")).toBeInTheDocument();
  });

  it("moves the header's sort indicator to whichever column was just clicked", async () => {
    const user = userEvent.setup();
    renderTable([mk({ id: "a" }), mk({ id: "b" })]);

    const timeHeader = screen.getByRole("columnheader", { name: "Time" });
    const serviceHeader = screen.getByRole("columnheader", { name: "Service" });

    // Defaults to sorting by time, so only Time's chevron shows initially.
    expect(timeHeader.querySelector("svg")).not.toBeNull();
    expect(serviceHeader.querySelector("svg")).toBeNull();

    await user.click(serviceHeader);

    expect(serviceHeader.querySelector("svg")).not.toBeNull();
    expect(timeHeader.querySelector("svg")).toBeNull();
  });

  it("does not make the Body column header sortable", () => {
    renderTable([mk({})]);
    const bodyHeader = screen.getByRole("columnheader", { name: "Body" });
    expect(bodyHeader.className).not.toMatch(/cursor-pointer/);
  });

  it("expands only one row at a time (clicking a second row collapses the first)", async () => {
    const a = mk({ id: "a", body: "row a" });
    const b = mk({ id: "b", body: "row b" });
    const user = userEvent.setup();
    renderTable([a, b]);

    const rows = () =>
      screen
        .getAllByRole("row")
        .filter((r) => r.getAttribute("tabindex") === "0");

    await user.click(rows()[0]);
    expect(rows()[0]).toHaveAttribute("aria-expanded", "true");
    expect(rows()[1]).toHaveAttribute("aria-expanded", "false");

    await user.click(rows()[1]);
    expect(rows()[0]).toHaveAttribute("aria-expanded", "false");
    expect(rows()[1]).toHaveAttribute("aria-expanded", "true");
  });

  it("collapses a row when it is clicked again", async () => {
    const user = userEvent.setup();
    renderTable([mk({ id: "a" })]);

    const row = () =>
      screen
        .getAllByRole("row")
        .filter((r) => r.getAttribute("tabindex") === "0")[0];

    await user.click(row());
    expect(row()).toHaveAttribute("aria-expanded", "true");

    await user.click(row());
    expect(row()).toHaveAttribute("aria-expanded", "false");
  });
});
