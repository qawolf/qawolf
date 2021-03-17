import { createContext, FC, useContext, useEffect } from "react";

import { RunProgress } from "../../../lib/types";
import { ConnectRunnerHook, useConnectRunner } from "../hooks/connectRunner";
import { ElementChooserHook, useElementChooser } from "../hooks/elementChooser";
import { EnvHook, useEnv } from "../hooks/env";
import { RunnerHook, useRunner } from "../hooks/runner";
import { useRunProgress } from "../hooks/runProgress";
import { RunTest, useRunTest } from "../hooks/runTest";
import { SelectionHook, useSelection } from "../hooks/selection";
import { TestContext } from "./TestContext";

type RunnerContext = ConnectRunnerHook &
  ElementChooserHook &
  EnvHook &
  RunnerHook &
  SelectionHook & {
    progress: RunProgress | null;
    runTest: RunTest["runTest"];
    stopTest: RunTest["stopTest"];
    shouldRequestRunner: boolean;
  };

export const RunnerContext = createContext<RunnerContext>({
  apiKey: null,
  elementChooserValue: { active: false },
  env: null,
  isRunnerConnected: false,
  isRunnerLoading: false,
  mouseLineNumber: null,
  onSelectionChange: () => null,
  progress: null,
  runner: null,
  runTest: () => null,
  selection: null,
  shouldRequestRunner: false,
  startElementChooser: () => null,
  stopElementChooser: () => null,
  stopTest: () => null,
  wsUrl: null,
});

export const RunnerProvider: FC = ({ children }) => {
  const { mouseLineNumber, onSelectionChange, selection } = useSelection();
  const { isRunnerConnected, runner } = useRunner();

  const { controller, run, suite, team } = useContext(TestContext);

  const {
    elementChooserValue,
    startElementChooser,
    stopElementChooser,
  } = useElementChooser(runner);

  const { env } = useEnv({
    apiKey: team?.api_key,
    inbox: team?.inbox,
    suiteVariables: suite?.environment_variables,
  });

  const { progress, resetProgress } = useRunProgress({ run, runner });

  const { shouldRequestRunner, runTest, stopTest } = useRunTest({
    env,
    resetProgress,
    runner,
  });

  const { apiKey, isRunnerLoading, wsUrl } = useConnectRunner({
    shouldRequestRunner,
    isRunnerConnected,
    runner,
  });

  useEffect(() => {
    controller?.setRunner(runner);
  }, [controller, runner]);

  const value = {
    apiKey,
    elementChooserValue,
    env,
    isRunnerConnected,
    isRunnerLoading,
    mouseLineNumber,
    onSelectionChange,
    progress,
    runner,
    runTest,
    selection,
    shouldRequestRunner,
    startElementChooser,
    stopElementChooser,
    stopTest,
    wsUrl,
  };

  return (
    <RunnerContext.Provider value={value}>{children}</RunnerContext.Provider>
  );
};
