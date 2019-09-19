import { Executor } from "./Executor";
import { QAWolfWindow } from "./types";

const qawolf = {
  Executor
};

if (typeof window !== "undefined") {
  (window as QAWolfWindow).qawolf = qawolf;
  console.log("loaded qawolf");
}

export default qawolf;
