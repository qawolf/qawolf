import { Display } from "../src/Display";

it("creates a Display", async () => {
  const display = await Display.start({ height: 1080, width: 1920 });
  expect(display.value).toContain(":");
  await display.stop();
});
