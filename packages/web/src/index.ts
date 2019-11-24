import * as element from "./element";
import * as event from "./event";
import * as find from "./find";
import * as lang from "./lang";
import * as match from "./match";
import { Match } from "./match";
import { Recorder } from "./Recorder";
import * as select from "./select";
import { scroll } from "./scroll";
import * as wait from "./wait";
import * as xpath from "./xpath";

export type Match = Match;

// export the isomorphic (node & browser) module for node
const { isKeyEvent, isPasteEvent, isTypeEvent } = event;
const {
  compareArrays,
  compareDescriptorKey,
  compareDescriptors,
  countPresentKeys
} = match;

const { isNil } = lang;
const { sleep, waitFor, waitUntil } = wait;
export {
  compareArrays,
  compareDescriptorKey,
  compareDescriptors,
  countPresentKeys,
  isKeyEvent,
  isNil,
  isPasteEvent,
  isTypeEvent,
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
  select,
  wait,
  xpath
};

export type QAWolfWeb = typeof webExports;

if (typeof window !== "undefined" && typeof window.document !== "undefined") {
  exports = webExports;
}
