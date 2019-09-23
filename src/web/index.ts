import * as actions from "./actions";
import { Client } from "./Client";
import * as locator from "./locator";
import * as rank from "./rank";
import * as xpath from "./xpath";

const qawolf = {
  actions,
  Client,
  rank,
  locator,
  xpath
};

export type QAWolf = typeof qawolf;

if (typeof window !== "undefined") {
  (window as any).qawolf = qawolf;
  console.log("loaded qawolf");
}
