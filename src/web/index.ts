import * as actions from "./actions";
import * as locator from "./locator";
import * as rank from "./rank";
import * as xpath from "./xpath";

const qawolf = {
  actions,
  locator,
  rank,
  xpath
};

export type QAWolf = typeof qawolf;

if (typeof window !== "undefined" && !(window as any).qawolf) {
  (window as any).qawolf = qawolf;
  console.log("loaded qawolf");
}
