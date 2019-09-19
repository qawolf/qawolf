import { Executor } from "./Executor";
import { BrowserAction } from "./workflow";

type QAWolf = {
  qawolf: {
    Executor: Function & {
      new (actions: BrowserAction[]): Executor;
      prototype: Executor;
    };
  };
};

export type QAWolfWindow = Window & QAWolf;
