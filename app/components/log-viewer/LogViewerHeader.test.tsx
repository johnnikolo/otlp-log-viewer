import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LogViewerHeader } from "./LogViewerHeader";

const baseProps = {
  isLoading: false,
  totalCount: 10,
  errorCount: 0,
  warnCount: 0,
  dataUpdatedAt: 0,
  viewMode: "flat" as const,
  onViewModeChange: jest.fn(),
  rangeMs: 60 * 60 * 1000,
  onRangeChange: jest.fn(),
  onRefresh: jest.fn(),
  isFetching: false,
  autoRefreshMs: null,
  onAutoRefreshChange: jest.fn(),
};

describe("LogViewerHeader", () => {
  it("hides the stats row while loading", () => {
    render(<LogViewerHeader {...baseProps} isLoading />);
    expect(screen.queryByText(/Showing/)).not.toBeInTheDocument();
  });

  it("shows the stats row once loaded", () => {
    render(<LogViewerHeader {...baseProps} isLoading={false} />);
    expect(screen.getByText(/Showing/)).toBeInTheDocument();
  });

  it("shows error/warn counts only when non-zero", () => {
    const { rerender } = render(<LogViewerHeader {...baseProps} errorCount={0} warnCount={0} />);
    expect(screen.queryByText(/error & fatal/)).not.toBeInTheDocument();
    expect(screen.queryByText(/warn/)).not.toBeInTheDocument();

    rerender(<LogViewerHeader {...baseProps} errorCount={3} warnCount={2} />);
    expect(screen.getByText(/error & fatal/)).toBeInTheDocument();
    expect(screen.getByText(/warn/)).toBeInTheDocument();
  });

  it("shows the 'Updated at' timestamp only once data has loaded (dataUpdatedAt > 0)", () => {
    const { rerender } = render(<LogViewerHeader {...baseProps} dataUpdatedAt={0} />);
    expect(screen.queryByText(/Updated at/)).not.toBeInTheDocument();

    rerender(<LogViewerHeader {...baseProps} dataUpdatedAt={Date.now()} />);
    expect(screen.getByText(/Updated at/)).toBeInTheDocument();
  });

  // "select By Service -> view switches" and "select a time range -> records
  // narrow" are already exercised end-to-end (through this same header) by
  // LogViewer.test.tsx's integration tests; not duplicated here.

  it("forwards refresh clicks from the embedded RefreshControl", async () => {
    // The only place this exact interaction is covered: RefreshControl's own
    // test no longer asserts it (see RefreshControl.test.tsx), and
    // LogViewer.test.tsx never clicks the manual refresh button directly.
    const onRefresh = jest.fn();
    const user = userEvent.setup();
    render(<LogViewerHeader {...baseProps} onRefresh={onRefresh} />);

    await user.click(screen.getByLabelText("Refresh now"));

    expect(onRefresh).toHaveBeenCalledTimes(1);
  });
});
