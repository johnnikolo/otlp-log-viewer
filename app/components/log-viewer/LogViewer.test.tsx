import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { LogViewer } from "./LogViewer";
import { fetchLogs } from "@/lib/api";
import { exportRequest, logRecord } from "@/lib/__fixtures__/otlp";
import { ALL_SEVERITY_LEVELS } from "@/lib/utils/severity";

jest.mock("@/lib/api");
const mockFetchLogs = fetchLogs as jest.MockedFunction<typeof fetchLogs>;

function renderLogViewer() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={0}>
        <LogViewer />
      </TooltipProvider>
    </QueryClientProvider>,
  );
}

describe("LogViewer", () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it("shows loading state before data arrives", () => {
    mockFetchLogs.mockReturnValue(new Promise(() => {})); // never resolves
    renderLogViewer();
    expect(screen.getByText("Fetching logs…")).toBeInTheDocument();
  });

  it("renders the table and header stats once data loads", async () => {
    mockFetchLogs.mockResolvedValue(
      exportRequest([
        {
          serviceName: "checkout",
          records: [
            logRecord({ body: { stringValue: "order placed" } }),
            logRecord({
              body: { stringValue: "payment failed" },
              severityNumber: 19,
            }),
          ],
        },
      ]),
    );
    renderLogViewer();

    expect(await screen.findByText("order placed")).toBeInTheDocument();
    expect(screen.getByText("payment failed")).toBeInTheDocument();
    // Header stats: "2 logs" + an ERROR badge (scoped to the header, since the table has badges too).
    expect(
      screen.getByText(
        (_, node) =>
          node?.textContent?.replace(/\s+/g, " ").trim() === "2 logs",
      ),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole("banner")).getByText("ERROR"),
    ).toBeInTheDocument();
  });

  it("renders the severity color legend beneath the histogram once data loads", async () => {
    mockFetchLogs.mockResolvedValue(
      exportRequest([{ serviceName: "svc", records: [logRecord()] }]),
    );
    const { container } = renderLogViewer();
    await screen.findByText("hello"); // default log body - proves data has loaded

    // Scoped to the histogram card to avoid colliding with table's severity badges.
    const histogramCard =
      container.querySelectorAll<HTMLElement>(".bg-surface")[1];
    for (const level of ALL_SEVERITY_LEVELS) {
      expect(
        within(histogramCard).getByText(level, { selector: "span" }),
      ).toBeInTheDocument();
    }
  });

  it("shows the skeleton + retry overlay in both the histogram and table sections on fetch failure", async () => {
    mockFetchLogs.mockRejectedValue(new Error("network down"));
    const { container } = renderLogViewer();

    const failedMessages = await screen.findAllByText("Failed to load logs.");
    expect(failedMessages).toHaveLength(2); // one overlay each for histogram + table

    const retryButtons = screen.getAllByRole("button", { name: "Retry" });
    expect(retryButtons).toHaveLength(2);
    for (const button of retryButtons) {
      expect(button.tagName).toBe("BUTTON");
    }

    // LogViewer distinguishes the two ErrorOverlay call sites by className:
    // the histogram one keeps ErrorOverlay's default "relative", the table one
    // passes "relative ... overflow-hidden" (see LogViewer.tsx). Use that to
    // confirm the *correct* skeleton renders in each, not just "a" skeleton
    // somewhere on the page.
    const histogramOverlay = container.querySelector(
      ".relative:not(.overflow-hidden)",
    );
    const tableOverlay = container.querySelector(".relative.overflow-hidden");
    expect(histogramOverlay).toBeInTheDocument();
    expect(tableOverlay).toBeInTheDocument();

    // HistogramSkeleton renders a fixed 24 placeholder bars (BAR_HEIGHTS_PCT.length).
    expect(histogramOverlay!.querySelectorAll(".animate-pulse")).toHaveLength(
      24,
    );
    // TableSkeleton renders 40 placeholder rows x 4 bars each (severity/time/service/body).
    expect(tableOverlay!.querySelectorAll(".animate-pulse")).toHaveLength(160);
  });

  it("refetches and recovers when retry is clicked after a failure", async () => {
    mockFetchLogs.mockRejectedValueOnce(new Error("network down"));
    renderLogViewer();

    const retryButtons = await screen.findAllByRole("button", {
      name: "Retry",
    });

    mockFetchLogs.mockResolvedValueOnce(
      exportRequest([
        {
          serviceName: "svc",
          records: [logRecord({ body: { stringValue: "recovered" } })],
        },
      ]),
    );
    await userEvent.setup().click(retryButtons[0]);

    expect(await screen.findByText("recovered")).toBeInTheDocument();
    expect(screen.queryByText("Failed to load logs.")).not.toBeInTheDocument();
  });

  it("switches between flat and grouped views", async () => {
    mockFetchLogs.mockResolvedValue(
      exportRequest([
        {
          serviceName: "svc-a",
          records: [logRecord({ body: { stringValue: "log from a" } })],
        },
      ]),
    );
    const user = userEvent.setup();
    renderLogViewer();
    await screen.findByText("log from a");

    await user.click(screen.getByRole("radio", { name: "By Service" }));

    // Grouped view shows the service name as an accordion header instead of
    // the flat table's rows.
    expect(await screen.findByText("svc-a")).toBeInTheDocument();
  });

  it("filtering by time range narrows the visible records", async () => {
    const now = Date.now();
    const recent = logRecord({
      body: { stringValue: "recent log" },
      timeUnixNano: String(BigInt(now) * BigInt(1_000_000)),
    });
    const old = logRecord({
      body: { stringValue: "ancient log" },
      timeUnixNano: String(
        BigInt(now - 30 * 24 * 60 * 60 * 1000) * BigInt(1_000_000),
      ), // 30 days ago
    });
    mockFetchLogs.mockResolvedValue(
      exportRequest([{ serviceName: "svc", records: [recent, old] }]),
    );
    const user = userEvent.setup();
    renderLogViewer();

    // LogViewer defaults to a 24h range, which already excludes the 30-day-old
    // record - switch to "All" first so both are visible before narrowing.
    await screen.findByText("recent log");
    await user.click(screen.getByLabelText("Time range"));
    await user.click(screen.getByRole("option", { name: "All" }));
    expect(await screen.findByText("ancient log")).toBeInTheDocument();

    await user.click(screen.getByLabelText("Time range"));
    await user.click(screen.getByRole("option", { name: "1h" }));

    await waitFor(() =>
      expect(screen.queryByText("ancient log")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("recent log")).toBeInTheDocument();
  });
});
