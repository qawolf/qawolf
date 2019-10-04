import {
  eventWithTime,
  incrementalData,
  incrementalSnapshotEvent,
  mouseInteractionData
} from "rrweb/typings/types";
import { Locator } from "./types";

export type QAData = incrementalData &
  mouseInteractionData & {
    href?: string;
    isTrusted?: boolean;
    properties: Locator;
    text?: string;
    xpath?: string;
  };

export type QAEvent = incrementalSnapshotEvent & {
  data: QAData;
  pageId: number;
};

export type QAEventWithTime = eventWithTime & QAEvent;
