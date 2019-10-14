import * as actions from "./actions";
import * as element from "./element";
import * as locate from "./locate";
import * as match from "./match";
import { Match } from "./match";
import * as timer from "./timer";
import * as xpath from "./xpath";

export * from "./types";

export type Match = Match;

// export the isomorphic (node & browser) module for node
const { compareArrays, compareDescriptorKey, compareDescriptors } = match;
const { waitFor, sleep } = timer;
export {
  compareArrays,
  compareDescriptorKey,
  compareDescriptors,
  waitFor,
  sleep
};

// export the web module for the browser
const webExports = {
  actions,
  element,
  locate,
  match,
  timer,
  xpath
};

export type QAWolfWeb = typeof webExports;

if (typeof window !== "undefined" && typeof window.document !== "undefined") {
  exports = webExports;
}
