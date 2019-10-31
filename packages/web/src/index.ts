import * as assertions from "./assertions";
import * as element from "./element";
import * as locate from "./locate";
import * as match from "./match";
import { Match } from "./match";
import { Recorder } from "./Recorder";
import { scrollElement } from "./scrollElement";
import * as timer from "./timer";
import * as xpath from "./xpath";

export type Match = Match;

// export the isomorphic (node & browser) module for node
const { hasText } = assertions;
const {
  compareArrays,
  compareDescriptorKey,
  compareDescriptors,
  countPresentKeys,
  isNil
} = match;
const { sleep, waitFor, waitUntil } = timer;
export {
  compareArrays,
  compareDescriptorKey,
  compareDescriptors,
  countPresentKeys,
  hasText,
  isNil,
  sleep,
  waitFor,
  waitUntil
};

// export the web module for the browser
const webExports = {
  assertions,
  element,
  locate,
  match,
  Recorder,
  scrollElement,
  timer,
  xpath
};

export type QAWolfWeb = typeof webExports;

if (typeof window !== "undefined" && typeof window.document !== "undefined") {
  exports = webExports;
}
