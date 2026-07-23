import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LogViewerHeader } from "./LogViewerHeader";
import { fetchLogs } from "@/lib/api";
import { exportRequest, logRecord } from "@/lib/__fixtures__/otlp";

jest.mock("@/lib/api");
const mockFetchLogs = fetchLogs as jest.MockedFunction<typeof fetchLogs>;

const baseProps = {
  totalCount: 10,
  errorCount: 0,
  warnCount: 0,
  viewMode: "flat" as const,
  onViewModeChange: jest.fn(),
  rangeMs: 60 * 60 * 1000,
  onRangeChange: jest.fn(),
};

function renderHeader(props: Partial<typeof baseProps> = {}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const utils = render(
    <QueryClientProvider client={queryClient}>
      <LogViewerHeader {...baseProps} {...props} />
    </QueryClientProvider>,
  );
  return {
    ...utils,
    rerenderWithProps: (nextProps: Partial<typeof baseProps>) =>
      utils.rerender(
        <QueryClientProvider client={queryClient}>
          <LogViewerHeader {...baseProps} {...nextProps} />
        </QueryClientProvider>,
      ),
  };
}

describe("LogViewerHeader", () => {
  // Avoids call-count leakage between tests.
  beforeEach(() => {
    mockFetchLogs.mockClear();
  });

  it("hides the stats row while the query is loading", () => {
    mockFetchLogs.mockReturnValue(new Promise(() => {})); // never resolves
    renderHeader();
    expect(screen.queryByText(/logs/)).not.toBeInTheDocument();
  });

  it("shows the stats row once the query has loaded", async () => {
    mockFetchLogs.mockResolvedValue(exportRequest([]));
    renderHeader();
    expect(await screen.findByText(/logs/)).toBeInTheDocument();
  });

  it("shows error/warn counts only when non-zero", async () => {
    mockFetchLogs.mockResolvedValue(exportRequest([]));
    const { rerenderWithProps } = renderHeader({ errorCount: 0, warnCount: 0 });
    await screen.findByText(/logs/);
    // Error/warn counts render as SeverityBadges (ERROR, WARN).
    expect(screen.queryByText("ERROR")).not.toBeInTheDocument();
    expect(screen.queryByText("WARN")).not.toBeInTheDocument();

    rerenderWithProps({ errorCount: 3, warnCount: 2 });
    expect(screen.getByText("ERROR")).toBeInTheDocument();
    expect(screen.getByText("WARN")).toBeInTheDocument();
  });

  it("shows the 'Updated at' timestamp only once the query has resolved at least once", async () => {
    let resolveFetch: (value: ReturnType<typeof exportRequest>) => void;
    mockFetchLogs.mockReturnValue(
      new Promise((resolve) => {
        resolveFetch = resolve;
      }),
    );
    renderHeader();
    expect(screen.queryByText(/Updated at/)).not.toBeInTheDocument();

    resolveFetch!(exportRequest([]));

    expect(await screen.findByText(/Updated at/)).toBeInTheDocument();
  });

  it("clicking refresh re-triggers the logs query", async () => {
    mockFetchLogs.mockResolvedValue(exportRequest([]));
    const user = userEvent.setup();
    renderHeader();
    await screen.findByText(/logs/);
    expect(mockFetchLogs).toHaveBeenCalledTimes(1);

    mockFetchLogs.mockResolvedValueOnce(
      exportRequest([{ serviceName: "svc", records: [logRecord()] }]),
    );
    await user.click(screen.getByLabelText("Refresh now"));

    await waitFor(() => expect(mockFetchLogs).toHaveBeenCalledTimes(2));
  });
});
