import { sleep } from "@qawolf/web";
import { mkdtemp } from "fs-extra";
import { tmpdir } from "os";
import { join } from "path";
import { Recorder } from "../src/Recorder";

const makeTempDir = () => {
  return mkdtemp(join(tmpdir(), "recorder-"));
};

it("records a video", async () => {
  const tempDir = await makeTempDir();
  console.log("tempDir", tempDir);
  const recorder = await Recorder.start(tempDir);
  await sleep(2000);
  await recorder.stop();
});

// TODO test we can record the right size based on the desktop emulation...
