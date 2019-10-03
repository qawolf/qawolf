import {
  eventWithTime,
  incrementalData,
  incrementalSnapshotEvent,
  mouseInteractionData
} from "rrweb/typings/types";
import { Locator } from "./types";

export type QAData = incrementalData &
  mouseInteractionData & {
    isTrusted?: boolean;
    properties: Locator;
    text?: string;
    xpath?: string;
  };

export type QAEvent = incrementalSnapshotEvent & {
  data: QAData;
  pageId: number;
  id: number;
};

// XXX: move these to types file?
export type QAEventWithTime = eventWithTime & QAEvent;
