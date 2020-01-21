import { captureLogs } from "./captureLogs";
import * as element from "./element";
import * as event from "./event";
import * as find from "./find";
import * as lang from "./lang";
import { Recorder } from "./Recorder";
import * as select from "./select";
import * as serialize from "./serialize";
import { scroll } from "./scroll";
import * as wait from "./wait";
import * as xpath from "./xpath";

// export the isomorphic (node & browser) module for node
const { htmlToDoc, serializeDocSelector } = serialize;
const { isKeyEvent, isPasteEvent, isTypeEvent } = event;
const {
  compareAttributes,
  compareContent,
  compareDoc,
  matchDocSelector
} = find;
const { decodeHtml, isNil } = lang;
const { sleep, waitFor, waitUntil } = wait;
export {
  compareAttributes,
  compareContent,
  compareDoc,
  decodeHtml,
  htmlToDoc,
  isKeyEvent,
  isNil,
  isPasteEvent,
  isTypeEvent,
  matchDocSelector,
  serializeDocSelector,
  sleep,
  waitFor,
  waitUntil
};

// export the web module for the browser
const webExports = {
  element,
  event,
  find,
  lang,
  Recorder,
  scroll,
  select,
  serialize,
  wait,
  xpath
};

export type QAWolfWeb = typeof webExports;

if (typeof window !== "undefined" && typeof window.document !== "undefined") {
  captureLogs();
  exports = webExports;
}
