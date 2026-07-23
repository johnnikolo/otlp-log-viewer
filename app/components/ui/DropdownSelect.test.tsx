import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DropdownSelect } from "./DropdownSelect";

describe("DropdownSelect", () => {
  const options = [
    { label: "1h", value: 1 },
    { label: "6h", value: 6 },
    { label: "24h", value: 24 },
  ];

  it("shows the trigger label and lists every option when opened", async () => {
    const user = userEvent.setup();
    render(
      <DropdownSelect
        options={options}
        value={6}
        onChange={jest.fn()}
        ariaLabel="Time range"
        triggerClassName=""
        triggerLabel="6h"
      />,
    );

    expect(screen.getByLabelText("Time range")).toHaveTextContent("6h");

    await user.click(screen.getByLabelText("Time range"));

    for (const opt of options) {
      expect(screen.getByRole("option", { name: opt.label })).toBeInTheDocument();
    }
  });

  it("calls onChange with the selected option's value, not its label", async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();
    render(
      <DropdownSelect
        options={options}
        value={6}
        onChange={onChange}
        ariaLabel="Time range"
        triggerClassName=""
        triggerLabel="6h"
      />,
    );

    await user.click(screen.getByLabelText("Time range"));
    await user.click(screen.getByRole("option", { name: "24h" }));

    expect(onChange).toHaveBeenCalledWith(24);
  });

  it("selects correctly even when two options share the same label (keyed on value, not label)", async () => {
    const dupOptions = [
      { label: "Custom", value: "a" },
      { label: "Custom", value: "b" },
    ];
    const onChange = jest.fn();
    const user = userEvent.setup();
    render(
      <DropdownSelect
        options={dupOptions}
        value="a"
        onChange={onChange}
        ariaLabel="Dup test"
        triggerClassName=""
        triggerLabel="Custom"
      />,
    );

    await user.click(screen.getByLabelText("Dup test"));
    const items = screen.getAllByRole("option", { name: "Custom" });
    expect(items).toHaveLength(2);

    await user.click(items[1]);
    expect(onChange).toHaveBeenCalledWith("b");
  });
});
