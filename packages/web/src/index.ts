import * as element from "./element";
import * as event from "./event";
import * as find from "./find";
import * as match from "./match";
import { Match } from "./match";
import { Recorder } from "./Recorder";
import { scroll } from "./scroll";
import * as wait from "./wait";
import * as xpath from "./xpath";

export type Match = Match;

// export the isomorphic (node & browser) module for node
const { isKeyEvent } = event;
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
  isKeyEvent,
  isNil,
  sleep,
  waitFor,
  waitUntil
};

// export the web module for the browser
const webExports = {
  element,
  event,
  find,
  match,
  Recorder,
  scroll,
  wait,
  xpath
};

export type QAWolfWeb = typeof webExports;

if (typeof window !== "undefined" && typeof window.document !== "undefined") {
  exports = webExports;
}
