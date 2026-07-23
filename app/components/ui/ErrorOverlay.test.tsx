import { render, screen, fireEvent } from "@testing-library/react";
import { ErrorOverlay } from "./ErrorOverlay";

describe("ErrorOverlay", () => {
  it("renders the provided skeleton behind the error message", () => {
    render(
      <ErrorOverlay skeleton={<div data-testid="skeleton" />} onRetry={jest.fn()} />,
    );
    expect(screen.getByTestId("skeleton")).toBeInTheDocument();
    expect(screen.getByText("Failed to load logs.")).toBeInTheDocument();
  });

  it("calls onRetry when the Retry button is clicked", () => {
    const onRetry = jest.fn();
    render(<ErrorOverlay skeleton={<div />} onRetry={onRetry} />);

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("renders as a real button, not a link", () => {
    render(<ErrorOverlay skeleton={<div />} onRetry={jest.fn()} />);
    const retry = screen.getByRole("button", { name: "Retry" });
    expect(retry.tagName).toBe("BUTTON");
  });
});
