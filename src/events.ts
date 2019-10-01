import {
  eventWithTime,
  incrementalData,
  incrementalSnapshotEvent,
  mouseInteractionData
} from "rrweb/typings/types";

export type qaData = incrementalData &
  mouseInteractionData & {
    isTrusted?: boolean;
    pathname?: string;
    text?: string;
    xpath?: string;
  };

export type qaEvent = incrementalSnapshotEvent & {
  data: qaData;
  id: number;
};

export type qaEventWithTime = eventWithTime & qaEvent;
