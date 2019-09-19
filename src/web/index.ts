import * as actions from "./actions";
import { Client } from "./Client";

const qawolf = {
  actions,
  Client
};

export type QAWolf = typeof qawolf;

if (typeof window !== "undefined") {
  (window as any).qawolf = qawolf;
  console.log("loaded qawolf");
}
