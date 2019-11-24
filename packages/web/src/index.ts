import * as compare from "./compare";
import * as event from "./event";
import * as lang from "./lang";
import { Recorder } from "./Recorder";
import * as select from "./select";
import { scroll } from "./scroll";
import * as wait from "./wait";
import * as xpath from "./xpath";

// TODO remove
import * as elementToKeep from "./element";
import * as elementToRemove from "./element.remove";
const element = { ...elementToKeep, ...elementToRemove };
import * as findToRemove from "./find.remove";
import * as findToKeep from "./find";
const find = { ...findToKeep, ...findToRemove };
import * as match from "./match.remove";
import { Match } from "./match.remove";

export type Match = Match;

// export the isomorphic (node & browser) module for node
const { compareAttributes, compareContent, compareDoc, parseHtml } = compare;
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
  compareAttributes,
  compareContent,
  compareDoc,
  isKeyEvent,
  isNil,
  isPasteEvent,
  isTypeEvent,
  parseHtml,
  sleep,
  waitFor,
  waitUntil,
  // remove
  compareArrays,
  compareDescriptorKey,
  compareDescriptors,
  countPresentKeys
  // remove
};

// export the web module for the browser
const webExports = {
  compare,
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
