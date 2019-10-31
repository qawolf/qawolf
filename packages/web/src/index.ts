import * as element from "./element";
import * as find from "./find";
import * as match from "./match";
import { Match } from "./match";
import { Recorder } from "./Recorder";
import { scrollElement } from "./scrollElement";
import * as wait from "./wait";
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
const { sleep, waitFor, waitUntil } = wait;
export {
  compareArrays,
  compareDescriptorKey,
  compareDescriptors,
  countPresentKeys,
  isNil,
  sleep,
  waitFor,
  waitUntil
};

// export the web module for the browser
const webExports = {
  element,
  find,
  match,
  Recorder,
  scrollElement,
  wait,
  xpath
};

export type QAWolfWeb = typeof webExports;

if (typeof window !== "undefined" && typeof window.document !== "undefined") {
  exports = webExports;
}
