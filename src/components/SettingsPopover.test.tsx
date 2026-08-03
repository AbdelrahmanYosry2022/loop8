import { fireEvent, render, screen } from "@testing-library/react";
import { DEFAULT_EXPORT_SETTINGS } from "../domain/exportSettings";
import { SettingsPopover } from "./SettingsPopover";

describe("SettingsPopover", () => {
  it("emits compact background, resolution, and fps choices", () => {
    const onChange = vi.fn();
    render(<SettingsPopover settings={DEFAULT_EXPORT_SETTINGS} onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: "GREEN" }));
    fireEvent.click(screen.getByRole("button", { name: "2048" }));
    fireEvent.click(screen.getByRole("button", { name: "60" }));

    expect(onChange).toHaveBeenNthCalledWith(1, {
      ...DEFAULT_EXPORT_SETTINGS,
      background: "green",
    });
    expect(onChange).toHaveBeenNthCalledWith(2, {
      ...DEFAULT_EXPORT_SETTINGS,
      resolution: 2048,
    });
    expect(onChange).toHaveBeenNthCalledWith(3, {
      ...DEFAULT_EXPORT_SETTINGS,
      fps: 60,
    });
  });
});
