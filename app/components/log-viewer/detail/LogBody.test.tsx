import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { LogBody } from "./LogBody";

// LogBody renders a Radix Tooltip in collapsed mode, which requires a
// TooltipProvider ancestor (normally supplied once at the app root).
function renderBody(props: React.ComponentProps<typeof LogBody>) {
  return render(
    <TooltipProvider delayDuration={0}>
      <LogBody {...props} />
    </TooltipProvider>,
  );
}

describe("LogBody", () => {
  it("collapses newlines into spaces in the (non-expanded) preview", () => {
    renderBody({ body: "line one\nline two", bodyType: "text" });
    expect(screen.getByText("line one line two")).toBeInTheDocument();
  });

  it("shows no tooltip before the trigger is hovered", () => {
    renderBody({ body: "line one\nline two", bodyType: "text" });
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("shows a tooltip with the full (collapsed) body on hover", async () => {
    const user = userEvent.setup();
    renderBody({ body: "line one\nline two", bodyType: "text" });

    await user.hover(screen.getByText("line one line two"));

    expect(await screen.findByRole("tooltip")).toHaveTextContent("line one line two");
  });

  // Closing on unhover is Radix Tooltip's own internal behavior, not
  // anything LogBody implements - not worth testing here.

  it("renders expanded plain text as-is (preserving newlines via whitespace-pre-wrap)", () => {
    const { container } = renderBody({
      body: "line one\nline two",
      bodyType: "text",
      expanded: true,
    });
    expect(container.querySelector("p")).toHaveTextContent("line one line two");
    expect(container.querySelector("p")?.textContent).toBe("line one\nline two");
  });

  it("pretty-prints expanded JSON bodies", () => {
    const { container } = renderBody({ body: '{"a":1}', bodyType: "json", expanded: true });
    expect(container.querySelector("pre")?.textContent).toBe(
      JSON.stringify({ a: 1 }, null, 2),
    );
  });

  it("renders expanded stack traces verbatim", () => {
    const body = "TypeError: bad\n    at foo (file.js:1:1)";
    const { container } = renderBody({ body, bodyType: "stacktrace", expanded: true });
    expect(container.querySelector("pre")?.textContent).toBe(body);
  });
});
