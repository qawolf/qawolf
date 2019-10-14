import * as actions from "./actions";
import * as element from "./element";
import * as locate from "./locate";
import * as match from "./match";
import { Match } from "./match";
import * as timer from "./timer";
import * as xpath from "./xpath";

const webModule = {
  actions,
  element,
  locate,
  match,
  timer,
  xpath
};

export type Match = Match;
export type QAWolfWeb = typeof webModule;

if (typeof window !== "undefined" && !(window as any).qawolf) {
  // set the browser functions on the window
  (window as any).qawolf = webModule;
  console.log("loaded qawolf");
}

// export the isomorphic (node & browser) module
export { match, timer };
