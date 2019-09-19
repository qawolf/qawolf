import * as actions from "./actions";
import { QAWolfWindow } from "../types";
import { Executor } from "./Executor";

const qawolf = {
  actions,
  Executor
};

if (typeof window !== "undefined") {
  (window as QAWolfWindow).qawolf = qawolf;
  console.log("loaded qawolf");
}

export default qawolf;
