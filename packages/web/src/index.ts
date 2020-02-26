import { buildCssSelector, getAttributeValue } from "./buildCssSelector";
import { captureLogs } from "./captureLogs";
import * as element from "./element";
import * as event from "./event";
import * as find from "./find";
import * as format from "./format";
import * as lang from "./lang";
import { Recorder } from "./Recorder";
import * as serialize from "./serialize";
import { scroll } from "./scroll";
import * as wait from "./wait";
import * as xpath from "./xpath";

// export the isomorphic (node & browser) module for node
const { describeDoc } = format;
const { isKeyEvent, isPasteEvent, isSelectAllEvent, isTypeEvent } = event;
const {
  compareAttributes,
  compareContent,
  compareDoc,
  matchDocSelector
} = find;
const { decodeHtml, isNil } = lang;
const { htmlToDoc, serializeDocSelector } = serialize;
const { sleep, waitFor, waitUntil } = wait;
export {
  compareAttributes,
  compareContent,
  compareDoc,
  describeDoc,
  decodeHtml,
  htmlToDoc,
  isKeyEvent,
  isNil,
  isPasteEvent,
  isSelectAllEvent,
  isTypeEvent,
  matchDocSelector,
  serializeDocSelector,
  sleep,
  waitFor,
  waitUntil
};

// export the web module for the browser
const webExports = {
  buildCssSelector,
  captureLogs,
  element,
  event,
  find,
  format,
  getAttributeValue,
  lang,
  Recorder,
  scroll,
  serialize,
  wait,
  xpath
};

export type QAWolfWeb = typeof webExports;

if (typeof window !== "undefined" && typeof window.document !== "undefined") {
  exports = webExports;
}
