import { Executor } from "./Executor";
import { BrowserAction } from "./workflow";

type QAWolf = {
  qawolf: {
    Executor: Function & {
      new (actions: BrowserAction[]): Executor;
    };
  };
};

export type QAWolfWindow = Window & QAWolf;
