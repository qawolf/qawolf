import * as actions from "./actions";
import * as element from "./element";
import * as locate from "./locate";
import * as match from "./match";
import { Match } from "./match";
import * as xpath from "./xpath";

const qawolf = {
  actions,
  element,
  locate,
  match,
  xpath
};

export type Match = Match;
export type QAWolf = typeof qawolf;

if (typeof window !== "undefined" && !(window as any).qawolf) {
  (window as any).qawolf = qawolf;
  console.log("loaded qawolf");
}

export { actions, element, locate, match, xpath };
