import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RefreshControl } from "./RefreshControl";

describe("RefreshControl", () => {
  // "click refresh -> onRefresh()" is covered end-to-end by
  // LogViewerHeader.test.tsx; not duplicated here.

  it("disables the refresh button while fetching", () => {
    render(
      <RefreshControl
        onRefresh={jest.fn()}
        isFetching
        autoRefreshMs={null}
        onAutoRefreshChange={jest.fn()}
      />,
    );

    expect(screen.getByLabelText("Refresh now")).toBeDisabled();
  });

  it("labels the interval dropdown 'Off' when auto-refresh is disabled", () => {
    render(
      <RefreshControl
        onRefresh={jest.fn()}
        isFetching={false}
        autoRefreshMs={null}
        onAutoRefreshChange={jest.fn()}
      />,
    );

    expect(screen.getByLabelText("Auto-refresh interval")).toHaveTextContent(
      "Auto: Off",
    );
  });

  it("labels the interval dropdown with the active interval", () => {
    render(
      <RefreshControl
        onRefresh={jest.fn()}
        isFetching={false}
        autoRefreshMs={30_000}
        onAutoRefreshChange={jest.fn()}
      />,
    );

    expect(screen.getByLabelText("Auto-refresh interval")).toHaveTextContent(
      "Auto: 30s",
    );
  });

  it("calls onAutoRefreshChange with the selected interval's ms value", async () => {
    const onAutoRefreshChange = jest.fn();
    const user = userEvent.setup();
    render(
      <RefreshControl
        onRefresh={jest.fn()}
        isFetching={false}
        autoRefreshMs={null}
        onAutoRefreshChange={onAutoRefreshChange}
      />,
    );

    await user.click(screen.getByLabelText("Auto-refresh interval"));
    await user.click(screen.getByRole("option", { name: "10s" }));

    expect(onAutoRefreshChange).toHaveBeenCalledWith(10_000);
  });
});
