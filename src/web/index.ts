import * as actions from "./actions";
import * as locator from "./locator";
import * as rank from "./rank";
import { runStep } from "./runStep";
import * as xpath from "./xpath";

const qawolf = {
  actions,
  locator,
  rank,
  runStep,
  xpath
};

export type QAWolf = typeof qawolf;

if (typeof window !== "undefined" && !(window as any).qawolf) {
  (window as any).qawolf = qawolf;
  console.log("loaded qawolf");
}
