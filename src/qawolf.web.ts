import { Executor } from "./Executor";

const qawolf = {
  Executor
};

if (typeof window !== "undefined") {
  (window as any).qawolf = qawolf;
  console.log("loaded qawolf");
}

export default qawolf;
