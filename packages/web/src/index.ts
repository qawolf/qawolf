import * as element from "./element";
import * as locate from "./locate";
import * as match from "./match";
import { Match } from "./match";
import { Recorder } from "./Recorder";
import { scroll } from "./scroll";
import * as timer from "./timer";
import * as xpath from "./xpath";

export type Match = Match;

// export the isomorphic (node & browser) module for node
const {
  compareArrays,
  compareDescriptorKey,
  compareDescriptors,
  countPresentKeys,
  isNil
} = match;
const { waitFor, sleep } = timer;
export {
  compareArrays,
  compareDescriptorKey,
  compareDescriptors,
  countPresentKeys,
  isNil,
  sleep,
  waitFor
};

// export the web module for the browser
const webExports = {
  element,
  locate,
  match,
  Recorder,
  scroll,
  timer,
  xpath
};

export type QAWolfWeb = typeof webExports;

if (typeof window !== "undefined" && typeof window.document !== "undefined") {
  exports = webExports;
}
