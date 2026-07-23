import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { CopyableId } from "./CopyableId";

// Note: this deliberately uses fireEvent rather than userEvent. userEvent.setup()
// installs its own in-memory navigator.clipboard stub (Clipboard.attachClipboardStubToView),
// which overwrites whatever mock we install here - so it can't be used to test
// our own clipboard success/rejection handling.
describe("CopyableId", () => {
  // jsdom's navigator.clipboard is otherwise a getter-only property; redefine
  // it as configurable so each test can install its own mock.
  const setClipboard = (impl: (text: string) => Promise<void>) => {
    const writeText = jest.fn(impl);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
      writable: true,
    });
    return writeText;
  };

  it("copies the value to the clipboard and shows 'Copied'", async () => {
    const writeText = setClipboard(() => Promise.resolve());
    render(<CopyableId label="Trace ID" value="abc123" />);

    fireEvent.click(screen.getByRole("button"));

    expect(writeText).toHaveBeenCalledWith("abc123");
    expect(await screen.findByText("Copied")).toBeInTheDocument();
  });

  it("shows 'Failed' when the clipboard write rejects (denied permission / insecure context)", async () => {
    setClipboard(() => Promise.reject(new Error("denied")));
    render(<CopyableId label="Span ID" value="def456" />);

    fireEvent.click(screen.getByRole("button"));

    expect(await screen.findByText("Failed")).toBeInTheDocument();
  });

  it("reverts to idle (no text) after the feedback window", async () => {
    jest.useFakeTimers();
    setClipboard(() => Promise.resolve());
    render(<CopyableId label="Trace ID" value="abc123" />);

    fireEvent.click(screen.getByRole("button"));
    await waitFor(() => expect(screen.getByText("Copied")).toBeInTheDocument());

    act(() => {
      jest.advanceTimersByTime(1300);
    });
    await waitFor(() => expect(screen.queryByText("Copied")).not.toBeInTheDocument());

    jest.useRealTimers();
  });

  it("does not propagate the click to an ancestor (e.g. the row it sits inside)", async () => {
    setClipboard(() => Promise.resolve());
    const onRowClick = jest.fn();
    render(
      <div onClick={onRowClick}>
        <CopyableId label="Trace ID" value="abc123" />
      </div>,
    );

    fireEvent.click(screen.getByRole("button"));
    await waitFor(() => expect(screen.getByText("Copied")).toBeInTheDocument());

    expect(onRowClick).not.toHaveBeenCalled();
  });
});
