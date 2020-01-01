import { Capture } from "@qawolf/screen";
import { CONFIG } from "@qawolf/config";
import { basename } from "path";
import { QAWolfBrowser } from "./QAWolfBrowser";

export const startCapture = async (
  qawolf: QAWolfBrowser,
  videoPath: string
) => {
  // TODO basename(require.main!.filename) -> helper
  // start capture after goto
  qawolf._capture = await Capture.start({
    offset: {
      x: CONFIG.chromeOffsetX,
      y: CONFIG.chromeOffsetY
    },
    savePath: `${videoPath}/${basename(require.main!.filename)}`,
    size: {
      height: qawolf.device.viewport.height,
      width: qawolf.device.viewport.width
    }
  });
};
