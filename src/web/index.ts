import * as actions from "./actions";
import { Executor } from "./Executor";

const qawolf = {
  actions,
  Executor
};

if (typeof window !== "undefined") {
  (window as any).qawolf = qawolf;
  console.log("loaded qawolf");
}

export default qawolf;
