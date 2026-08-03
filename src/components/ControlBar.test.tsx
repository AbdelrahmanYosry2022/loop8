import { fireEvent, render, screen } from "@testing-library/react";
import { DEFAULT_EXPORT_SETTINGS } from "../domain/exportSettings";
import { ControlBar } from "./ControlBar";

describe("ControlBar", () => {
  it("opens another FBX without restarting the app", () => {
    const onAdd = vi.fn();
    render(
      <ControlBar
        loops={1}
        settings={DEFAULT_EXPORT_SETTINGS}
        sourceCount={1}
        disabled={false}
        onAdd={onAdd}
        onBatch={vi.fn()}
        onLoopsChange={vi.fn()}
        onSettingsChange={vi.fn()}
        onExport={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "+ FBX" }));

    expect(onAdd).toHaveBeenCalledOnce();
  });
});
