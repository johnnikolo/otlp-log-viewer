import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useReactTable, getCoreRowModel } from "@tanstack/react-table";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { LogRow } from "./LogRow";
import { logTableColumns } from "./logTableColumns";
import { NormalizedLogRecord } from "@/types/otlp";

// LogRow takes a real TanStack `Row<NormalizedLogRecord>`, not a plain object
// (it calls row.original, row.getVisibleCells(), cell.column.getSize(), etc.).
// Building one via useReactTable with the app's real column defs exercises the
// exact same row shape LogTable produces, instead of hand-faking the interface.
function Harness({
  record,
  expanded,
  onToggle,
}: {
  record: NormalizedLogRecord;
  expanded: boolean;
  onToggle: () => void;
}) {
  const table = useReactTable({
    data: [record],
    columns: logTableColumns,
    getCoreRowModel: getCoreRowModel(),
  });
  const [row] = table.getRowModel().rows;
  return (
    // LogBody renders a Radix Tooltip on hover, which requires a
    // TooltipProvider ancestor - normally supplied once at the app root
    // (see app/providers.tsx).
    <TooltipProvider delayDuration={400}>
      <LogRow row={row} expanded={expanded} onToggle={onToggle} />
    </TooltipProvider>
  );
}

const record: NormalizedLogRecord = {
  id: "1",
  timestampMs: Date.now(),
  severityText: "INFO",
  severityNumber: 9,
  body: "hello world",
  bodyType: "text",
  attributes: [],
  serviceName: "checkout",
  serviceNamespace: "",
  serviceVersion: "",
};

describe("LogRow", () => {
  it("exposes aria-expanded reflecting the expanded prop", () => {
    const { rerender } = render(
      <Harness record={record} expanded={false} onToggle={jest.fn()} />,
    );
    expect(screen.getByRole("row")).toHaveAttribute("aria-expanded", "false");

    rerender(<Harness record={record} expanded onToggle={jest.fn()} />);
    expect(screen.getByRole("row")).toHaveAttribute("aria-expanded", "true");
  });

  it("renders the expanded LogDetail panel only when expanded", () => {
    const { rerender } = render(
      <Harness record={record} expanded={false} onToggle={jest.fn()} />,
    );
    expect(screen.queryByText("Message")).not.toBeInTheDocument();

    rerender(<Harness record={record} expanded onToggle={jest.fn()} />);
    expect(screen.getByText("Message")).toBeInTheDocument();
  });

  it("calls onToggle on click", () => {
    const onToggle = jest.fn();
    render(<Harness record={record} expanded={false} onToggle={onToggle} />);

    fireEvent.click(screen.getByRole("row"));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("is keyboard-focusable and toggles on Enter and Space", async () => {
    const onToggle = jest.fn();
    const user = userEvent.setup();
    render(<Harness record={record} expanded={false} onToggle={onToggle} />);

    const row = screen.getByRole("row");
    expect(row).toHaveAttribute("tabindex", "0");

    row.focus();
    expect(row).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(onToggle).toHaveBeenCalledTimes(1);

    await user.keyboard(" ");
    expect(onToggle).toHaveBeenCalledTimes(2);
  });

  it("does not toggle on other keys (e.g. Tab)", async () => {
    const onToggle = jest.fn();
    const user = userEvent.setup();
    render(<Harness record={record} expanded={false} onToggle={onToggle} />);

    screen.getByRole("row").focus();
    await user.keyboard("{Tab}");
    expect(onToggle).not.toHaveBeenCalled();
  });
});
