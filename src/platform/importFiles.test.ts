import { createBrowserFbxSource } from "./importFiles";

describe("browser FBX source", () => {
  it("keeps the filename and reads the file lazily", async () => {
    const file = new File(["fbx-data"], "walk.fbx", {
      type: "application/octet-stream",
      lastModified: 12,
    });
    const source = createBrowserFbxSource(file);

    expect(source.name).toBe("walk.fbx");
    expect(source.exportName).toBe("walk.fbx");
    expect(new TextDecoder().decode(await source.read())).toBe("fbx-data");
  });
});
