import * as actions from "./actions";
import { Executor } from "./Executor";
import * as selector from "./selector";

const qawolf = {
  actions,
  Executor,
  selector
};

if (typeof window !== "undefined") {
  (window as any).qawolf = qawolf;
  console.log("loaded qawolf");
}

export default qawolf;
