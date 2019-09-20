import * as actions from "./actions";
import { Executor } from "./Executor";
import * as rank from "./rank";
import * as selector from "./selector";

const qawolf = {
  actions,
  Executor,
  rank,
  selector
};

export type QAWolf = typeof qawolf;

if (typeof window !== "undefined") {
  (window as any).qawolf = qawolf;
  console.log("loaded qawolf");
}

export default qawolf;
