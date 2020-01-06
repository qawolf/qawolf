import { sleep } from "@qawolf/web";
import { platform } from "os";
import { Display } from "../src/Display";

it("creates a Display on linux", async () => {
  if (platform() !== "linux") return;

  const display = await Display.start({ height: 1080, width: 1920 });
  if (!display) throw new Error("Display should be created on linux");

  expect(display!.value).toContain(":");

  await sleep(500);
  await display!.stop();
});
