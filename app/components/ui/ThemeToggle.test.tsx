import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ThemeToggle } from "./ThemeToggle";

describe("ThemeToggle", () => {
  beforeEach(() => {
    document.documentElement.classList.remove("dark");
    localStorage.clear();
  });

  it("reflects the current dark state on mount", async () => {
    document.documentElement.classList.add("dark");
    render(<ThemeToggle />);

    const toggle = await screen.findByRole("button", { name: "Toggle theme" });
    expect(toggle).toHaveAttribute("aria-pressed", "true");
  });

  it("reflects the current light state on mount", async () => {
    render(<ThemeToggle />);

    const toggle = await screen.findByRole("button", { name: "Toggle theme" });
    expect(toggle).toHaveAttribute("aria-pressed", "false");
  });

  it("switches to light, updates the html class, and persists to localStorage", async () => {
    document.documentElement.classList.add("dark");
    render(<ThemeToggle />);
    const toggle = await screen.findByRole("button", { name: "Toggle theme" });

    fireEvent.click(toggle);

    await waitFor(() =>
      expect(document.documentElement.classList.contains("dark")).toBe(false),
    );
    expect(localStorage.getItem("theme")).toBe("light");
  });

  it("switches to dark, updates the html class, and persists to localStorage", async () => {
    render(<ThemeToggle />);
    const toggle = await screen.findByRole("button", { name: "Toggle theme" });

    fireEvent.click(toggle);

    await waitFor(() =>
      expect(document.documentElement.classList.contains("dark")).toBe(true),
    );
    expect(localStorage.getItem("theme")).toBe("dark");
  });

  it("still applies the theme to the html class even if localStorage.setItem throws", async () => {
    const setItemSpy = jest
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("storage restricted");
      });
    render(<ThemeToggle />);
    const toggle = await screen.findByRole("button", { name: "Toggle theme" });

    fireEvent.click(toggle);

    await waitFor(() =>
      expect(document.documentElement.classList.contains("dark")).toBe(true),
    );
    setItemSpy.mockRestore();
  });
});
