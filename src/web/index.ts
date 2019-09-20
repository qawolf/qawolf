import * as actions from "./actions";
import { Executor } from "./Executor";
import * as ranking from "./ranking";
import * as selector from "./selector";

const qawolf = {
  actions,
  Executor,
  ranking,
  selector
};

if (typeof window !== "undefined") {
  (window as any).qawolf = qawolf;
  console.log("loaded qawolf");
}

export default qawolf;
