import {
  eventWithTime,
  incrementalData,
  incrementalSnapshotEvent,
  mouseInteractionData
} from "rrweb/typings/types";
import { ElementDescriptor } from "@qawolf/types";

export type QAData = incrementalData &
  mouseInteractionData & {
    href?: string;
    isTrusted?: boolean;
    properties: ElementDescriptor;
    text?: string;
    xpath?: string;
  };

export type QAEvent = incrementalSnapshotEvent & {
  data: QAData;
  pageId: number;
};

export type QAEventWithTime = eventWithTime & QAEvent;
