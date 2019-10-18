import { mkdtemp } from "fs-extra";
import { tmpdir } from "os";
import { join } from "path";

export const makeTempDir = () => {
  return mkdtemp(join(tmpdir(), "recorder-"));
};
