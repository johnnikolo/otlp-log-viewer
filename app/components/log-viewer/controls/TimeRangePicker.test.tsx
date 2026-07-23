import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TimeRangePicker } from "./TimeRangePicker";

describe("TimeRangePicker", () => {
  it("shows 'All time' when value is null", () => {
    render(<TimeRangePicker value={null} onChange={jest.fn()} />);
    expect(screen.getByLabelText("Time range")).toHaveTextContent("All time");
  });

  it("shows the matching preset label for a known value", () => {
    render(<TimeRangePicker value={60 * 60 * 1000} onChange={jest.fn()} />);
    expect(screen.getByLabelText("Time range")).toHaveTextContent("Last 1h");
  });

  // "select All -> onChange(null)" is covered end-to-end by
  // LogViewerHeader.test.tsx; not duplicated here.

  it("calls onChange with the selected preset's ms value", async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();
    render(<TimeRangePicker value={null} onChange={onChange} />);

    await user.click(screen.getByLabelText("Time range"));
    await user.click(screen.getByRole("option", { name: "7d" }));

    expect(onChange).toHaveBeenCalledWith(7 * 24 * 60 * 60 * 1000);
  });
});
