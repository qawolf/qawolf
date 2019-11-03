import { CONFIG } from "@qawolf/config";
import fs from "fs-extra";
import path from "path";

const qawolfJs = fs.readFileSync(
  path.resolve(path.dirname(require.resolve("@qawolf/web")), "./qawolf.web.js"),
  "utf8"
);

const recordDomJs = `${fs.readFileSync(
  path.resolve(path.dirname(require.resolve("rrweb")), "../dist/rrweb.min.js"),
  "utf8"
)}

if (!window.qaw_rrweb) {
  window.qaw_rrweb = true;
  rrweb.record({ emit: event => qaw_onDomEvent(event) });
}
`;

const recordEventsJs = `window.qaw_recorder = window.qaw_recorder || new qawolf.Recorder("${CONFIG.dataAttribute}", (event) => qaw_onEvent(event));`;

export const bundleJs = (recordDom: boolean, recordEvents: boolean) => {
  let bundle = qawolfJs;
  if (recordDom) bundle += recordDomJs;
  if (recordEvents) bundle += recordEventsJs;
  return bundle;
};
