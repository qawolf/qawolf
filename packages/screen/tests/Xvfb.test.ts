import { sleep } from "@qawolf/web";
import { platform } from "os";
import { Xvfb } from "../src/Xvfb";

it("creates an Xvfb display on linux", async () => {
  if (platform() !== "linux") return;

  const display = await Xvfb.start({ height: 1080, width: 1920 });
  if (!display) throw new Error("Display should be created on linux");

  expect(display!.screen).toContain(":");

  await sleep(500);
  await display!.stop();
});
