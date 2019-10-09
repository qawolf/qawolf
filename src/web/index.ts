import * as actions from "./actions";
import * as element from "./element";
import * as rank from "./rank";
import * as xpath from "./xpath";

const qawolf = {
  actions,
  element,
  rank,
  xpath
};

export type QAWolf = typeof qawolf;

if (typeof window !== "undefined" && !(window as any).qawolf) {
  (window as any).qawolf = qawolf;
  console.log("loaded qawolf");
}
