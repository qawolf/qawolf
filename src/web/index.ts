import * as actions from "./actions";
import { Client } from "./Client";
import * as rank from "./rank";
import * as selector from "./selector";
import * as xpath from "./xpath";

const qawolf = {
  actions,
  Client,
  rank,
  selector,
  xpath
};

export type QAWolf = typeof qawolf;

if (typeof window !== "undefined") {
  (window as any).qawolf = qawolf;
  console.log("loaded qawolf");
}
