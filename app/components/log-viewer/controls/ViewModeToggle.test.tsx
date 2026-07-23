import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ViewModeToggle } from "./ViewModeToggle";

describe("ViewModeToggle", () => {
  it("marks the current value's item as pressed", () => {
    render(<ViewModeToggle value="flat" onChange={jest.fn()} />);
    expect(screen.getByRole("radio", { name: "Flat" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(screen.getByRole("radio", { name: "By Service" })).toHaveAttribute(
      "aria-checked",
      "false",
    );
  });

  // "click By Service -> onChange('grouped')" is covered end-to-end by
  // LogViewerHeader.test.tsx and LogViewer.test.tsx; not duplicated here.

  it("does not call onChange when clicking the already-selected item (single, non-collapsible)", async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();
    render(<ViewModeToggle value="flat" onChange={onChange} />);

    await user.click(screen.getByRole("radio", { name: "Flat" }));

    expect(onChange).not.toHaveBeenCalled();
  });
});
