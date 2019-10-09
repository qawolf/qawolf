import * as actions from "./actions";
import * as element from "./element";
import * as compare from "./compare";
import * as locate from "./locate";
import * as xpath from "./xpath";

const qawolf = {
  actions,
  compare,
  element,
  locate,
  xpath
};

export type QAWolf = typeof qawolf;

if (typeof window !== "undefined" && !(window as any).qawolf) {
  (window as any).qawolf = qawolf;
  console.log("loaded qawolf");
}
