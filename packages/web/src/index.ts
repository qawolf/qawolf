import * as compare from "./compare";
import * as element from "./element";
import * as event from "./event";
import * as find from "./find";
import * as lang from "./lang";
import * as query from "./query";
import { Recorder } from "./Recorder";
import * as select from "./select";
import * as serialize from "./serialize";
import { scroll } from "./scroll";
import * as wait from "./wait";
import * as xpath from "./xpath";

// export the isomorphic (node & browser) module for node
const {
  compareAttributes,
  compareContent,
  compareDoc,
  countComparison
} = compare;
const { htmlToDoc } = serialize;
const { isKeyEvent, isPasteEvent, isTypeEvent } = event;
const { isNil } = lang;
const { sleep, waitFor, waitUntil } = wait;
export {
  compareAttributes,
  compareContent,
  compareDoc,
  countComparison,
  htmlToDoc,
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
  compare,
  element,
  event,
  find,
  query,
  Recorder,
  scroll,
  select,
  serialize,
  wait,
  xpath
};

export type QAWolfWeb = typeof webExports;

if (typeof window !== "undefined" && typeof window.document !== "undefined") {
  exports = webExports;
}
