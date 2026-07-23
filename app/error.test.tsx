import { render, screen, fireEvent } from "@testing-library/react";
import ErrorBoundaryPage from "./error";

describe("Error (app-level boundary)", () => {
  it("logs the error for diagnostics", () => {
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const error = new Error("boom");

    render(<ErrorBoundaryPage error={error} reset={jest.fn()} />);

    expect(consoleErrorSpy).toHaveBeenCalledWith(error);
    consoleErrorSpy.mockRestore();
  });

  it("shows a message and calls reset when Retry is clicked", () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    const reset = jest.fn();

    render(<ErrorBoundaryPage error={new Error("boom")} reset={reset} />);

    expect(screen.getByText(/Something went wrong/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(reset).toHaveBeenCalledTimes(1);

    (console.error as jest.Mock).mockRestore();
  });
});
