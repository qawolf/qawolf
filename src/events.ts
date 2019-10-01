import {
  eventWithTime,
  incrementalData,
  incrementalSnapshotEvent,
  mouseInteractionData
} from "rrweb/typings/types";

export type qaData = incrementalData &
  mouseInteractionData & {
    isTrusted?: boolean;
    text?: string;
    xpath?: string;
  };

export type qaEvent = incrementalSnapshotEvent & {
  data: qaData;
  id: number;
};

export type qaEventWithTime = eventWithTime & qaEvent;
